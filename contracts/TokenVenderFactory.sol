
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CloneFactory.sol";
import "./TokenVender.sol";
contract TokenVenderFactory is Ownable, CloneFactory {
    mapping(address => address) public splitterForUser;
    address public impl;
    constructor(address _impl) {
        impl = _impl;
    } 
    function createTokenVender(address instanceOwner) external onlyOwner {
        require(splitterForUser[instanceOwner] == address(0), "TokenVender Facltory: already created");
        address clone = createClone(impl);
        TokenVender(clone).initialize(instanceOwner); //new ETHAndTokenSplitter(userPayees);
        splitterForUser[instanceOwner] = clone;
    }
}