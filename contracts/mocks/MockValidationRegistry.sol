// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Bare-bones stand-in for the ERC-8004 Validation Registry, used
/// only in tests. Records the last `validationResponse` call so tests can
/// assert Juez wrote the verdict back correctly.
contract MockValidationRegistry {
    struct LastResponse {
        bytes32 requestHash;
        uint8 response;
        string responseUri;
        bytes32 responseHash;
        bytes32 tag;
        bool called;
    }

    LastResponse public lastResponse;

    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseUri,
        bytes32 responseHash,
        bytes32 tag
    ) external {
        lastResponse = LastResponse(requestHash, response, responseUri, responseHash, tag, true);
    }
}
