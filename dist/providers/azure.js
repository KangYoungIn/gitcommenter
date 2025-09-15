"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureOpenAIProvider = void 0;
const openai_1 = require("openai");
class AzureOpenAIProvider {
    constructor(endpoint, apiKey, deployment, apiVersion = "2024-04-01-preview") {
        this.deployment = deployment;
        this.client = new openai_1.AzureOpenAI({
            endpoint,
            apiKey,
            deployment,
            apiVersion,
        });
    }
    async generate(prompt) {
        const response = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 1,
            model: this.deployment,
        });
        return response.choices[0]?.message?.content ?? "";
    }
}
exports.AzureOpenAIProvider = AzureOpenAIProvider;
