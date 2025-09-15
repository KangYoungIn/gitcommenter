"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = buildPrompt;
function buildPrompt(template, context) {
    return template
        .replace("{{diff}}", context.diff)
        .replace("{{files}}", context.files.join(", "))
        .replace("{{commit_message}}", context.commitMessage || "");
}
