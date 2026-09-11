import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const CLIENT_AGENT_ID = 1n;
const SERVER_AGENT_ID = 2n;

const Outcome = { Unresolved: 0, ClientWins: 1, ServerWins: 2, Split: 3 } as const;

const EVIDENCE_WINDOW = 3 * 24 * 60 * 60;
const APPEAL_WINDOW = 2 * 24 * 60 * 60;
const JUROR_COMMIT_WINDOW = 2 * 24 * 60 * 60;
const JUROR_REVEAL_WINDOW = 1 * 24 * 60 * 60;
const MIN_JUROR_STAKE = ethers.parseEther("0.05");
const JUROR_STAKE_AT_RISK = ethers.parseEther("0.01");

async function deployFixture() {
  const [owner, client, server, oracle, juror1, juror2, juror3, stranger] = await ethers.getSigners();

  const MockIdentityRegistry = await ethers.getContractFactory("MockIdentityRegistry");
  const identityRegistry = await MockIdentityRegistry.deploy();

  const MockReputationRegistry = await ethers.getContractFactory("MockReputationRegistry");
  const reputationRegistry = await MockReputationRegistry.deploy();

  const MockValidationRegistry = await ethers.getContractFactory("MockValidationRegistry");
  const validationRegistry = await MockValidationRegistry.deploy();

  await identityRegistry.register(CLIENT_AGENT_ID, client.address);
  await identityRegistry.register(SERVER_AGENT_ID, server.address);

  const DisputeArbitrator = await ethers.getContractFactory("DisputeArbitrator");
  const arbitrator = await DisputeArbitrator.deploy(
    await identityRegistry.getAddress(),
    await reputationRegistry.getAddress(),
    await validationRegistry.getAddress(),
    oracle.address
  );

  return {
    owner,
    client,
    server,
    oracle,
    juror1,
    juror2,
    juror3,
    stranger,
    identityRegistry,
    reputationRegistry,
    validationRegistry,
    arbitrator,
  };
}

async function openDispute(
  arbitrator: any,
  client: HardhatEthersSigner,
  opts: Partial<{ feedbackIndex: bigint; validationRequestHash: string; bond: bigint }> = {}
) {
  const bond = opts.bond ?? ethers.parseEther("0.02");
  const tx = await arbitrator
    .connect(client)
    .openDispute(
      CLIENT_AGENT_ID,
      SERVER_AGENT_ID,
      ethers.keccak256(ethers.toUtf8Bytes("task-spec")),
      opts.feedbackIndex ?? 0n,
      opts.validationRequestHash ?? ethers.ZeroHash,
      "ipfs://client-evidence",
      { value: bond }
    );
  const receipt = await tx.wait();
  return { tx, receipt, bond };
}

