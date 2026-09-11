import { z } from "zod";
import type { DisputeContext, LLMClient, Outcome, Verdict } from "./types";
import { buildArbitrationPrompt } from "./prompt";

/** score <= this is a client win; score >= (100 - this) is a server win. */
export const SPLIT_MARGIN = 34;

const RawVerdictSchema = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});

export class InvalidLLMOutputError extends Error {
  constructor(
    public readonly raw: string,
    cause: unknown
  ) {
    super(`Judge LLM did not return a valid verdict: ${String(cause)}`);
    this.name = "InvalidLLMOutputError";
  }
}

/**
 * Extracts a JSON object from raw model output. Models are told to return
 * bare JSON, but this stays lenient about a stray markdown fence or
 * leading/trailing whitespace/prose, since failing arbitration outright on
 * a formatting slip would be worse than a small amount of tolerance here -
 * the content is still strictly schema-validated afterwards.
 */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("no JSON object found in model output");
  }
  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
}

export function deriveOutcome(score: number): Outcome {
  if (score <= SPLIT_MARGIN) return "client_wins";
  if (score >= 100 - SPLIT_MARGIN) return "server_wins";
  return "split";
}

/**
 * Runs one dispute through the judge. Throws InvalidLLMOutputError rather
 * than returning a fallback verdict: arbitration must fail closed, never
 * guess, when the model's output can't be trusted.
 */
export async function adjudicate(context: DisputeContext, llm: LLMClient): Promise<Verdict> {
  const prompt = buildArbitrationPrompt(context);
  const raw = await llm.complete(prompt);

  let parsed: z.infer<typeof RawVerdictSchema>;
  try {
    parsed = RawVerdictSchema.parse(extractJson(raw));
  } catch (cause) {
    throw new InvalidLLMOutputError(raw, cause);
  }

  const score = Math.round(parsed.score);
  return {
    outcome: deriveOutcome(score),
    score,
    reasoning: parsed.reasoning,
    confidence: parsed.confidence,
  };
}
