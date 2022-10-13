// SPDX-License-Identifier: UNLICENSED
// Author: Kai Aldag <kai.aldag@everyrealm.com>
// Date: October 13, 2022
// Purpose: Standard interface for off-chain transaction authorizations

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

error InvalidSignature();
error Unauthorized();

/**
 * @title Permissions
 *
 * @dev The permissions contract is a means of decoupling msg.sender from authorizations,
 * permitting anyone to sign transactions off-chain and have the same on-chain
 * result as though they'd submitted it themself.
 */
abstract contract Permissions is EIP712 {
    constructor() EIP712("Permissions", "1") {}

    function authorizedCall(
        bytes calldata signature,
        bytes4 selector,
        bytes calldata payload,
        uint256 deadline
    ) external returns (bool, bytes memory) {
        require(block.timestamp < deadline, "Signed transaction expired");
        require(payload.length >= 32, "Payload of insufficient size");

        address signer = abi.decode(payload[payload.length - 32:], (address));

        require(signer != address(0x0), "Invalid signer null address");

        bytes32 digest = createDigest(selector, payload, deadline);
        // address recovered = ECDSA.recover(digest, signature);
        
        // SignatureChecker.isValidSignatureNow(signer, digest, signature);
        if (SignatureChecker.isValidSignatureNow(signer, digest, signature)) {
            (bool success, bytes memory retData) = address(this).delegatecall(
                abi.encodePacked(selector, payload)
            );
            require(success, "Call failed");

            return (success, retData);
        } else {
            revert InvalidSignature();
        }
    }

    function extractSigner(
        bytes calldata signature,
        bytes4 selector,
        bytes calldata payload,
        uint256 deadline
    ) public view returns (address, ECDSA.RecoverError) {
        bytes32 digest = createDigest(selector, payload, deadline);
        return ECDSA.tryRecover(digest, signature);
    }

    function createDigest(
        bytes4 selector,
        bytes calldata payload,
        uint256 deadline
    ) public view returns (bytes32) {
        require(block.timestamp < deadline, "Signed transaction expired");
        require(payload.length >= 32, "Payload of insufficient size");

        address signer = abi.decode(payload[payload.length - 32:], (address));

        require(signer != address(0x0), "Invalid signer null address");

        bytes32 functionHashStruct = keccak256(
            abi.encode(
                keccak256(
                    "authorizedCall(bytes4 selector,bytes payload,uint256 deadline)"
                ),
                selector,
                keccak256(abi.encodePacked(payload)),
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(functionHashStruct);
        return digest;
    }

    // function hashPayload(bytes calldata payload) public pure returns (bytes32) {
    //     return keccak256(abi.encodePacked(payload));
    // }

    // function domain() public view returns (bytes32) {
    //     return _domainSeparatorV4();
    // }

    function extractAddress(bytes calldata payload)
        public
        pure
        returns (address)
    {
        address signer = abi.decode(payload[payload.length - 32:], (address));
        return signer;
    }

    fallback() external payable {
        // bytes4 selector = msg.data[0];
        // string memory sel = string(selector);
        // console.log(
        // "Transferring from %s to %s %s tokens",
        // sel);
        // console.log(selector, msg.data);
    }

    receive() external payable {}
}
