// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC-8004 Identity Registry interface consumed by Juez.
/// @dev ERC-8004 ("Trustless Agents") is a Draft EIP at the time of writing.
/// Its Identity Registry mints one ERC-721 token per agent; whoever owns
/// that token controls the agent's on-chain identity. Juez only needs
/// ownership lookups, so it depends on this narrow slice of the real
/// registry's ERC-721 surface rather than the full interface.
interface IIdentityRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
}
