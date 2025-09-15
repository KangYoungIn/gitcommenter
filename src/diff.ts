import * as github from "@actions/github";

export async function getDiff(token: string): Promise<string> {
  const octokit = github.getOctokit(token);
  const { context } = github;

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
      headers: {
        accept: "application/vnd.github.v3.diff", 
      },
    });

    return res.data as unknown as string;
  }

  if (context.eventName === "pull_request") {
    const pr = context.payload.pull_request;
    if (!pr) {
      throw new Error("Pull request event payload missing PR info");
    }

    const res = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: pr.number,
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
    });

    return res.data as unknown as string;
  }

  return "";
}
