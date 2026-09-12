import { EVAL_CASES, type EvalCase } from "./cases";
import { adjudicate, InvalidLLMOutputError } from "../src/verdictEngine";
import { AnthropicLLMClient } from "../src/anthropicClient";
import type { Outcome, Verdict } from "../src/types";

interface CaseResult {
  case: EvalCase;
  verdict?: Verdict;
  correct?: boolean;
  error?: string;
}

function outcomeLabel(o: Outcome): string {
  return { client_wins: "client", server_wins: "server", split: "split" }[o];
}

async function main() {
  const model = process.env.EVAL_MODEL; // undefined -> AnthropicLLMClient's own default
  const llm = new AnthropicLLMClient(model ? { model } : {});

  const results: CaseResult[] = [];

  for (const c of EVAL_CASES) {
    process.stdout.write(`${c.id} (${c.category})... `);
    try {
      const verdict = await adjudicate(c.context, llm);
      const correct = verdict.outcome === c.expectedOutcome;
      results.push({ case: c, verdict, correct });
      console.log(
        `${correct ? "OK" : "MISS"}  expected=${outcomeLabel(c.expectedOutcome)} got=${outcomeLabel(verdict.outcome)} (score=${verdict.score})`
      );
    } catch (err) {
      const message = err instanceof InvalidLLMOutputError ? err.message : String(err);
      results.push({ case: c, error: message });
      console.log(`ERROR  ${message}`);
    }
  }

  console.log("\n" + "=".repeat(72));

  const scored = results.filter((r) => r.correct !== undefined);
  const correct = scored.filter((r) => r.correct).length;
  const errored = results.length - scored.length;

  console.log(`Overall: ${correct}/${scored.length} correct (${((correct / scored.length) * 100).toFixed(1)}%)`);
  if (errored > 0) console.log(`Errored (excluded from accuracy): ${errored}`);

  const byCategory = new Map<string, { correct: number; total: number }>();
  for (const r of scored) {
    const entry = byCategory.get(r.case.category) ?? { correct: 0, total: 0 };
    entry.total++;
    if (r.correct) entry.correct++;
    byCategory.set(r.case.category, entry);
  }
  console.log("\nBy category:");
  for (const [category, { correct, total }] of byCategory) {
    console.log(`  ${category.padEnd(24)} ${correct}/${total}`);
  }

  const misses = results.filter((r) => r.correct === false);
  if (misses.length > 0) {
    console.log("\nMisses:");
    for (const r of misses) {
      console.log(`  [${r.case.id}] expected ${outcomeLabel(r.case.expectedOutcome)}, got ${outcomeLabel(r.verdict!.outcome)} (score ${r.verdict!.score})`);
      console.log(`    rationale: ${r.case.rationale}`);
      console.log(`    model reasoning: ${r.verdict!.reasoning}`);
    }
  }

  if (errored > 0) {
    console.log("\nErrors:");
    for (const r of results.filter((r) => r.error)) {
      console.log(`  [${r.case.id}] ${r.error}`);
    }
  }

  if (scored.length > 0 && correct / scored.length < 1 && errored === 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
