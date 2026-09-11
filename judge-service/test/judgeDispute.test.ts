import { describe, it, expect, vi } from "vitest";
import { keccak256, toUtf8Bytes } from "ethers";
import { judgeDispute, TaskSpecMismatchError, WrongDisputeStatusError } from "../src/judgeDispute";
import { STATUS_AWAITING_AI_VERDICT, type ArbitratorLike, type OnChainDispute } from "../src/onchain";
import type { LLMClient } from "../src/types";

const TASK_SPEC_TEXT = "Deliver 10 blog posts of 800 words each on the agreed topics.";
const TASK_SPEC_URI = `data:text/plain,${encodeURIComponent(TASK_SPEC_TEXT)}`;
const TASK_HASH = keccak256(toUtf8Bytes(TASK_SPEC_TEXT));

function makeDispute(overrides: Partial<OnChainDispute> = {}): OnChainDispute {
  return {
    disputeId: 1n,
    clientAgentId: 1n,
    serverAgentId: 2n,
    taskHash: TASK_HASH,
    clientEvidenceURI: `data:text/plain,${encodeURIComponent("Only 4 posts were delivered.")}`,
    serverEvidenceURI: `data:text/plain,${encodeURIComponent("All 10 posts were delivered on time.")}`,
    status: STATUS_AWAITING_AI_VERDICT,
    ...overrides,
  };
}

function fakeLLM(response: string): LLMClient {
  return { complete: async () => response };
}

class FakeArbitrator implements ArbitratorLike {
  public submittedVerdicts: Array<{ disputeId: bigint; outcome: string; score: number }> = [];
  constructor(private readonly dispute: OnChainDispute) {}

  async getDispute(): Promise<OnChainDispute> {
    return this.dispute;
  }

  async submitVerdict(disputeId: bigint, outcome: any, score: number): Promise<unknown> {
    this.submittedVerdicts.push({ disputeId, outcome, score });
    return {};
  }
}

describe("judgeDispute", function () {
  it("verifies the task spec hash, judges the dispute, and submits the verdict on-chain", async function () {
    const arbitrator = new FakeArbitrator(makeDispute());
    const llm = fakeLLM('{"score": 30, "confidence": 0.85, "reasoning": "Only 4 of 10 posts were delivered."}');

    const verdict = await judgeDispute({ disputeId: 1n, taskSpecUri: TASK_SPEC_URI, arbitrator, llm });

    expect(verdict.outcome).toBe("client_wins");
    expect(arbitrator.submittedVerdicts).toEqual([{ disputeId: 1n, outcome: "client_wins", score: 30 }]);
  });

  it("refuses to judge when the task spec doesn't match the on-chain hash", async function () {
    const arbitrator = new FakeArbitrator(makeDispute({ taskHash: keccak256(toUtf8Bytes("something else")) }));
    const llm = fakeLLM('{"score": 30, "confidence": 0.85, "reasoning": "irrelevant"}');

    await expect(judgeDispute({ disputeId: 1n, taskSpecUri: TASK_SPEC_URI, arbitrator, llm })).rejects.toBeInstanceOf(
      TaskSpecMismatchError
    );
    expect(arbitrator.submittedVerdicts).toHaveLength(0);
  });

  it("refuses to judge a dispute that isn't awaiting an AI verdict", async function () {
    const arbitrator = new FakeArbitrator(makeDispute({ status: 1 }));
    const llm = fakeLLM('{"score": 30, "confidence": 0.85, "reasoning": "irrelevant"}');

    await expect(judgeDispute({ disputeId: 1n, taskSpecUri: TASK_SPEC_URI, arbitrator, llm })).rejects.toBeInstanceOf(
      WrongDisputeStatusError
    );
    expect(arbitrator.submittedVerdicts).toHaveLength(0);
  });

  it("does not submit anything on-chain when the LLM output is invalid", async function () {
    const arbitrator = new FakeArbitrator(makeDispute());
    const llm = fakeLLM("not json at all and no braces either");

    await expect(judgeDispute({ disputeId: 1n, taskSpecUri: TASK_SPEC_URI, arbitrator, llm })).rejects.toThrow();
    expect(arbitrator.submittedVerdicts).toHaveLength(0);
  });
});
