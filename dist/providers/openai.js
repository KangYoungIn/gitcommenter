"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIProvider {
    constructor(apiKey) {
        this.client = new openai_1.default({ apiKey });
    }
    async generate(prompt, model) {
        const response = await this.client.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content ?? "";
    }
}
exports.OpenAIProvider = OpenAIProvider;
