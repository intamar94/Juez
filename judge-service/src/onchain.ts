import { Contract, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";

/**
 * Minimal hand-maintained ABI slice: only what the judge oracle needs.
 * Keeping it hand-written (instead of importing Hardhat's generated
 * artifact) lets this package stay independent of the contracts'
 * toolchain; regenerate this if DisputeArbitrator.sol's signatures change.
 */
export const DISPUTE_ARBITRATOR_ABI = [
  "function getDispute(uint256 disputeId) view returns (tuple(uint256 clientAgentId, uint256 serverAgentId, address opener, bytes32 taskHash, uint64 feedbackIndex, bytes32 validationRequestHash, string clientEvidenceURI, string serverEvidenceURI, uint64 evidenceDeadline, uint64 appealDeadline, uint8 status, uint8 outcome, uint8 score, string verdictURI, bytes32 verdictHash, uint256 bond, uint256 jurorRoundId))",
  "function submitAIVerdict(uint256 disputeId, uint8 outcome, uint8 score, string verdictURI, bytes32 verdictHash) external",
  "event DisputeOpened(uint256 indexed disputeId, uint256 indexed clientAgentId, uint256 indexed serverAgentId, address opener, bytes32 taskHash, uint64 feedbackIndex, bytes32 validationRequestHash)",
] as const;

export const STATUS_AWAITING_AI_VERDICT = 2;

export const OUTCOME_TO_ENUM = { client_wins: 1, server_wins: 2, split: 3 } as const;

export interface OnChainDispute {
  disputeId: bigint;
  clientAgentId: bigint;
  serverAgentId: bigint;
  taskHash: string;
  clientEvidenceURI: string;
  serverEvidenceURI: string;
  status: number;
}

/**
 * What judgeDispute.ts actually depends on. ArbitratorClient implements
 * this against a real chain; tests implement it with a plain object so the
 * arbitration logic can be exercised without a live RPC endpoint.
 */
export interface ArbitratorLike {
  getDispute(disputeId: bigint): Promise<OnChainDispute>;
  submitVerdict(
    disputeId: bigint,
    outcome: keyof typeof OUTCOME_TO_ENUM,
    score: number,
    verdictURI: string,
    reasoningDocument: string
  ): Promise<unknown>;
}

export class ArbitratorClient implements ArbitratorLike {
  private readonly contract: Contract;

  constructor(rpcUrl: string, oraclePrivateKey: string, arbitratorAddress: string) {
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(oraclePrivateKey, provider);
    this.contract = new Contract(arbitratorAddress, DISPUTE_ARBITRATOR_ABI, wallet);
  }

  async getDispute(disputeId: bigint): Promise<OnChainDispute> {
    const d = await this.contract.getDispute(disputeId);
    return {
      disputeId,
      clientAgentId: d.clientAgentId,
      serverAgentId: d.serverAgentId,
      taskHash: d.taskHash,
      clientEvidenceURI: d.clientEvidenceURI,
      serverEvidenceURI: d.serverEvidenceURI,
      status: Number(d.status),
    };
  }

  /** Submits the verdict; `reasoning` is hashed and embedded so verifiers can check verdictURI content against verdictHash on-chain. */
  async submitVerdict(
    disputeId: bigint,
    outcome: keyof typeof OUTCOME_TO_ENUM,
    score: number,
    verdictURI: string,
    reasoningDocument: string
  ) {
    const verdictHash = keccak256(toUtf8Bytes(reasoningDocument));
    const tx = await this.contract.submitAIVerdict(disputeId, OUTCOME_TO_ENUM[outcome], score, verdictURI, verdictHash);
    return tx.wait();
  }
}
