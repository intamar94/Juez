// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Bare-bones stand-in for the ERC-8004 Identity Registry, used only
/// in tests. Real deployments should point DisputeArbitrator at the actual
/// ERC-8004 Identity Registry instead of this contract.
contract MockIdentityRegistry {
    mapping(uint256 => address) private _owners;

    function register(uint256 agentId, address owner) external {
        _owners[agentId] = owner;
    }

    function ownerOf(uint256 agentId) external view returns (address) {
        return _owners[agentId];
    }
}
