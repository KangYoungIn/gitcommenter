import * as core from "@actions/core";
import * as github from "@actions/github";
import { buildPrompt } from "./prompt";
import { getDiffChunks, FileDiffChunk } from "./diff";
import { postCommitComment, postPRReview } from "./github";
import { OpenAIProvider } from "./providers/openai";
import { AzureOpenAIProvider } from "./providers/azure";
import { GeminiProvider } from "./providers/gemini";

async function run() {
  try {
    const provider = core.getInput("provider");
    const model = core.getInput("model");
    const template = core.getInput("prompt_template");
    const token = core.getInput("token");

    const excludePaths = core.getInput("exclude_paths")
      ? core.getInput("exclude_paths").split(",").map((s) => s.trim())
      : [];

    const excludeExts = core.getInput("exclude_exts")
      ? core.getInput("exclude_exts").split(",").map((s) => s.trim())
      : [];

    const chunks: FileDiffChunk[] = await getDiffChunks(token, 200, excludePaths, excludeExts);

    if (chunks.length === 0) {
      core.info("No diff chunks found (possibly filtered out). Skipping.");
      return;
    }

    let llm;
    switch (provider) {
      case "openai":
        llm = new OpenAIProvider(core.getInput("openai_api_key"));
        break;
      case "azure":
        llm = new AzureOpenAIProvider(
          core.getInput("azure_endpoint"),
          core.getInput("azure_api_key"),
          core.getInput("azure_deployment") || model,
          core.getInput("azure_api_version") || "2024-04-01-preview"
        );
        break;
      case "gemini":
        llm = new GeminiProvider(core.getInput("gemini_api_key"));
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    let aggregatedResponse = "";
    for (const { filename, chunk } of chunks) {
      const context = {
        diff: chunk,
        files: [filename],
        commitMessage: github.context.payload.head_commit?.message || "",
      };

      const prompt = buildPrompt(template, context);

      core.info(`Generating review for ${filename}...`);
      const partial = await llm.generate(prompt, model);

      aggregatedResponse += `\n[${filename}]\n${partial}\n`;
    }

    if (github.context.eventName === "push") {
      const commitSha = github.context.sha;
      core.info(`Posting commit comment on ${commitSha}`);
      await postCommitComment(token, commitSha, aggregatedResponse);
    } else if (github.context.eventName === "pull_request") {
      const pr = github.context.payload.pull_request;
      if (pr) {
        core.info(`Posting PR review on #${pr.number}`);
        await postPRReview(token, pr.number, aggregatedResponse);
      }
    } else {
      core.info("No supported event type. Only push and pull_request are handled.");
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
