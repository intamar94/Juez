// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Bare-bones stand-in for the ERC-8004 Reputation Registry, used
/// only in tests. Records the last `appendResponse` call so tests can
/// assert Juez wrote the verdict back correctly.
contract MockReputationRegistry {
    struct LastResponse {
        uint256 agentId;
        address clientAddress;
        uint64 feedbackIndex;
        string responseUri;
        bytes32 responseHash;
        bool called;
    }

    LastResponse public lastResponse;

    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseUri,
        bytes32 responseHash
    ) external {
        lastResponse = LastResponse(agentId, clientAddress, feedbackIndex, responseUri, responseHash, true);
    }
}
