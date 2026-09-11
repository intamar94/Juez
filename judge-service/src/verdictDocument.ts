import type { DisputeContext, Verdict } from "./types";

/**
 * The full, human-readable record of a ruling: what was disputed, what
 * evidence existed, and why the judge ruled as it did. This is what gets
 * published (e.g. pinned to IPFS) and pointed to by the on-chain
 * verdictURI/verdictHash, so anyone - including the losing side - can
 * audit exactly what the judge saw and said.
 */
export interface VerdictDocument {
  disputeId: string;
  taskSpec: string;
  clientEvidenceURIs: string[];
  serverEvidenceURIs: string[];
  verdict: Verdict;
  judgedAt: string;
}

export function buildVerdictDocument(context: DisputeContext, verdict: Verdict): VerdictDocument {
  return {
    disputeId: context.disputeId,
    taskSpec: context.taskSpec,
    clientEvidenceURIs: context.clientEvidence.map((d) => d.uri),
    serverEvidenceURIs: context.serverEvidence.map((d) => d.uri),
    verdict,
    judgedAt: new Date().toISOString(),
  };
}

export function serializeVerdictDocument(doc: VerdictDocument): string {
  return JSON.stringify(doc, null, 2);
}
