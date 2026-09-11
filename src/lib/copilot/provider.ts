import { COPILOT_SYSTEM_PROMPT, userPromptForAction } from "@/lib/copilot/prompts";

export async function completeCopilotJson(action: string, prompt: string, extra: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("NO_API_KEY");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COPILOT_SYSTEM_PROMPT },
        { role: "user", content: userPromptForAction(action, prompt, extra) },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OPENAI_${res.status}:${body.slice(0, 180)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OPENAI_EMPTY");
  return content;
}
