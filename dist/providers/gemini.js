"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generativelanguage_1 = require("@google-ai/generativelanguage");
class GeminiProvider {
    constructor(apiKey) {
        this.client = new generativelanguage_1.DiscussServiceClient({ apiKey });
    }
    async generate(prompt, model) {
        const [result] = await this.client.generateMessage({
            model,
            prompt: { messages: [{ content: prompt }] },
        });
        return result.candidates?.[0]?.content ?? "";
    }
}
exports.GeminiProvider = GeminiProvider;
