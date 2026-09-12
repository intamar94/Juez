# Judge accuracy eval

Before anyone pays for a verdict, someone should know how often the verdict is right. This is a small,
hand-written eval: 20 synthetic disputes across 9 failure-mode categories (clean wins, partial delivery,
adversarial evidence that omits the disputed requirement, adversarial exaggeration, missing evidence,
subjective specs, deadlines, and genuine 50/50 splits), each with an expected outcome and a one-line
rationale for why that outcome is the right one. See `cases.ts`.

This is a floor, not a ceiling — it's synthetic and was written by the same project that built the judge,
so treat a perfect score here as "didn't fail an easy test," not as "ready to sell." Before charging real
money, replace or extend this with real historical disputes from whatever platform you're selling into,
with outcomes decided by their own human reviewers.

## Running it

Needs a real `ANTHROPIC_API_KEY` in the environment (this repo's own sandbox does not have one, so this
has only been run for wiring, never for a real accuracy number):

```bash
cd judge-service
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run eval
```

Optionally set `EVAL_MODEL` to point at a specific model id.

## What it reports

- Overall accuracy (predicted outcome == expected outcome)
- Accuracy broken down by category — the number that actually matters, since "adversarial_omission" and
  "genuine_split" are much harder than "clear_server_win" and a blended average hides that
- Every miss, with the model's own reasoning printed next to the expected rationale, so a wrong verdict is
  something you can read and understand, not just a number
- Any case where the model's output didn't parse into a valid verdict at all (counted separately from
  accuracy, since `adjudicate()` fails closed rather than guessing — see `verdictEngine.ts`)

Exit code is non-zero if accuracy is below 100% or anything errored, so this can gate CI once there's a
target worth enforcing.
