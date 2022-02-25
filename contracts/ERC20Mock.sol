//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory tokenName, string memory tokenUint) ERC20(tokenName,tokenUint) {

    }
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}