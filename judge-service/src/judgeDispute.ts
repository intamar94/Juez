import { keccak256, toUtf8Bytes } from "ethers";
import { STATUS_AWAITING_AI_VERDICT, type ArbitratorLike } from "./onchain";
import { fetchEvidence, fetchAllEvidence } from "./evidenceFetcher";
import { adjudicate } from "./verdictEngine";
import { AnthropicLLMClient } from "./anthropicClient";
import { buildVerdictDocument, serializeVerdictDocument } from "./verdictDocument";
import type { DisputeContext, LLMClient, Verdict } from "./types";

export interface JudgeDisputeConfig {
  disputeId: bigint;
  /** URI for the original task specification text, whose hash must match the on-chain taskHash. */
  taskSpecUri: string;
  arbitrator: ArbitratorLike;
  llm?: LLMClient;
  ipfsGateway?: string;
}

export class TaskSpecMismatchError extends Error {
  constructor(expectedHash: string, actualHash: string) {
    super(
      `Task spec at the given URI hashes to ${actualHash}, but the dispute's on-chain taskHash is ${expectedHash}. ` +
        "Refusing to judge against an unverifiable task specification."
    );
    this.name = "TaskSpecMismatchError";
  }
}

export class WrongDisputeStatusError extends Error {
  constructor(disputeId: bigint, status: number) {
    super(`Dispute ${disputeId} is not awaiting an AI verdict (status=${status}).`);
    this.name = "WrongDisputeStatusError";
  }
}

/**
 * End-to-end: pull a dispute off-chain, verify its task spec, build the
 * evidence context, ask the judge for a verdict, publish the reasoning,
 * and post the verdict back on-chain. Returns the verdict for logging.
 */
export async function judgeDispute(config: JudgeDisputeConfig): Promise<Verdict> {
  const dispute = await config.arbitrator.getDispute(config.disputeId);
  if (dispute.status !== STATUS_AWAITING_AI_VERDICT) {
    throw new WrongDisputeStatusError(config.disputeId, dispute.status);
  }

  const taskSpecDoc = await fetchEvidence(config.taskSpecUri, { ipfsGateway: config.ipfsGateway });
  const actualHash = keccak256(toUtf8Bytes(taskSpecDoc.content));
  if (actualHash !== dispute.taskHash) {
    throw new TaskSpecMismatchError(dispute.taskHash, actualHash);
  }

  const [clientEvidence, serverEvidence] = await Promise.all([
    fetchAllEvidence([dispute.clientEvidenceURI], { ipfsGateway: config.ipfsGateway }),
    fetchAllEvidence([dispute.serverEvidenceURI], { ipfsGateway: config.ipfsGateway }),
  ]);

  const context: DisputeContext = {
    disputeId: config.disputeId.toString(),
    taskSpec: taskSpecDoc.content,
    clientEvidence,
    serverEvidence,
  };

  const llm = config.llm ?? new AnthropicLLMClient();
  const verdict = await adjudicate(context, llm);

  const document = buildVerdictDocument(context, verdict);
  const serialized = serializeVerdictDocument(document);
  const verdictURI = `data:application/json;base64,${Buffer.from(serialized).toString("base64")}`;

  await config.arbitrator.submitVerdict(config.disputeId, verdict.outcome, verdict.score, verdictURI, serialized);

  return verdict;
}
