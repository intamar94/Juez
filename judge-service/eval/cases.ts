import type { DisputeContext, Outcome } from "../src/types";

/**
 * A hand-written eval set for measuring the judge's accuracy before anyone
 * is asked to pay for it. Each case has a `taskSpec` and evidence from both
 * sides, exactly like a real dispute, plus an `expectedOutcome` this
 * author believes is unambiguous from the evidence given. Categories exist
 * so accuracy can be broken down by failure mode instead of one blended
 * number - a judge that's 90% accurate overall but 50% on "adversarial"
 * cases is not something you can sell yet.
 *
 * These are synthetic, not real disputes. They are a floor, not a
 * ceiling: a judge that can't handle these clean-cut cases certainly can't
 * handle messy real ones. Passing this eval is necessary, not sufficient,
 * before charging anyone money.
 */
export interface EvalCase {
  id: string;
  category:
    | "clear_server_win"
    | "clear_client_win"
    | "partial_delivery"
    | "adversarial_omission"
    | "adversarial_exaggeration"
    | "missing_evidence"
    | "subjective_quality"
    | "deadline"
    | "genuine_split";
  context: DisputeContext;
  expectedOutcome: Outcome;
  rationale: string;
}

function ctx(disputeId: string, taskSpec: string, clientText: string, serverText: string): DisputeContext {
  return {
    disputeId,
    taskSpec,
    clientEvidence: clientText ? [{ uri: `eval://${disputeId}/client`, content: clientText }] : [],
    serverEvidence: serverText ? [{ uri: `eval://${disputeId}/server`, content: serverText }] : [],
  };
}

