import { describe, it, expect } from "vitest";
import { adjudicate, deriveOutcome, InvalidLLMOutputError, SPLIT_MARGIN } from "../src/verdictEngine";
import type { DisputeContext, LLMClient } from "../src/types";

function fakeLLM(response: string): LLMClient {
  return { complete: async () => response };
}

const context: DisputeContext = {
  disputeId: "1",
  taskSpec: "Build a landing page matching the attached Figma file.",
  clientEvidence: [{ uri: "ipfs://client", content: "The page is missing the pricing section entirely." }],
  serverEvidence: [{ uri: "ipfs://server", content: "Here is the deployed page: https://example.com" }],
};

describe("deriveOutcome", function () {
  it("maps low scores to client_wins", function () {
    expect(deriveOutcome(0)).toBe("client_wins");
    expect(deriveOutcome(SPLIT_MARGIN)).toBe("client_wins");
  });

  it("maps high scores to server_wins", function () {
    expect(deriveOutcome(100 - SPLIT_MARGIN)).toBe("server_wins");
    expect(deriveOutcome(100)).toBe("server_wins");
  });

  it("maps the middle band to split", function () {
    expect(deriveOutcome(SPLIT_MARGIN + 1)).toBe("split");
    expect(deriveOutcome(50)).toBe("split");
    expect(deriveOutcome(100 - SPLIT_MARGIN - 1)).toBe("split");
  });
});

describe("adjudicate", function () {
  it("parses a well-formed verdict and derives the outcome from its score", async function () {
    const llm = fakeLLM('{"score": 20, "confidence": 0.9, "reasoning": "The pricing section is missing."}');
    const verdict = await adjudicate(context, llm);
    expect(verdict).toEqual({
      outcome: "client_wins",
      score: 20,
      confidence: 0.9,
      reasoning: "The pricing section is missing.",
    });
  });

  it("rounds fractional scores to the nearest integer", async function () {
    const llm = fakeLLM('{"score": 65.6, "confidence": 0.5, "reasoning": "Mostly done, one section missing."}');
    const verdict = await adjudicate(context, llm);
    expect(verdict.score).toBe(66);
    expect(verdict.outcome).toBe("server_wins");
  });

  it("tolerates a markdown-fenced JSON response", async function () {
    const llm = fakeLLM('```json\n{"score": 90, "confidence": 0.8, "reasoning": "Deliverable matches the spec."}\n```');
    const verdict = await adjudicate(context, llm);
    expect(verdict.outcome).toBe("server_wins");
    expect(verdict.score).toBe(90);
  });

  it("tolerates leading/trailing prose around the JSON object", async function () {
    const llm = fakeLLM('Sure, here is my ruling:\n{"score": 10, "confidence": 0.7, "reasoning": "Nothing was delivered."}\nHope that helps.');
    const verdict = await adjudicate(context, llm);
    expect(verdict.score).toBe(10);
  });

  it("fails closed on unparsable output instead of guessing a verdict", async function () {
    const llm = fakeLLM("I refuse to answer in JSON.");
    await expect(adjudicate(context, llm)).rejects.toBeInstanceOf(InvalidLLMOutputError);
  });

  it("fails closed when required fields are missing", async function () {
    const llm = fakeLLM('{"score": 50}');
    await expect(adjudicate(context, llm)).rejects.toBeInstanceOf(InvalidLLMOutputError);
  });

  it("fails closed when score is out of range", async function () {
    const llm = fakeLLM('{"score": 150, "confidence": 0.5, "reasoning": "x"}');
    await expect(adjudicate(context, llm)).rejects.toBeInstanceOf(InvalidLLMOutputError);
  });

  it("fails closed when confidence is out of range", async function () {
    const llm = fakeLLM('{"score": 50, "confidence": 1.5, "reasoning": "x"}');
    await expect(adjudicate(context, llm)).rejects.toBeInstanceOf(InvalidLLMOutputError);
  });
});
