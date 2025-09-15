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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiff = getDiff;
const github = __importStar(require("@actions/github"));
const node_fetch_1 = __importDefault(require("node-fetch"));
async function getDiff() {
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
        const res = await (0, node_fetch_1.default)(url);
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
        const res = await (0, node_fetch_1.default)(diffUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch diff: ${res.status} ${res.statusText}`);
        }
        return await res.text();
    }
    return "";
}
