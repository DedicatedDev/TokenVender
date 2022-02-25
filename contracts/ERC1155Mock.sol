//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC1155MOCKToken is ERC1155 {
    uint256 public constant DATAX = 0;
    constructor (string memory uri_) ERC1155 (uri_) {}
    function send() external {
        require(balanceOf(msg.sender, DATAX) <= 0, "you already have a this token");
        _mint(msg.sender, DATAX, 2, "0x00");
    }
}
