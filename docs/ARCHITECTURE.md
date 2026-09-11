# Architecture

## The gap

ERC-8004 gives agents three registries:

- **Identity Registry** — an ERC-721 token per agent; whoever owns the token controls the agent's on-chain identity.
- **Reputation Registry** — a client can call `giveFeedback` to attach a score/tags/URI to a server agent, and the
  rated agent can `appendResponse` to a feedback entry. Cheap, generic, deliberately thin.
- **Validation Registry** — a server agent can request independent validation of a task (`validationRequest`); a
  validator posts a `validationResponse`. This is where stronger guarantees (re-execution, TEE attestation, staked
  committees) are meant to plug in, and the EIP authors note it is "still under active update."

None of the three says what happens when the client and server *disagree*. A client can post negative feedback; the
server has no recourse except appending its own response to the same entry, which doesn't resolve anything — both
sides' claims just sit there next to each other. A server can request validation, but nothing says who the validator
should be or what happens if the client thinks the validator was captured or wrong. This is deliberate: ERC-8004 is
infrastructure, not policy. Juez is one possible policy, built as a consumer of the registries rather than a
modification to them, so it composes with any ERC-8004 deployment without requiring registry changes.

## Design goals, in priority order

1. **Cheap and fast by default.** Most disputes are not high-stakes; requiring a full jury trial for every
   disagreement would make the arbitration layer more expensive than the underlying task.
2. **Contestable when it matters.** A single point of trust (one AI oracle) is fine as a fast default only if there's
   a credible, adversarial-cost-bounded way to challenge it.
3. **The verdict becomes part of the agents' portable reputation**, not a fact that only lives inside Juez. An
   arbitrated outcome that never reaches the Reputation/Validation registries would be strictly less useful than raw
   unarbitrated feedback, since nobody outside Juez could see it happened.
4. **Fail closed.** An arbitrator that guesses when it's unsure is worse than one that refuses to rule. This shows up
   twice: the AI oracle refuses to judge if the task specification it's given doesn't hash to what's on-chain (so it
   can't be tricked into judging against a different task than the one actually agreed), and the verdict engine
   refuses to accept a model response that doesn't parse into a valid, in-range score rather than defaulting to
   "split" or ignoring the malformed field.

## Why two tiers instead of one

A pure-AI arbitrator is fast and cheap but concentrates trust in one oracle operator. A pure-jury arbitrator (like
Kleros) gives strong game-theoretic guarantees but is slow and expensive for every case, including the vast majority
that aren't actually contentious once someone looks at the evidence. Juez uses the AI tier as the default and the
jury as an escape hatch: the AI verdict is only final if *nobody thinks it's worth posting a bond to contest it*.
That means the jury's cost is only paid on the disputes where at least one party believes the AI got it wrong badly
enough to be worth money — which is exactly the set of disputes where a second opinion is worth having.

## Bond economics

- **Opening a dispute costs a bond** (any amount > 0, chosen by the opener). This is returned to whichever side wins
  (or split on a `Split` outcome) — it's spam resistance, not a reward pool.
- **Appealing costs a bond at least as large as the dispute bond.** This prevents a losing side from appealing purely
  to delay resolution for free; if their case is as weak in front of jurors as it was in front of the AI oracle, they
  lose that bond too.
- **Juror stake is separate from the dispute bond.** A juror stakes `MIN_JUROR_STAKE` once to join the pool, and each
  round they vote in puts `JUROR_STAKE_AT_RISK` of that stake on the line. Voting with the eventual majority returns
  the stake plus a pro-rata share of what was slashed from the minority and no-shows; voting against the majority (or
  not revealing a committed vote) loses that fixed amount. This is a standard Schelling-point construction: assuming
  most jurors read the evidence honestly, the focal point ("what did the evidence actually show") is the profitable
  thing to vote for, and free-riding (committing without reading, or without revealing) is strictly dominated.

## Score semantics

The contract stores a single `uint8 score` (0-100) per dispute rather than separate "outcome" and "score" fields
supplied independently. The off-chain judge is asked for one number — 0 meaning the server's work was a total
failure, 100 meaning it fully met the spec — and the `Outcome` enum (`ClientWins` / `ServerWins` / `Split`) is
*derived* from that score by fixed thresholds (`score <= 34` → client, `score >= 66` → server, else split), both
on-chain (juror rounds compute it the same way from vote tallies mapped to 0/50/100) and in the judge service
(`verdictEngine.deriveOutcome`). Asking a model for both an outcome label and a score independently invites the two
to contradict each other (e.g. "ServerWins" with a score of 20); collapsing to one number removes that failure mode
entirely, and it's also exactly the shape `ValidationRegistry.validationResponse` wants for its own `response` field,
so the same score can satisfy both registries without a second judgment call.

## Security considerations and known limitations

- **Oracle trust window.** Between an AI verdict and the appeal deadline, the registered oracle address is a fully
  trusted party for that dispute. Mitigations: the appeal path bounds the cost of an oracle mistake to "someone pays
  a bond and it goes to a jury instead"; `setOracle` is owner-gated so a compromised or misbehaving oracle key can be
  revoked; and every verdict is published as a full reasoning document, not just a number, so a bad AI ruling is
  visible and auditable even before anyone appeals it.
- **Juror pool centralization.** With few jurors, the "honest majority" assumption is fragile — a single wealthy
  actor could stake enough to control every round. This implementation intentionally does not attempt a fix (e.g.
  quadratic staking, reputation-weighted juror eligibility, VRF-sampled subcommittees) because those are exactly the
  kind of policy decisions that should be tuned per-deployment rather than hard-coded; see "Future work."
- **Reentrancy.** All ETH-moving functions (`withdraw`, `withdrawJurorStake`, `finalizeJurorVerdict`) use
  OpenZeppelin's `ReentrancyGuard` and follow checks-effects-interactions; bond/stake settlement uses a pull-payment
  pattern (`pendingWithdrawals`) rather than pushing ETH inline during resolution.
- **Registry write-back is best-effort.** `_resolve` wraps the `ReputationRegistry.appendResponse` and
  `ValidationRegistry.validationResponse` calls in `try/catch` so that a revert in an external registry (e.g. it
  doesn't recognize the feedback index, or has its own access control Juez doesn't satisfy) can never brick
  resolution of the dispute itself. The dispute's own state (`outcome`, `score`, bond payout) is always settled
  regardless of whether the write-back to the registries succeeds.
- **Task spec integrity.** The judge service is handed a `taskSpecUri` out of band (not stored on-chain — only its
  hash is, as `taskHash`) and independently re-hashes its content before judging. This stops a compromised or buggy
  judge-service deployment from being fed a different task description than the one the two agents actually agreed
  to when the dispute was opened.

## Future work

- A `Chainlink VRF`-sampled subcommittee for large juror pools, instead of "every staked juror votes every round."
- Multiple independent AI oracles with their own quorum before a verdict is even eligible to become final
  unappealed, rather than a single registered oracle address.
- A registry of arbitration policies (this repo implements one), so an ERC-8004 agent's metadata could declare which
  arbitrator(s) it accepts before transacting — turning "who decides" into something agreed up front, per
  relationship, rather than a global default.
