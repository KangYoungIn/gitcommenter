import { DiscussServiceClient } from "@google-ai/generativelanguage";

export class GeminiProvider {
  private client: DiscussServiceClient;

  constructor(apiKey: string) {
    this.client = new DiscussServiceClient({ apiKey });
  }

  async generate(prompt: string, model: string): Promise<string> {
    const [result] = await this.client.generateMessage({
      model,
      prompt: { messages: [{ content: prompt }] },
    });
    return result.candidates?.[0]?.content ?? "";
  }
}
