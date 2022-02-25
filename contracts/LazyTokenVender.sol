//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import "hardhat/console.sol";
contract LazyTokenVender is EIP712,OwnableUpgradeable {

    struct SaleInfo {
        address token;          // Seller's token address
        uint256 tokenId;        // ERC115's just multi token standard so need to select tokenId
        address tokenWanted;    // ERC20 token address
        address seller;         // seller's address
        uint256 amount;         // ERC115 token's amount 
        uint256 price;          // ERC115 token's price     
    }

    using ECDSA for bytes32;

    constructor() EIP712("LazySale-DataX", "1") {

    }

    function initialize(address _owner) public initializer {
        __Ownable_init();
        transferOwnership(_owner);
    }

    function redeem(address redeemer, SaleInfo calldata sale, bytes memory signature) external {
        address signer = _verify(sale, signature);
        require(IERC1155(sale.token).isApprovedForAll(signer, address(this)), "TokenVender: no permited");
        require(sale.token != address(0) && sale.tokenWanted != address(0), "Token Vender:invalid pair");
        require(sale.amount > 0, "Token Vender: insuficient balance!");


        IERC20(sale.tokenWanted).transferFrom(redeemer, signer, sale.price);
        IERC1155(sale.token).safeTransferFrom(signer, redeemer, sale.tokenId, 1, "");
    }

    /// @notice Returns a hash of the given SaleInfo, prepared using EIP712 typed data hashing rules.
    /// @param sale An SaleInfo to hash.
    function _hash(SaleInfo calldata sale) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("SaleInfo(address token,uint256 tokenId,address tokenWanted,address seller,uint256 amount,uint256 price)"),
            sale.token,
            sale.tokenId,
            sale.tokenWanted,
            sale.seller,
            sale.amount,
            sale.price
        )));
    }

  /// @notice Verifies the signature for a given SaleInfo, returning the address of the signer.
  /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
  /// @param sale An SaleInfo describing an unregistered sale.
  /// @param signature An EIP712 signature of the given voucher.
    function _verify(SaleInfo calldata sale, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hash(sale);
        return digest.toEthSignedMessageHash().recover(signature);
    }
    

}
