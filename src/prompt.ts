export function buildPrompt(
  template: string,
  context: { diff: string; files: string[]; commitMessage: string }
) {
  return template
    .replace("{{diff}}", context.diff)
    .replace("{{files}}", context.files.join(", "))
    .replace("{{commit_message}}", context.commitMessage || "");
}
