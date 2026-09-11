import type { DisputeContext, EvidenceDocument } from "./types";

const MAX_DOCS_PER_SIDE = 10;

function renderEvidence(label: string, docs: EvidenceDocument[]): string {
  if (docs.length === 0) {
    return `${label}: (no evidence was submitted)`;
  }
  return [
    `${label}:`,
    ...docs.slice(0, MAX_DOCS_PER_SIDE).map((doc, i) => `  [${label} #${i + 1} - ${doc.uri}]\n${indent(doc.content)}`),
  ].join("\n");
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

/**
 * Builds the arbitration prompt. The rubric asks for a single 0-100 score
 * rather than a separate outcome label, because the score alone determines
 * the outcome downstream (see verdictEngine.ts) - asking the model for both
 * would let them contradict each other.
 */
export function buildArbitrationPrompt(context: DisputeContext): string {
  return `You are Juez, an impartial arbitrator for a dispute between two autonomous agents that transacted under the ERC-8004 "Trustless Agents" registries. A client agent hired a server agent for a task; they now disagree about whether the work was performed well. You did not do the work and have no stake in either side. Judge only from the evidence given.

TASK SPECIFICATION (what was agreed):
${context.taskSpec}

${renderEvidence("CLIENT'S EVIDENCE (client agent's claim / complaint)", context.clientEvidence)}

${renderEvidence("SERVER'S EVIDENCE (server agent's claim / deliverable)", context.serverEvidence)}

Instructions:
- Judge strictly against the task specification, not against an idealized version of the task.
- Weigh only evidence actually presented. Do not invent facts. If evidence is one-sided or missing, say so in your reasoning and judge on what exists.
- Score 0-100: 0 means the server agent's work was a total failure (client fully wins), 100 means the work fully met the spec and the client's complaint is unfounded (server fully wins), and the mid-range means partial fulfilment or a genuine 50/50 dispute (a split outcome).
- Be decisive when the evidence is decisive. Do not default to a middle score just to avoid taking a side.

Respond with ONLY a single JSON object, no markdown fences, no prose before or after it, matching exactly this shape:
{"score": <integer 0-100>, "confidence": <number 0-1>, "reasoning": "<2-6 sentences citing specific evidence>"}`;
}
