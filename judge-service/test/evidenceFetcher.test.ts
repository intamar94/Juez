import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchEvidence, fetchAllEvidence } from "../src/evidenceFetcher";

describe("fetchEvidence", function () {
  afterEach(function () {
    vi.unstubAllGlobals();
  });

  it("decodes a plain (percent-encoded) data URI without any network call", async function () {
    const doc = await fetchEvidence("data:text/plain,Hello%20World");
    expect(doc.content).toBe("Hello World");
  });

  it("decodes a base64 data URI", async function () {
    const encoded = Buffer.from("The deliverable met every requirement.").toString("base64");
    const doc = await fetchEvidence(`data:text/plain;base64,${encoded}`);
    expect(doc.content).toBe("The deliverable met every requirement.");
  });

  it("rewrites ipfs:// URIs to the configured gateway before fetching", async function () {
    const fetchMock = vi.fn(async () => new Response("evidence body", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchEvidence("ipfs://bafyExampleCid", { ipfsGateway: "https://custom.gateway/ipfs/" });

    expect(fetchMock).toHaveBeenCalledWith("https://custom.gateway/ipfs/bafyExampleCid", expect.anything());
  });

  it("returns a document describing the failure instead of throwing on HTTP error", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 }))
    );
    const doc = await fetchEvidence("https://example.com/missing");
    expect(doc.content).toContain("404");
  });

  it("returns a document describing the failure instead of throwing on a network error", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network unreachable");
      })
    );
    const doc = await fetchEvidence("https://example.com/unreachable");
    expect(doc.content).toContain("network unreachable");
  });

  it("truncates documents that exceed the size cap", async function () {
    const huge = "x".repeat(30_000);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(huge, { status: 200 }))
    );
    const doc = await fetchEvidence("https://example.com/huge");
    expect(doc.content.length).toBe(20_000);
  });

  it("skips empty URIs when fetching all evidence for a side", async function () {
    const docs = await fetchAllEvidence(["", "data:text/plain,ok"]);
    expect(docs).toHaveLength(1);
    expect(docs[0].content).toBe("ok");
  });
});
