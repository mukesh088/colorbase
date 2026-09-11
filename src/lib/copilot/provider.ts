import { COPILOT_SYSTEM_PROMPT, userPromptForAction } from "@/lib/copilot/prompts";

function redact(text: string) {
  return text.replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]").slice(0, 240);
}

export function parseModelJson(text: string): unknown {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(trimmed.slice(start, end + 1));
  let lastError: Error | undefined;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("OPENAI_BAD_JSON");
    }
  }
  throw lastError ?? new Error("OPENAI_BAD_JSON");
}

export async function completeCopilotJson(action: string, prompt: string, extra: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("NO_API_KEY");
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: COPILOT_SYSTEM_PROMPT },
          { role: "user", content: userPromptForAction(action, prompt, extra) },
        ],
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "network";
    throw new Error(`OPENAI_NETWORK:${redact(reason)}`);
  }
  if (!res.ok) {
    const body = redact(await res.text());
    throw new Error(`OPENAI_${res.status}:${body}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OPENAI_EMPTY");
  return content;
}
