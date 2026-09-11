import type { EvidenceDocument } from "./types";

const DEFAULT_IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const MAX_CHARS_PER_DOCUMENT = 20_000;
const FETCH_TIMEOUT_MS = 10_000;

function resolveUri(uri: string, ipfsGateway: string): string {
  if (uri.startsWith("ipfs://")) {
    return ipfsGateway + uri.slice("ipfs://".length);
  }
  return uri;
}

/**
 * Fetches one evidence URI as plain text, truncated to a bound the LLM
 * prompt can afford. Data URIs are decoded locally; http(s) and ipfs://
 * URIs are fetched over the network. A failed fetch produces a document
 * that says so, rather than throwing - a missing document is itself
 * evidence the judge should be allowed to weigh (see prompt.ts), and one
 * broken link should not abort the whole arbitration.
 */
export async function fetchEvidence(
  uri: string,
  options: { ipfsGateway?: string } = {}
): Promise<EvidenceDocument> {
  const ipfsGateway = options.ipfsGateway ?? DEFAULT_IPFS_GATEWAY;

  if (uri.startsWith("data:")) {
    try {
      return { uri, content: decodeDataUri(uri).slice(0, MAX_CHARS_PER_DOCUMENT) };
    } catch (err) {
      return { uri, content: `[could not decode data URI: ${String(err)}]` };
    }
  }

  const resolved = resolveUri(uri, ipfsGateway);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(resolved, { signal: controller.signal });
    if (!response.ok) {
      return { uri, content: `[fetch failed: HTTP ${response.status}]` };
    }
    const text = await response.text();
    return { uri, content: text.slice(0, MAX_CHARS_PER_DOCUMENT) };
  } catch (err) {
    return { uri, content: `[fetch failed: ${String(err)}]` };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAllEvidence(
  uris: string[],
  options: { ipfsGateway?: string } = {}
): Promise<EvidenceDocument[]> {
  return Promise.all(uris.filter((u) => u.length > 0).map((u) => fetchEvidence(u, options)));
}

function decodeDataUri(uri: string): string {
  const match = /^data:([^;,]*)?(;base64)?,(.*)$/s.exec(uri);
  if (!match) throw new Error("malformed data URI");
  const [, , isBase64, payload] = match;
  return isBase64 ? Buffer.from(payload, "base64").toString("utf8") : decodeURIComponent(payload);
}
