import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TypedDataDomain, TypedDataTypes } from "ethers-eip712";

const { TypedDataUtils } = require("ethers-eip712");
const SIGNING_DOMAIN_NAME = "LazySale-DataX";
const SIGNING_DOMAIN_VERSION = "1";

class SaleSeller {
    contractAddress: string = "";
    signer: SignerWithAddress;
    types: TypedDataTypes;
    _domain: TypedDataDomain;

    constructor(_contractAddress: string, _signer: SignerWithAddress) {
        this.signer = _signer;
        this.contractAddress = _contractAddress;
        this._domain = {};
        this.types = {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },],
        SaleInfo: [
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "tokenWanted", type: "address" },
            { name: "seller", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "price", type: "uint256" }
        ],
    };
}


async _signingDomain() {
    // if (this._domain != null) {
    //   return this._domain;
    // }
    const chainId = await this.signer.getChainId();
    this._domain = {
        name: SIGNING_DOMAIN_NAME,
        version: SIGNING_DOMAIN_VERSION,
        verifyingContract: this.contractAddress,
        chainId,
    };
    return this._domain;
}

async _formatSale(sale: object) {
    const domain = await this._signingDomain();
    return {
        domain,
        types: this.types,
        primaryType: "SaleInfo",
        message: sale,
    };
}


async createSale(token:string,tokenId: number, tokenWanted: string, seller: string, amount:number, price:number) {
    const sale = { token, tokenId, tokenWanted, seller, amount, price};
    const typedData = await this._formatSale(sale);
    const digest = TypedDataUtils.encodeDigest(typedData);
    const signature = await this.signer.signMessage(digest);
    return {
        sale,
        signature,
        digest,
        };
    }
}

module.exports = {
    SaleSeller,
};