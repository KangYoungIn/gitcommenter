import OpenAI from "openai";

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(prompt: string, model: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