describe("DisputeArbitrator", function () {
  describe("opening a dispute", function () {
    it("rejects opening without a bond", async function () {
      const { arbitrator, client } = await loadFixture(deployFixture);
      await expect(
        arbitrator
          .connect(client)
          .openDispute(CLIENT_AGENT_ID, SERVER_AGENT_ID, ethers.ZeroHash, 0, ethers.ZeroHash, "uri", { value: 0 })
      ).to.be.revertedWithCustomError(arbitrator, "NoBondSent");
    });

    it("rejects an opener who controls neither agent", async function () {
      const { arbitrator, stranger } = await loadFixture(deployFixture);
      await expect(
        arbitrator
          .connect(stranger)
          .openDispute(CLIENT_AGENT_ID, SERVER_AGENT_ID, ethers.ZeroHash, 0, ethers.ZeroHash, "uri", {
            value: ethers.parseEther("0.01"),
          })
      ).to.be.revertedWithCustomError(arbitrator, "NotAuthorizedForAgents");
    });

    it("lets the client agent's owner open a dispute with their evidence attached", async function () {
      const { arbitrator, client } = await loadFixture(deployFixture);
      const { bond, tx } = await openDispute(arbitrator, client);

      await expect(tx).to.emit(arbitrator, "DisputeOpened").withArgs(
        1n,
        CLIENT_AGENT_ID,
        SERVER_AGENT_ID,
        client.address,
        ethers.keccak256(ethers.toUtf8Bytes("task-spec")),
        0n,
        ethers.ZeroHash
      );

      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.clientEvidenceURI).to.equal("ipfs://client-evidence");
      expect(dispute.serverEvidenceURI).to.equal("");
      expect(dispute.bond).to.equal(bond);
      expect(dispute.status).to.equal(1); // EvidenceWindow
    });

    it("lets the server agent's owner open a dispute too", async function () {
      const { arbitrator, server } = await loadFixture(deployFixture);
      await arbitrator
        .connect(server)
        .openDispute(CLIENT_AGENT_ID, SERVER_AGENT_ID, ethers.ZeroHash, 0, ethers.ZeroHash, "ipfs://server-evidence", {
          value: ethers.parseEther("0.02"),
        });
      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.serverEvidenceURI).to.equal("ipfs://server-evidence");
      expect(dispute.clientEvidenceURI).to.equal("");
    });
  });

  describe("evidence window", function () {
    it("lets the counterparty submit evidence before the deadline", async function () {
      const { arbitrator, client, server } = await loadFixture(deployFixture);
      await openDispute(arbitrator, client);

      await expect(arbitrator.connect(server).submitCounterEvidence(1n, "ipfs://server-evidence"))
        .to.emit(arbitrator, "EvidenceSubmitted")
        .withArgs(1n, false, "ipfs://server-evidence");

      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.serverEvidenceURI).to.equal("ipfs://server-evidence");
    });

    it("rejects counter-evidence from someone who controls neither agent", async function () {
      const { arbitrator, client, stranger } = await loadFixture(deployFixture);
      await openDispute(arbitrator, client);
      await expect(
        arbitrator.connect(stranger).submitCounterEvidence(1n, "ipfs://x")
      ).to.be.revertedWithCustomError(arbitrator, "NotAuthorizedForAgents");
    });

    it("rejects evidence submitted after the window closes", async function () {
      const { arbitrator, client, server } = await loadFixture(deployFixture);
      await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await expect(
        arbitrator.connect(server).submitCounterEvidence(1n, "ipfs://late")
      ).to.be.revertedWithCustomError(arbitrator, "EvidenceWindowClosed");
    });

    it("cannot be closed before the deadline", async function () {
      const { arbitrator, client } = await loadFixture(deployFixture);
      await openDispute(arbitrator, client);
      await expect(arbitrator.closeEvidenceWindow(1n)).to.be.revertedWithCustomError(
        arbitrator,
        "EvidenceWindowOpen"
      );
    });

    it("can be closed by anyone after the deadline", async function () {
      const { arbitrator, client, stranger } = await loadFixture(deployFixture);
      await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.connect(stranger).closeEvidenceWindow(1n);
      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.status).to.equal(2); // AwaitingAIVerdict
    });
  });

  describe("AI oracle verdict", function () {
    async function toAIReview(arbitrator: any, client: HardhatEthersSigner) {
      await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.closeEvidenceWindow(1n);
    }

    it("rejects a verdict from a non-oracle address", async function () {
      const { arbitrator, client, stranger } = await loadFixture(deployFixture);
      await toAIReview(arbitrator, client);
      await expect(
        arbitrator.connect(stranger).submitAIVerdict(1n, Outcome.ServerWins, 90, "ipfs://verdict", ethers.ZeroHash)
      ).to.be.revertedWithCustomError(arbitrator, "NotOracle");
    });

    it("accepts the registered oracle's verdict and opens the appeal window", async function () {
      const { arbitrator, client, oracle } = await loadFixture(deployFixture);
      await toAIReview(arbitrator, client);

      await expect(
        arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.ServerWins, 87, "ipfs://verdict", ethers.keccak256(ethers.toUtf8Bytes("verdict")))
      )
        .to.emit(arbitrator, "AIVerdictSubmitted")
        .withArgs(1n, Outcome.ServerWins, 87, "ipfs://verdict");

      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.status).to.equal(3); // Appealable
      expect(dispute.outcome).to.equal(Outcome.ServerWins);
      expect(dispute.score).to.equal(87);
    });

    it("cannot be finalized before the appeal window elapses", async function () {
      const { arbitrator, client, oracle } = await loadFixture(deployFixture);
      await toAIReview(arbitrator, client);
      await arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.ServerWins, 87, "ipfs://verdict", ethers.ZeroHash);
      await expect(arbitrator.finalizeUnappealed(1n)).to.be.revertedWithCustomError(arbitrator, "AppealWindowClosed");
    });

    it("resolves in favor of the server and pays out the bond when unappealed", async function () {
      const { arbitrator, client, server, oracle } = await loadFixture(deployFixture);
      const { bond } = await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.closeEvidenceWindow(1n);
      await arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.ServerWins, 100, "ipfs://verdict", ethers.ZeroHash);
      await time.increase(APPEAL_WINDOW + 1);

      await expect(arbitrator.finalizeUnappealed(1n))
        .to.emit(arbitrator, "DisputeResolved")
        .withArgs(1n, Outcome.ServerWins, 100, "ipfs://verdict");

      expect(await arbitrator.pendingWithdrawals(server.address)).to.equal(bond);
      expect(await arbitrator.pendingWithdrawals(client.address)).to.equal(0n);

      const balanceBefore = await ethers.provider.getBalance(server.address);
      const tx = await arbitrator.connect(server).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(server.address);
      expect(balanceAfter).to.equal(balanceBefore + bond - gasCost);
    });

    it("splits the bond on a Split outcome", async function () {
      const { arbitrator, client, server, oracle } = await loadFixture(deployFixture);
      const { bond } = await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.closeEvidenceWindow(1n);
      await arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.Split, 50, "ipfs://verdict", ethers.ZeroHash);
      await time.increase(APPEAL_WINDOW + 1);
      await arbitrator.finalizeUnappealed(1n);

      expect(await arbitrator.pendingWithdrawals(client.address)).to.equal(bond / 2n);
      expect(await arbitrator.pendingWithdrawals(server.address)).to.equal(bond - bond / 2n);
    });

    it("reverts withdraw() for an address with nothing pending", async function () {
      const { arbitrator, stranger } = await loadFixture(deployFixture);
      await expect(arbitrator.connect(stranger).withdraw()).to.be.revertedWithCustomError(
        arbitrator,
        "NothingToWithdraw"
      );
    });

    it("writes the verdict back to the Reputation and Validation registries", async function () {
      const { arbitrator, client, server, oracle, reputationRegistry, validationRegistry } = await loadFixture(
        deployFixture
      );
      const validationRequestHash = ethers.keccak256(ethers.toUtf8Bytes("validation-request"));
      await openDispute(arbitrator, client, { feedbackIndex: 5n, validationRequestHash });
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.closeEvidenceWindow(1n);
      const verdictHash = ethers.keccak256(ethers.toUtf8Bytes("verdict-doc"));
      await arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.ServerWins, 77, "ipfs://verdict", verdictHash);
      await time.increase(APPEAL_WINDOW + 1);
      await arbitrator.finalizeUnappealed(1n);

      const repResponse = await reputationRegistry.lastResponse();
      expect(repResponse.called).to.equal(true);
      expect(repResponse.agentId).to.equal(SERVER_AGENT_ID);
      expect(repResponse.clientAddress).to.equal(client.address);
      expect(repResponse.feedbackIndex).to.equal(5n);
      expect(repResponse.responseUri).to.equal("ipfs://verdict");
      expect(repResponse.responseHash).to.equal(verdictHash);

      const valResponse = await validationRegistry.lastResponse();
      expect(valResponse.called).to.equal(true);
      expect(valResponse.requestHash).to.equal(validationRequestHash);
      expect(valResponse.response).to.equal(77);
    });
  });

  describe("appeal to the juror pool", function () {
    async function toAppealable(arbitrator: any, client: HardhatEthersSigner, oracle: HardhatEthersSigner) {
      const { bond } = await openDispute(arbitrator, client);
      await time.increase(EVIDENCE_WINDOW + 1);
      await arbitrator.closeEvidenceWindow(1n);
      await arbitrator.connect(oracle).submitAIVerdict(1n, Outcome.ServerWins, 90, "ipfs://verdict", ethers.ZeroHash);
      return bond;
    }

    it("rejects an appeal bond smaller than the dispute bond", async function () {
      const { arbitrator, client, server, oracle } = await loadFixture(deployFixture);
      await toAppealable(arbitrator, client, oracle);
      await expect(
        arbitrator.connect(client).appeal(1n, { value: 1 })
      ).to.be.revertedWithCustomError(arbitrator, "AppealBondTooLow");
    });

    it("rejects an appeal after the appeal window closes", async function () {
      const { arbitrator, client, oracle } = await loadFixture(deployFixture);
      const bond = await toAppealable(arbitrator, client, oracle);
      await time.increase(APPEAL_WINDOW + 1);
      await expect(
        arbitrator.connect(client).appeal(1n, { value: bond })
      ).to.be.revertedWithCustomError(arbitrator, "AppealWindowClosed");
    });

    it("moves the dispute into juror commit phase", async function () {
      const { arbitrator, client, oracle } = await loadFixture(deployFixture);
      const bond = await toAppealable(arbitrator, client, oracle);
      await expect(arbitrator.connect(client).appeal(1n, { value: bond }))
        .to.emit(arbitrator, "DisputeAppealed")
        .withArgs(1n, 1n, client.address);

      const dispute = await arbitrator.getDispute(1n);
      expect(dispute.status).to.equal(4); // JurorCommit
      expect(dispute.jurorRoundId).to.equal(1n);
      expect(dispute.bond).to.equal(bond * 2n);
    });

    async function toJurorCommit(arbitrator: any, client: HardhatEthersSigner, oracle: HardhatEthersSigner) {
      const bond = await toAppealable(arbitrator, client, oracle);
      await arbitrator.connect(client).appeal(1n, { value: bond });
    }

    describe("juror pool mechanics", function () {
      it("requires the minimum stake to join", async function () {
        const { arbitrator, juror1 } = await loadFixture(deployFixture);
        await expect(
          arbitrator.connect(juror1).joinJurorPool({ value: MIN_JUROR_STAKE - 1n })
        ).to.be.revertedWithCustomError(arbitrator, "InsufficientStake");

        await arbitrator.connect(juror1).joinJurorPool({ value: MIN_JUROR_STAKE });
        expect(await arbitrator.jurorStake(juror1.address)).to.equal(MIN_JUROR_STAKE);
      });

      it("runs a full commit-reveal round: majority wins, minority is slashed and majority is rewarded", async function () {
        const { arbitrator, client, oracle, juror1, juror2, juror3 } = await loadFixture(deployFixture);
        await toJurorCommit(arbitrator, client, oracle);

        for (const juror of [juror1, juror2, juror3]) {
          await arbitrator.connect(juror).joinJurorPool({ value: MIN_JUROR_STAKE });
        }

        const salt1 = ethers.keccak256(ethers.toUtf8Bytes("salt1"));
        const salt2 = ethers.keccak256(ethers.toUtf8Bytes("salt2"));
        const salt3 = ethers.keccak256(ethers.toUtf8Bytes("salt3"));

        const commit = (disputeId: bigint, outcome: number, salt: string) =>
          ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8", "bytes32"], [disputeId, outcome, salt])
          );

        await arbitrator.connect(juror1).commitVote(1n, commit(1n, Outcome.ServerWins, salt1));
        await arbitrator.connect(juror2).commitVote(1n, commit(1n, Outcome.ServerWins, salt2));
        await arbitrator.connect(juror3).commitVote(1n, commit(1n, Outcome.ClientWins, salt3));

        await expect(arbitrator.connect(juror1).revealVote(1n, Outcome.ServerWins, salt1)).to.be.revertedWithCustomError(
          arbitrator,
          "WrongStatus"
        );

        await time.increase(JUROR_COMMIT_WINDOW + 1);
        await arbitrator.openReveal(1n);

        await arbitrator.connect(juror1).revealVote(1n, Outcome.ServerWins, salt1);
        await expect(arbitrator.connect(juror2).revealVote(1n, Outcome.ClientWins, salt2)).to.be.revertedWithCustomError(
          arbitrator,
          "RevealMismatch"
        );
        await arbitrator.connect(juror2).revealVote(1n, Outcome.ServerWins, salt2);
        await arbitrator.connect(juror3).revealVote(1n, Outcome.ClientWins, salt3);

        await expect(arbitrator.finalizeJurorVerdict(1n)).to.be.revertedWithCustomError(
          arbitrator,
          "RevealWindowClosed"
        );

        await time.increase(JUROR_REVEAL_WINDOW + 1);

        const tally = await arbitrator.getJurorRoundTally(1n);
        expect(tally.clientVotes).to.equal(1n);
        expect(tally.serverVotes).to.equal(2n);

        // The juror round doesn't submit a new verdict URI, so the dispute
        // keeps pointing at the AI oracle's original verdict document.
        await expect(arbitrator.finalizeJurorVerdict(1n))
          .to.emit(arbitrator, "DisputeResolved")
          .withArgs(1n, Outcome.ServerWins, 100, "ipfs://verdict");

        // juror3 voted with the minority: slashed by JUROR_STAKE_AT_RISK.
        expect(await arbitrator.jurorStake(juror3.address)).to.equal(MIN_JUROR_STAKE - JUROR_STAKE_AT_RISK);
        // juror1 and juror2 split juror3's slashed stake evenly.
        const reward = JUROR_STAKE_AT_RISK / 2n;
        expect(await arbitrator.jurorStake(juror1.address)).to.equal(MIN_JUROR_STAKE + reward);
        expect(await arbitrator.jurorStake(juror2.address)).to.equal(MIN_JUROR_STAKE + reward);

        const dispute = await arbitrator.getDispute(1n);
        expect(dispute.status).to.equal(6); // Resolved
        expect(dispute.outcome).to.equal(Outcome.ServerWins);
      });

      it("slashes a juror who commits but never reveals, as a no-show", async function () {
        const { arbitrator, client, oracle, juror1, juror2 } = await loadFixture(deployFixture);
        await toJurorCommit(arbitrator, client, oracle);
        await arbitrator.connect(juror1).joinJurorPool({ value: MIN_JUROR_STAKE });
        await arbitrator.connect(juror2).joinJurorPool({ value: MIN_JUROR_STAKE });

        const salt1 = ethers.keccak256(ethers.toUtf8Bytes("salt1"));
        const commit = (disputeId: bigint, outcome: number, salt: string) =>
          ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8", "bytes32"], [disputeId, outcome, salt])
          );

        await arbitrator.connect(juror1).commitVote(1n, commit(1n, Outcome.ServerWins, salt1));
        await arbitrator.connect(juror2).commitVote(1n, commit(1n, Outcome.ServerWins, ethers.keccak256(ethers.toUtf8Bytes("salt2"))));

        await time.increase(JUROR_COMMIT_WINDOW + 1);
        await arbitrator.openReveal(1n);

        // juror2 never reveals.
        await arbitrator.connect(juror1).revealVote(1n, Outcome.ServerWins, salt1);

        await time.increase(JUROR_REVEAL_WINDOW + 1);
        await arbitrator.finalizeJurorVerdict(1n);

        expect(await arbitrator.jurorStake(juror2.address)).to.equal(MIN_JUROR_STAKE - JUROR_STAKE_AT_RISK);
        expect(await arbitrator.jurorStake(juror1.address)).to.equal(MIN_JUROR_STAKE + JUROR_STAKE_AT_RISK);
      });

      it("keeps stake locked while a juror has an open committed vote", async function () {
        const { arbitrator, client, oracle, juror1 } = await loadFixture(deployFixture);
        await toJurorCommit(arbitrator, client, oracle);
        await arbitrator.connect(juror1).joinJurorPool({ value: MIN_JUROR_STAKE });

        const commit = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256", "uint8", "bytes32"],
            [1n, Outcome.ServerWins, ethers.keccak256(ethers.toUtf8Bytes("salt"))]
          )
        );
        await arbitrator.connect(juror1).commitVote(1n, commit);

        await expect(
          arbitrator.connect(juror1).withdrawJurorStake(MIN_JUROR_STAKE)
        ).to.be.revertedWithCustomError(arbitrator, "StakeLocked");

        const available = MIN_JUROR_STAKE - JUROR_STAKE_AT_RISK;
        await arbitrator.connect(juror1).withdrawJurorStake(available);
        expect(await arbitrator.jurorStake(juror1.address)).to.equal(JUROR_STAKE_AT_RISK);
      });
    });
  });

  describe("admin", function () {
    it("only the owner can register or remove oracles", async function () {
      const { arbitrator, stranger } = await loadFixture(deployFixture);
      await expect(arbitrator.connect(stranger).setOracle(stranger.address, true)).to.be.revertedWithCustomError(
        arbitrator,
        "OwnableUnauthorizedAccount"
      );

      await expect(arbitrator.setOracle(stranger.address, true))
        .to.emit(arbitrator, "OracleUpdated")
        .withArgs(stranger.address, true);
      expect(await arbitrator.isOracle(stranger.address)).to.equal(true);
    });
  });
});
