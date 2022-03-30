//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    uint256 public i;

    constructor() {}

    function callMe(uint256 j) public {
        i += j;
    }

    function getData(uint256 j) public pure returns (bytes memory) {
        return abi.encodeWithSignature("callMe(uint256)", j);
    }
}
