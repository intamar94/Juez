// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC-8004 Validation Registry interface consumed by Juez.
/// @dev Lets Juez act as a validator: an arbitration verdict can satisfy a
/// pending `validationRequest` on the real registry instead of only living
/// in Juez's own storage or in a Reputation Registry response.
interface IValidationRegistry {
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseUri,
        bytes32 responseHash,
        bytes32 tag
    ) external;
}
