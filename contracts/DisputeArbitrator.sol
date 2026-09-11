// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";
import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";
import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";

/// @title DisputeArbitrator ("Juez")
/// @notice Fills the gap ERC-8004 leaves open on purpose: its Identity,
/// Reputation and Validation registries let agents publish feedback and
/// request validation, but they do not say who decides when a client agent
/// and a server agent disagree about whether a task was done well. Juez is
/// that missing arbitration policy, built as a plug-in on top of the
/// registries instead of a fork of them.
///
/// Resolution has two tiers:
///  1. AI review — a registered oracle (an off-chain "judge" agent, see
///     judge-service/) reads the evidence both sides submitted and posts a
///     verdict quickly and cheaply. This is the default path.
///  2. Juror appeal — either side can escalate within the appeal window by
///     posting a bond at least as large as the dispute bond. A pool of
///     staked jurors then commit-reveal vote; the losing side's staked
///     collateral is slashed and redistributed to jurors who voted with the
///     majority, so voting truthfully is the profitable strategy (a
///     Schelling-point game, in the spirit of Kleros but deliberately
///     smaller and simpler).
///
/// The final verdict is written back to the Reputation Registry (attached
/// to the disputed feedback entry) and, when the dispute references a
/// pending validation request, to the Validation Registry too — so the
/// resolution becomes part of the agents' portable, on-chain reputation
/// rather than a fact only Juez remembers.
contract DisputeArbitrator is Ownable, ReentrancyGuard {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum Status {
        None,
        EvidenceWindow,
        AwaitingAIVerdict,
        Appealable,
        JurorCommit,
        JurorReveal,
        Resolved
    }

    enum Outcome {
        Unresolved,
        ClientWins,
        ServerWins,
        Split
    }

    struct Dispute {
        uint256 clientAgentId;
        uint256 serverAgentId;
        address opener;
        bytes32 taskHash;
        uint64 feedbackIndex; // 0 means "not attached to a Reputation Registry entry"
        bytes32 validationRequestHash; // 0 means "not attached to a Validation Registry request"
        string clientEvidenceURI;
        string serverEvidenceURI;
        uint64 evidenceDeadline;
        uint64 appealDeadline;
        Status status;
        Outcome outcome;
        uint8 score; // 0-100, meaning fixed by the resolver: higher = more favorable to the server agent
        string verdictURI;
        bytes32 verdictHash;
        uint256 bond;
        uint256 jurorRoundId; // 0 until appealed
    }

    struct JurorRound {
        uint256 disputeId;
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint256 numCommits;
        uint256 numReveals;
        uint256 clientVotes;
        uint256 serverVotes;
        uint256 splitVotes;
        bool finalized;
        mapping(address => bytes32) commitments;
        mapping(address => bool) hasCommitted;
        mapping(address => bool) hasRevealed;
        mapping(address => Outcome) revealedVote;
        address[] committers;
    }

    // ---------------------------------------------------------------------
    // Config
    // ---------------------------------------------------------------------

    uint64 public constant EVIDENCE_WINDOW = 3 days;
    uint64 public constant APPEAL_WINDOW = 2 days;
    uint64 public constant JUROR_COMMIT_WINDOW = 2 days;
    uint64 public constant JUROR_REVEAL_WINDOW = 1 days;

    uint256 public constant MIN_JUROR_STAKE = 0.05 ether;
    uint256 public constant JUROR_STAKE_AT_RISK = 0.01 ether;

    IIdentityRegistry public immutable identityRegistry;
    IReputationRegistry public immutable reputationRegistry;
    IValidationRegistry public immutable validationRegistry;

    mapping(address => bool) public isOracle;

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    uint256 public nextDisputeId = 1;
    mapping(uint256 => Dispute) public disputes;

    uint256 public nextJurorRoundId = 1;
    mapping(uint256 => JurorRound) private jurorRounds;

    mapping(address => uint256) public jurorStake;
    mapping(address => uint256) public jurorLockedRounds; // count of rounds currently locking JUROR_STAKE_AT_RISK

    mapping(address => uint256) public pendingWithdrawals;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event DisputeOpened(
        uint256 indexed disputeId,
        uint256 indexed clientAgentId,
        uint256 indexed serverAgentId,
        address opener,
        bytes32 taskHash,
        uint64 feedbackIndex,
        bytes32 validationRequestHash
    );
    event EvidenceSubmitted(uint256 indexed disputeId, bool fromOpener, string evidenceURI);
    event AIVerdictSubmitted(uint256 indexed disputeId, Outcome outcome, uint8 score, string verdictURI);
    event DisputeAppealed(uint256 indexed disputeId, uint256 indexed jurorRoundId, address appellant);
    event JurorJoined(address indexed juror, uint256 amount);
    event JurorStakeWithdrawn(address indexed juror, uint256 amount);
    event VoteCommitted(uint256 indexed disputeId, uint256 indexed jurorRoundId, address indexed juror);
    event VoteRevealed(uint256 indexed disputeId, uint256 indexed jurorRoundId, address indexed juror, Outcome vote);
    event DisputeResolved(uint256 indexed disputeId, Outcome outcome, uint8 score, string verdictURI);
    event OracleUpdated(address indexed oracle, bool allowed);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error NotAuthorizedForAgents();
    error NoBondSent();
    error WrongStatus();
    error EvidenceWindowClosed();
    error EvidenceWindowOpen();
    error NotOracle();
    error AppealWindowClosed();
    error AppealBondTooLow();
    error InsufficientStake();
    error StakeLocked();
    error AlreadyCommitted();
    error CommitWindowClosed();
    error CommitWindowOpen();
    error RevealWindowClosed();
    error NotCommitted();
    error RevealMismatch();
    error AlreadyRevealed();
    error NothingToWithdraw();

    constructor(
        address identityRegistry_,
        address reputationRegistry_,
        address validationRegistry_,
        address initialOracle
    ) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(identityRegistry_);
        reputationRegistry = IReputationRegistry(reputationRegistry_);
        validationRegistry = IValidationRegistry(validationRegistry_);
        if (initialOracle != address(0)) {
            isOracle[initialOracle] = true;
            emit OracleUpdated(initialOracle, true);
        }
    }

    // ---------------------------------------------------------------------
    // Dispute lifecycle: open -> evidence -> AI verdict -> (appeal) -> resolved
    // ---------------------------------------------------------------------

    /// @notice Open a dispute between the two agents of a task. Callable by
    /// whichever address controls either agent's Identity Registry token.
    /// @param feedbackIndex Reputation Registry feedback index being
    /// disputed, or 0 if this dispute is not about an existing feedback
    /// entry.
    /// @param validationRequestHash Validation Registry request hash this
    /// dispute should also settle, or bytes32(0) if none.
    function openDispute(
        uint256 clientAgentId,
        uint256 serverAgentId,
        bytes32 taskHash,
        uint64 feedbackIndex,
        bytes32 validationRequestHash,
        string calldata openerEvidenceURI
    ) external payable returns (uint256 disputeId) {
        if (msg.value == 0) revert NoBondSent();

        address clientOwner = identityRegistry.ownerOf(clientAgentId);
        address serverOwner = identityRegistry.ownerOf(serverAgentId);
        bool openerIsClient = msg.sender == clientOwner;
        bool openerIsServer = msg.sender == serverOwner;
        if (!openerIsClient && !openerIsServer) revert NotAuthorizedForAgents();

        disputeId = nextDisputeId++;
        Dispute storage d = disputes[disputeId];
        d.clientAgentId = clientAgentId;
        d.serverAgentId = serverAgentId;
        d.opener = msg.sender;
        d.taskHash = taskHash;
        d.feedbackIndex = feedbackIndex;
        d.validationRequestHash = validationRequestHash;
        d.evidenceDeadline = uint64(block.timestamp) + EVIDENCE_WINDOW;
        d.status = Status.EvidenceWindow;
        d.bond = msg.value;

        if (openerIsClient) {
            d.clientEvidenceURI = openerEvidenceURI;
        } else {
            d.serverEvidenceURI = openerEvidenceURI;
        }

        emit DisputeOpened(
            disputeId, clientAgentId, serverAgentId, msg.sender, taskHash, feedbackIndex, validationRequestHash
        );
        emit EvidenceSubmitted(disputeId, true, openerEvidenceURI);
    }

    /// @notice Submit (or replace) your side's evidence while the evidence
    /// window is open. Only the counterparty needs this call; the opener
    /// already submitted evidence in `openDispute`.
    function submitCounterEvidence(uint256 disputeId, string calldata evidenceURI) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.EvidenceWindow) revert WrongStatus();
        if (block.timestamp > d.evidenceDeadline) revert EvidenceWindowClosed();

        address clientOwner = identityRegistry.ownerOf(d.clientAgentId);
        address serverOwner = identityRegistry.ownerOf(d.serverAgentId);
        if (msg.sender == clientOwner) {
            d.clientEvidenceURI = evidenceURI;
        } else if (msg.sender == serverOwner) {
            d.serverEvidenceURI = evidenceURI;
        } else {
            revert NotAuthorizedForAgents();
        }
        emit EvidenceSubmitted(disputeId, false, evidenceURI);
    }

    /// @notice Move a dispute out of the evidence window once it has
    /// elapsed, so the AI oracle can pick it up. Callable by anyone.
    function closeEvidenceWindow(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.EvidenceWindow) revert WrongStatus();
        if (block.timestamp <= d.evidenceDeadline) revert EvidenceWindowOpen();
        d.status = Status.AwaitingAIVerdict;
    }

    /// @notice The registered AI judge oracle posts its verdict. Starts the
    /// appeal window; if nobody appeals, this verdict becomes final.
    /// @param score 0-100, higher meaning the server agent's work was
    /// performed more satisfactorily.
    function submitAIVerdict(
        uint256 disputeId,
        Outcome outcome,
        uint8 score,
        string calldata verdictURI,
        bytes32 verdictHash
    ) external {
        if (!isOracle[msg.sender]) revert NotOracle();
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.AwaitingAIVerdict) revert WrongStatus();
        if (outcome == Outcome.Unresolved) revert WrongStatus();

        d.outcome = outcome;
        d.score = score;
        d.verdictURI = verdictURI;
        d.verdictHash = verdictHash;
        d.status = Status.Appealable;
        d.appealDeadline = uint64(block.timestamp) + APPEAL_WINDOW;

        emit AIVerdictSubmitted(disputeId, outcome, score, verdictURI);
    }

    /// @notice Finalize an AI verdict that nobody appealed within the
    /// appeal window. Callable by anyone.
    function finalizeUnappealed(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.Appealable) revert WrongStatus();
        if (block.timestamp <= d.appealDeadline) revert AppealWindowClosed();
        _resolve(disputeId, d.outcome, d.score, d.verdictURI, d.verdictHash);
    }

    // ---------------------------------------------------------------------
    // Appeal to the juror pool
    // ---------------------------------------------------------------------

    /// @notice Escalate an AI verdict to the staked juror pool. Must post a
    /// bond at least as large as the original dispute bond, discouraging
    /// frivolous appeals. Callable by whichever side controls either agent.
    function appeal(uint256 disputeId) external payable {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.Appealable) revert WrongStatus();
        if (block.timestamp > d.appealDeadline) revert AppealWindowClosed();
        if (msg.value < d.bond) revert AppealBondTooLow();

        address clientOwner = identityRegistry.ownerOf(d.clientAgentId);
        address serverOwner = identityRegistry.ownerOf(d.serverAgentId);
        if (msg.sender != clientOwner && msg.sender != serverOwner) revert NotAuthorizedForAgents();

        d.bond += msg.value;

        uint256 roundId = nextJurorRoundId++;
        JurorRound storage r = jurorRounds[roundId];
        r.disputeId = disputeId;
        r.commitDeadline = uint64(block.timestamp) + JUROR_COMMIT_WINDOW;
        r.revealDeadline = r.commitDeadline + JUROR_REVEAL_WINDOW;

        d.jurorRoundId = roundId;
        d.status = Status.JurorCommit;

        emit DisputeAppealed(disputeId, roundId, msg.sender);
    }

    /// @notice Join the juror pool by staking at least MIN_JUROR_STAKE.
    /// Can be called again later to top up.
    function joinJurorPool() external payable {
        if (jurorStake[msg.sender] + msg.value < MIN_JUROR_STAKE) revert InsufficientStake();
        jurorStake[msg.sender] += msg.value;
        emit JurorJoined(msg.sender, msg.value);
    }

    /// @notice Withdraw stake that is not currently locked in an open
    /// voting round.
    function withdrawJurorStake(uint256 amount) external nonReentrant {
        uint256 locked = jurorLockedRounds[msg.sender] * JUROR_STAKE_AT_RISK;
        if (jurorStake[msg.sender] < locked + amount) revert StakeLocked();
        jurorStake[msg.sender] -= amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
        emit JurorStakeWithdrawn(msg.sender, amount);
    }

    /// @notice Commit a hashed vote for an appealed dispute.
    /// `commitment` should be `keccak256(abi.encode(disputeId, outcome, salt))`.
    function commitVote(uint256 disputeId, bytes32 commitment) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.JurorCommit) revert WrongStatus();
        JurorRound storage r = jurorRounds[d.jurorRoundId];
        if (block.timestamp > r.commitDeadline) revert CommitWindowClosed();
        if (jurorStake[msg.sender] < (jurorLockedRounds[msg.sender] + 1) * JUROR_STAKE_AT_RISK) {
            revert InsufficientStake();
        }
        if (r.hasCommitted[msg.sender]) revert AlreadyCommitted();

        r.hasCommitted[msg.sender] = true;
        r.commitments[msg.sender] = commitment;
        r.committers.push(msg.sender);
        r.numCommits++;
        jurorLockedRounds[msg.sender]++;

        emit VoteCommitted(disputeId, d.jurorRoundId, msg.sender);
    }

    /// @notice Move a dispute from commit to reveal once the commit window
    /// has elapsed. Callable by anyone.
    function openReveal(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.JurorCommit) revert WrongStatus();
        JurorRound storage r = jurorRounds[d.jurorRoundId];
        if (block.timestamp <= r.commitDeadline) revert CommitWindowOpen();
        d.status = Status.JurorReveal;
    }

    /// @notice Reveal a previously committed vote.
    function revealVote(uint256 disputeId, Outcome vote, bytes32 salt) external {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.JurorReveal) revert WrongStatus();
        JurorRound storage r = jurorRounds[d.jurorRoundId];
        if (block.timestamp > r.revealDeadline) revert RevealWindowClosed();
        if (!r.hasCommitted[msg.sender]) revert NotCommitted();
        if (r.hasRevealed[msg.sender]) revert AlreadyRevealed();
        if (r.commitments[msg.sender] != keccak256(abi.encode(disputeId, vote, salt))) revert RevealMismatch();

        r.hasRevealed[msg.sender] = true;
        r.revealedVote[msg.sender] = vote;
        r.numReveals++;

        if (vote == Outcome.ClientWins) r.clientVotes++;
        else if (vote == Outcome.ServerWins) r.serverVotes++;
        else r.splitVotes++;

        emit VoteRevealed(disputeId, d.jurorRoundId, msg.sender, vote);
    }

    /// @notice Tally votes, slash the losing side, reward the winning side,
    /// and resolve the dispute. Callable by anyone once the reveal window
    /// has elapsed.
    function finalizeJurorVerdict(uint256 disputeId) external nonReentrant {
        Dispute storage d = disputes[disputeId];
        if (d.status != Status.JurorReveal) revert WrongStatus();
        JurorRound storage r = jurorRounds[d.jurorRoundId];
        if (block.timestamp <= r.revealDeadline) revert RevealWindowClosed();
        if (r.finalized) revert WrongStatus();
        r.finalized = true;

        Outcome majority = _majority(r.clientVotes, r.serverVotes, r.splitVotes);

        uint256 rewardPool;
        uint256 winnersCount;
        for (uint256 i = 0; i < r.committers.length; i++) {
            address juror = r.committers[i];
            jurorLockedRounds[juror]--;
            bool votedWithMajority = r.hasRevealed[juror] && r.revealedVote[juror] == majority;
            if (votedWithMajority) {
                winnersCount++;
            } else {
                // Wrong vote or no-show: slash the at-risk stake into the reward pool.
                jurorStake[juror] -= JUROR_STAKE_AT_RISK;
                rewardPool += JUROR_STAKE_AT_RISK;
            }
        }

        if (winnersCount > 0 && rewardPool > 0) {
            uint256 share = rewardPool / winnersCount;
            for (uint256 i = 0; i < r.committers.length; i++) {
                address juror = r.committers[i];
                if (r.hasRevealed[juror] && r.revealedVote[juror] == majority) {
                    jurorStake[juror] += share;
                }
            }
        }
        // If nobody voted with the majority (e.g. a single juror round, or
        // total disagreement), the slashed stake simply stays locked in the
        // contract's balance rather than being misattributed; see docs.

        uint8 score = majority == Outcome.ServerWins ? 100 : majority == Outcome.ClientWins ? 0 : 50;
        _resolve(disputeId, majority, score, "", bytes32(0));
    }

    function _majority(uint256 clientVotes, uint256 serverVotes, uint256 splitVotes) private pure returns (Outcome) {
        if (clientVotes >= serverVotes && clientVotes >= splitVotes) {
            if (clientVotes == serverVotes || clientVotes == splitVotes) return Outcome.Split;
            return Outcome.ClientWins;
        }
        if (serverVotes >= clientVotes && serverVotes >= splitVotes) {
            if (serverVotes == splitVotes) return Outcome.Split;
            return Outcome.ServerWins;
        }
        return Outcome.Split;
    }

    // ---------------------------------------------------------------------
    // Resolution: settle bonds and write the verdict back to the registries
    // ---------------------------------------------------------------------

    function _resolve(uint256 disputeId, Outcome outcome, uint8 score, string memory verdictURI, bytes32 verdictHash)
        private
    {
        Dispute storage d = disputes[disputeId];
        d.outcome = outcome;
        d.score = score;
        if (bytes(verdictURI).length > 0) d.verdictURI = verdictURI;
        if (verdictHash != bytes32(0)) d.verdictHash = verdictHash;
        d.status = Status.Resolved;

        address clientOwner = identityRegistry.ownerOf(d.clientAgentId);
        address serverOwner = identityRegistry.ownerOf(d.serverAgentId);
        if (outcome == Outcome.ClientWins) {
            pendingWithdrawals[clientOwner] += d.bond;
        } else if (outcome == Outcome.ServerWins) {
            pendingWithdrawals[serverOwner] += d.bond;
        } else {
            pendingWithdrawals[clientOwner] += d.bond / 2;
            pendingWithdrawals[serverOwner] += d.bond - (d.bond / 2);
        }

        if (d.feedbackIndex != 0) {
            // Best-effort: attach the verdict to the disputed feedback entry.
            // Reverts here must not brick resolution, so this call is not
            // wrapped in nonReentrant-sensitive state changes above.
            try reputationRegistry.appendResponse(
                d.serverAgentId, clientOwner, d.feedbackIndex, d.verdictURI, d.verdictHash
            ) {} catch {}
        }
        if (d.validationRequestHash != bytes32(0)) {
            try validationRegistry.validationResponse(
                d.validationRequestHash, d.score, d.verdictURI, d.verdictHash, keccak256("JUEZ_ARBITRATION")
            ) {} catch {}
        }

        emit DisputeResolved(disputeId, outcome, d.score, d.verdictURI);
    }

    /// @notice Pull-payment withdrawal for dispute bonds returned after
    /// resolution.
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        pendingWithdrawals[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function setOracle(address oracle, bool allowed) external onlyOwner {
        isOracle[oracle] = allowed;
        emit OracleUpdated(oracle, allowed);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    function getJurorRoundTally(uint256 roundId)
        external
        view
        returns (uint256 clientVotes, uint256 serverVotes, uint256 splitVotes, bool finalized)
    {
        JurorRound storage r = jurorRounds[roundId];
        return (r.clientVotes, r.serverVotes, r.splitVotes, r.finalized);
    }
}
