/** A single piece of submitted evidence, already fetched to plain text. */
export interface EvidenceDocument {
  uri: string;
  content: string;
}

/** Everything the judge needs to rule on one dispute. */
export interface DisputeContext {
  disputeId: string;
  /** What the client agent and server agent originally agreed the task was. */
  taskSpec: string;
  clientEvidence: EvidenceDocument[];
  serverEvidence: EvidenceDocument[];
}

export type Outcome = "client_wins" | "server_wins" | "split";

export interface Verdict {
  outcome: Outcome;
  /** 0-100, higher meaning the server agent's work was more satisfactory. */
  score: number;
  reasoning: string;
  /** The model's own confidence in this verdict, 0-1. */
  confidence: number;
}

/**
 * Anything that can turn a rubric prompt into raw model output. Kept
 * narrow and provider-agnostic so the verdict engine can be tested without
 * a real LLM: a test double just needs to implement `complete`.
 */
export interface LLMClient {
  complete(prompt: string): Promise<string>;
}
