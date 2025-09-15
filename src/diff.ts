import * as github from "@actions/github";
import fetch from "node-fetch";

export async function getDiff(): Promise<string> {
  const { context } = github;

  if (context.eventName === "push") {
    const repo = context.payload.repository;
    if (!repo) {
      throw new Error("Push event payload missing repository info");
    }

    const before = context.payload.before;
    const after = context.payload.after;

    if (!before || !after) {
      throw new Error("Push event payload missing before/after commits");
    }

    const url = repo.compare_url
      .replace("{base}", before)
      .replace("{head}", after);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch diff: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  }

  if (context.eventName === "pull_request") {
    const pr = context.payload.pull_request;
    if (!pr) {
      throw new Error("Pull request event payload missing PR info");
    }

    const diffUrl = pr.diff_url;
    if (!diffUrl) {
      throw new Error("Pull request event payload missing diff_url");
    }

    const res = await fetch(diffUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch diff: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  }

  return "";
}
