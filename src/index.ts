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

    const chunks: FileDiffChunk[] = await getDiffChunks(token);

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
      const partial = await llm.generate(prompt, model);
      aggregatedResponse += `\n[${filename}] ${partial}`;
    }

    if (github.context.eventName === "push") {
      const commitSha = github.context.sha;
      await postCommitComment(token, commitSha, aggregatedResponse);
    } else if (github.context.eventName === "pull_request") {
      const pr = github.context.payload.pull_request;
      if (pr) {
        await postPRReview(token, pr.number, aggregatedResponse);
      }
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
