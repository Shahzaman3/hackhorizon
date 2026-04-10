// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvoiceValidation {
    mapping(bytes32 => bool) public verifiedInvoices;

    function storeInvoiceHash(bytes32 hash) public {
        require(!verifiedInvoices[hash], "Already stored");
        verifiedInvoices[hash] = true;
    }

    function verifyInvoice(bytes32 hash) public view returns (bool) {
        return verifiedInvoices[hash];
    }
}
