"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffChunks = getDiffChunks;
const github = __importStar(require("@actions/github"));
async function getDiffChunks(token, maxLines = 200, excludePaths = [], excludeExts = []) {
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
        diffText = res.data;
    }
    else if (context.eventName === "pull_request") {
        const pr = context.payload.pull_request;
        if (!pr) {
            throw new Error("Pull request event payload missing PR info");
        }
        const res = await octokit.rest.pulls.get({
            ...context.repo,
            pull_number: pr.number,
            headers: { accept: "application/vnd.github.v3.diff" },
        });
        diffText = res.data;
    }
    if (!diffText)
        return [];
    const files = [];
    const parts = diffText.split(/^diff --git /m).filter(Boolean);
    for (const part of parts) {
        const lines = part.split("\n");
        const header = lines[0];
        const match = header.match(/a\/(\S+)\s+b\/(\S+)/);
        const filename = match ? match[2] : "unknown";
        if (excludePaths.some((p) => filename.startsWith(p)))
            continue;
        if (excludeExts.some((ext) => filename.endsWith(ext)))
            continue;
        for (let i = 0; i < lines.length; i += maxLines) {
            const chunk = lines.slice(i, i + maxLines).join("\n");
            files.push({ filename, chunk });
        }
    }
    return files;
}
