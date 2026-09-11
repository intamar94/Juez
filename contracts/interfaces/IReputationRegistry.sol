// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC-8004 Reputation Registry interface consumed by Juez.
/// @dev The real registry accepts client-signed feedback (`giveFeedback`)
/// and lets the rated agent attach a response to a stored feedback entry
/// (`appendResponse`). Juez calls `appendResponse` to permanently attach an
/// arbitration verdict to the disputed feedback entry, so the resolution
/// becomes part of the agent's portable on-chain history instead of living
/// only inside Juez's own storage.
interface IReputationRegistry {
    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseUri,
        bytes32 responseHash
    ) external;
}
