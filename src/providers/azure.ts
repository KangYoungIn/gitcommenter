import { AzureOpenAI } from "openai";

export class AzureOpenAIProvider {
  private client: AzureOpenAI;
  private deployment: string;

  constructor(endpoint: string, apiKey: string, deployment: string, apiVersion = "2024-04-01-preview") {
    this.deployment = deployment;
    this.client = new AzureOpenAI({
      endpoint,
      apiKey,
      deployment,
      apiVersion,
    });
  }

  async generate(prompt: string): Promise<string> {
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
