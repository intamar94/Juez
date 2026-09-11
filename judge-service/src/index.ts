import { ArbitratorClient } from "./onchain";
import { judgeDispute } from "./judgeDispute";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

/**
 * CLI entrypoint: judge one dispute and exit.
 *
 *   DISPUTE_ID=3 TASK_SPEC_URI=ipfs://... \
 *   RPC_URL=... ORACLE_PRIVATE_KEY=... ARBITRATOR_ADDRESS=... \
 *   ANTHROPIC_API_KEY=... \
 *   node dist/index.js
 *
 * A production deployment would instead watch for DisputeOpened /
 * EvidenceWindow-closed events and call judgeDispute() per dispute; this
 * single-shot form is kept intentionally simple to review and to run in CI.
 */
async function main() {
  const disputeId = BigInt(requireEnv("DISPUTE_ID"));
  const taskSpecUri = requireEnv("TASK_SPEC_URI");
  const rpcUrl = requireEnv("RPC_URL");
  const oraclePrivateKey = requireEnv("ORACLE_PRIVATE_KEY");
  const arbitratorAddress = requireEnv("ARBITRATOR_ADDRESS");
  const ipfsGateway = process.env.IPFS_GATEWAY;

  const arbitrator = new ArbitratorClient(rpcUrl, oraclePrivateKey, arbitratorAddress);
  const verdict = await judgeDispute({ disputeId, taskSpecUri, arbitrator, ipfsGateway });

  console.log(`Dispute ${disputeId} judged: ${verdict.outcome} (score=${verdict.score}, confidence=${verdict.confidence})`);
  console.log(verdict.reasoning);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