export const EVAL_CASES: EvalCase[] = [
  {
    id: "c01",
    category: "clear_server_win",
    context: ctx(
      "c01",
      "Write and deliver 5 blog posts of at least 800 words each on the topics: SEO basics, email marketing, social media ROI, content calendars, and A/B testing.",
      "The client claims the posts are low quality and wants a refund, but gives no specifics.",
      "Delivered 5 posts, word counts: 850, 910, 830, 875, 900, one per topic requested, delivered via Google Doc link with the client's own comments showing no unresolved edit requests."
    ),
    expectedOutcome: "server_wins",
    rationale: "All 5 posts delivered, all meet the word count, all on-topic. Client's complaint is unsubstantiated.",
  },
  {
    id: "c02",
    category: "clear_server_win",
    context: ctx(
      "c02",
      "Build a REST API with endpoints GET /users, POST /users, GET /users/:id, matching the attached OpenAPI spec, deployed and reachable.",
      "Client says the API 'doesn't work' with no further detail, and refuses to pay.",
      "All three endpoints implemented exactly per the OpenAPI spec. Deployed at a live URL. Postman collection with all 3 endpoints returning 200s attached. Client acknowledged receipt in the project chat log 3 days before opening this dispute and did not report any errors."
    ),
    expectedOutcome: "server_wins",
    rationale: "Objective spec fully met, working deployment demonstrated, client's complaint has zero supporting evidence.",
  },
  {
    id: "c03",
    category: "clear_client_win",
    context: ctx(
      "c03",
      "Design a 10-page pitch deck in the company's brand colors (#1A2B3C primary, #FF6600 accent), delivered as an editable Figma file within 5 business days.",
      "6 business days passed with no deliverable. Client sent 3 follow-up messages, all unanswered. No file was ever shared.",
      "" // no server evidence submitted at all
    ),
    expectedOutcome: "client_wins",
    rationale: "Nothing was delivered, deadline missed, server submitted no evidence at all in its own defense.",
  },
  {
    id: "c04",
    category: "clear_client_win",
    context: ctx(
      "c04",
      "Translate the attached 2,000-word English document into formal European Portuguese, preserving all technical terminology.",
      "The delivered document is in Brazilian Portuguese, not European Portuguese, and is missing the final 400 words entirely (document cuts off mid-sentence).",
      "The server's own evidence is the delivered file, whose text confirms it uses Brazilian spelling conventions (e.g. 'você' constructions, informal register) and does end abruptly before the conclusion section."
    ),
    expectedOutcome: "client_wins",
    rationale: "Server's own submitted evidence corroborates the client's complaint: wrong dialect and incomplete.",
  },
  {
    id: "c05",
    category: "partial_delivery",
    context: ctx(
      "c05",
      "Deliver 10 short-form video ads (15-30 seconds each) for the product launch, each with captions burned in.",
      "Only 6 of the 10 videos were delivered. The remaining 4 are overdue by two weeks with no update.",
      "6 videos delivered, all with burned-in captions, all within the 15-30s spec, confirmed by the client's own download log. Server says the remaining 4 are 'in progress' but provides no draft, no date, and no evidence of work on them."
    ),
    expectedOutcome: "client_wins",
    rationale: "6/10 delivered is a real partial delivery, but 40% of the contracted work is simply missing with no credible path to completion - this weighs the balance toward the client, not an even split.",
  },
  {
    id: "c06",
    category: "partial_delivery",
    context: ctx(
      "c06",
      "Migrate the client's WordPress site (32 pages) to a new host with zero downtime and all internal links preserved.",
      "Migration completed, but 5 of 32 pages return 404 errors due to broken internal links; client has been operating with a partially broken site for a week.",
      "27 of 32 pages migrated correctly and verified working by the client's own QA notes. Server acknowledges the 5 broken pages and has already submitted a fix branch, awaiting client's go-ahead to deploy."
    ),
    expectedOutcome: "split",
    rationale: "Most of the job (27/32, ~84%) was done correctly and the server is actively remediating the rest - real but partial failure, not a fundamental one, and not fully cured either.",
  },
  {
    id: "c07",
    category: "adversarial_omission",
    context: ctx(
      "c07",
      "Build a checkout flow that supports credit card AND PayPal payments, with automated email receipts on successful purchase.",
      "PayPal option is entirely missing from the checkout page - only credit card is available. No email receipts are being sent.",
      "Screenshots showing a polished checkout page with credit card payment working flawlessly, and a demo video of a successful credit-card purchase. (Neither screenshots nor video show a PayPal option or an email receipt at any point.)"
    ),
    expectedOutcome: "client_wins",
    rationale: "The server's evidence looks impressive but is silent on exactly the two requirements the client disputes (PayPal, email receipts) - an omission, not a rebuttal. The judge must notice what's absent, not just what's shown.",
  },
  {
    id: "c08",
    category: "adversarial_omission",
    context: ctx(
      "c08",
      "Provide 3 rounds of revisions on the logo design as part of the package; final files delivered in SVG, PNG, and PDF formats.",
      "Only 1 round of revisions was provided before the server declared the project 'final'. Final files were delivered only as PNG - no SVG or PDF.",
      "A polished final PNG logo file and a message thread showing the client approved 'this version' after round 1. (The thread does not mention SVG, PDF, or further revision rounds anywhere.)"
    ),
    expectedOutcome: "client_wins",
    rationale: "The 'approval' evidence the server cites only covers round 1, and never addresses the missing SVG/PDF formats or the contracted 3 revision rounds - the omission is the whole case.",
  },
  {
    id: "c09",
    category: "adversarial_exaggeration",
    context: ctx(
      "c09",
      "Write product descriptions for 20 SKUs, 100-150 words each, in the brand's established playful tone (see attached style guide).",
      "Claims 'none of the 20 descriptions are usable' and the work is 'a complete waste of money, totally unprofessional', demanding a full refund.",
      "All 20 descriptions delivered, word counts all within 100-150, and text samples show consistent playful tone matching the style guide's examples (puns, second-person address, exclamation points) across all 20 files."
    ),
    expectedOutcome: "server_wins",
    rationale: "The client's language is inflammatory but the actual deliverable, per the server's evidence, meets every stated requirement; unsupported hyperbole ('complete waste', 'totally unprofessional') is not evidence of a spec violation.",
  },
  {
    id: "c10",
    category: "adversarial_exaggeration",
    context: ctx(
      "c10",
      "Set up a CI/CD pipeline that runs the test suite and deploys to staging automatically on every merge to main.",
      "Says the pipeline 'never works' and has 'failed 100% of the time', wants a full refund plus compensation for lost time.",
      "CI/CD logs showing 14 of the last 15 merges to main triggered the pipeline successfully, ran tests, and deployed to staging. One merge failed due to an expired staging credential that the client's own ops team controls, not the server's pipeline config."
    ),
    expectedOutcome: "server_wins",
    rationale: "The evidence directly contradicts the client's '100% failure' claim (14/15 success), and the one failure traces to something outside the server's scope.",
  },
  {
    id: "c11",
    category: "missing_evidence",
    context: ctx(
      "c11",
      "Provide 40 hours of virtual assistant work per the agreed task list (inbox management, calendar scheduling, and data entry).",
      "Claims the assistant 'barely did anything' over the 40 hours billed.",
      "" // server submitted nothing
    ),
    expectedOutcome: "client_wins",
    rationale: "With literally no server-side evidence to weigh against a specific, if terse, client complaint, the judge should not invent a defense the server didn't offer.",
  },
  {
    id: "c12",
    category: "missing_evidence",
    context: ctx(
      "c12",
      "Record and edit a 20-minute explainer video with a professional voiceover, per the attached script.",
      "", // client submitted nothing beyond opening the dispute
      "Delivered a 20-minute video matching the script exactly, with a professional voiceover track, hosted at a working link the client has already viewed (view logged in the platform's own analytics)."
    ),
    expectedOutcome: "server_wins",
    rationale: "No client evidence or specific complaint at all, against a fully documented, spec-matching deliverable the client demonstrably already viewed.",
  },
  {
    id: "c13",
    category: "subjective_quality",
    context: ctx(
      "c13",
      "Write website copy for the homepage 'in a warm, approachable tone that reflects our brand voice' (no style guide attached, no examples given).",
      "Says the tone is 'too corporate and cold', wants a rewrite at no charge.",
      "Delivered copy uses second-person address, short sentences, and includes phrases like 'we're here for you' and 'no jargon, just help' - by common definitions of 'warm and approachable' this reads as meeting a loosely specified bar, though no objective standard was given by either side."
    ),
    expectedOutcome: "split",
    rationale: "The spec itself is vague ('warm, approachable', no reference examples) so neither side can fully prove their reading is 'the' correct one - the honest ruling acknowledges genuine ambiguity rather than picking a side to seem decisive.",
  },
  {
    id: "c14",
    category: "subjective_quality",
    context: ctx(
      "c14",
      "Compose an original 3-minute instrumental track 'in the style of the reference tracks provided' for use as background music.",
      "Says the track 'doesn't sound anything like the references' and wants it redone.",
      "Delivered track is a 3-minute instrumental. Server's own description of the reference tracks: 'upbeat electronic dance music, 128 BPM'. The delivered track, per its own metadata, is a slow acoustic guitar piece at 70 BPM."
    ),
    expectedOutcome: "client_wins",
    rationale: "Even though 'style' is subjective, the server's own submitted facts (genre, tempo) describe something categorically different from the reference - this isn't a close call despite being a 'subjective' spec.",
  },
  {
    id: "c15",
    category: "deadline",
    context: ctx(
      "c15",
      "Deliver the completed market research report by March 1st. Time-sensitive: the client is presenting it to their board on March 2nd.",
      "Report was delivered March 5th, four days late, after the board meeting had already happened. Client says the report is now useless to them.",
      "The report itself is thorough and well-researched, covering everything requested. Server argues the client should still pay in full since the report is high quality."
    ),
    expectedOutcome: "client_wins",
    rationale: "The task spec made the deadline explicitly load-bearing (a specific board meeting); quality of the late deliverable doesn't cure a delay that made it functionally useless for its stated purpose.",
  },
  {
    id: "c16",
    category: "deadline",
    context: ctx(
      "c16",
      "Deliver a first draft of the whitepaper within 2 weeks; no hard external deadline mentioned.",
      "Draft arrived 3 days later than the 2-week estimate. Client wants a 50% discount for the delay.",
      "Draft delivered at day 17 instead of day 14, but is complete and matches the agreed outline. Server communicated the delay 4 days in advance, citing a scope clarification the client itself requested mid-project."
    ),
    expectedOutcome: "server_wins",
    rationale: "A minor, well-communicated slip with no stated hard deadline, partly caused by the client's own mid-project change, doesn't justify a 50% discount when the deliverable itself is complete and correct.",
  },
  {
    id: "c17",
    category: "genuine_split",
    context: ctx(
      "c17",
      "Build a mobile app matching the attached wireframes 'as closely as reasonably possible', accounting for platform (iOS/Android) conventions.",
      "Several screens deviate from the wireframes - navigation is a bottom tab bar instead of the wireframe's hamburger menu.",
      "The bottom tab bar was used because it is the standard iOS/Android convention for apps with this many top-level sections, which the spec explicitly asked to account for; every other element (colors, content, screen count) matches the wireframes exactly."
    ),
    expectedOutcome: "split",
    rationale: "The spec itself created tension between 'match the wireframes' and 'follow platform conventions', and the server made a defensible tradeoff within that tension - this is a genuine judgment call the spec invited, not a clear failure by either side.",
  },
  {
    id: "c18",
    category: "genuine_split",
    context: ctx(
      "c18",
      "Optimize the database queries on the reporting dashboard to 'significantly improve load time'.",
      "Load time went from 8 seconds to 5 seconds - client expected 'significantly' to mean under 2 seconds and is refusing to pay the success bonus.",
      "A 37.5% reduction in load time was achieved (8s to 5s) through query optimization; server argues this qualifies as 'significant' improvement per the plain meaning of the word, since no numeric target was ever agreed."
    ),
    expectedOutcome: "split",
    rationale: "A real, measurable improvement occurred, but 'significantly' was never quantified by either side up front - both readings (37.5% is/isn't 'significant') are defensible, so a full win for either side would be arbitrary.",
  },
  {
    id: "c19",
    category: "clear_server_win",
    context: ctx(
      "c19",
      "Provide customer support coverage for 8 hours/day, 5 days/week for one month, responding to tickets within 2 hours.",
      "Client says response times were 'often too slow'.",
      "Support ticket system export for the full month: 240 tickets, average first response time 47 minutes, 100% of tickets responded to within the 2-hour SLA, zero SLA breaches logged."
    ),
    expectedOutcome: "server_wins",
    rationale: "Objective, complete SLA data shows zero breaches; the client's vague 'often too slow' is directly contradicted by the actual ticket log, which is the most reliable evidence available here.",
  },
  {
    id: "c20",
    category: "adversarial_exaggeration",
    context: ctx(
      "c20",
      "Deliver a fully responsive landing page that works correctly on desktop, tablet, and mobile breakpoints.",
      "Claims the page 'is completely broken on mobile' and unusable.",
      "Screenshots at 375px, 768px, and 1440px widths all show a correctly laid-out page with no overlapping elements or broken navigation. Server also links a live BrowserStack test run across 6 real mobile devices, all passing."
    ),
    expectedOutcome: "server_wins",
    rationale: "Direct, verifiable, multi-device evidence contradicts a strong but unsupported claim ('completely broken'); the specificity and verifiability of the server's evidence should outweigh an unsubstantiated assertion.",
  },
];
