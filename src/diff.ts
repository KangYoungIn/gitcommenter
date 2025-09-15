import * as github from "@actions/github";

export interface FileDiffChunk {
  filename: string;
  chunk: string;
}

export async function getDiffChunks(token: string, maxLines = 200): Promise<FileDiffChunk[]> {
  const octokit = github.getOctokit(token);
  const { context } = github;

  let diffText = "";

  if (context.eventName === "push") {
    const before = context.payload.before;
    const after = context.payload.after;

    if (!before || !after) {
      throw new Error("Push event payload missing before/after commits");
    }

    const res = await octokit.rest.repos.compareCommits({
      ...context.repo,
      base: before,
      head: after,
      headers: { accept: "application/vnd.github.v3.diff" },
    });

    diffText = res.data as unknown as string;
  } else if (context.eventName === "pull_request") {
    const pr = context.payload.pull_request;
    if (!pr) {
      throw new Error("Pull request event payload missing PR info");
    }

    const res = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: pr.number,
      headers: { accept: "application/vnd.github.v3.diff" },
    });

    diffText = res.data as unknown as string;
  }

  if (!diffText) return [];

  const files: FileDiffChunk[] = [];
  const parts = diffText.split(/^diff --git /m).filter(Boolean);

  for (const part of parts) {
    const lines = part.split("\n");
    const header = lines[0]; 
    const match = header.match(/a\/(\S+)\s+b\/(\S+)/);
    const filename = match ? match[2] : "unknown";

    for (let i = 0; i < lines.length; i += maxLines) {
      const chunk = lines.slice(i, i + maxLines).join("\n");
      files.push({ filename, chunk });
    }
  }

  return files;
}
