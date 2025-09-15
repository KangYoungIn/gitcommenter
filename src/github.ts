import * as github from "@actions/github";

export async function postCommitComment(token: string, commitSha: string, body: string) {
  const octokit = github.getOctokit(token);
  await octokit.rest.repos.createCommitComment({
    ...github.context.repo,
    commit_sha: commitSha,
    body,
  });
}

export async function postPRReview(token: string, prNumber: number, body: string) {
  const octokit = github.getOctokit(token);
  await octokit.rest.pulls.createReview({
    ...github.context.repo,
    pull_number: prNumber,
    event: "COMMENT",
    body,
  });
}
