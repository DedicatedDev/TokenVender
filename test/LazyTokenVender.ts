import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC1155MOCKToken, ERC1155MOCKToken__factory, ERC20Mock, ERC20Mock__factory, LazyTokenVender, LazyTokenVender__factory } from "../typechain";
import { expect } from "chai";
const { ethers } = require("hardhat");
const {SaleSeller} = require("../lib")

// async function deploy() {
//     const [seller, redeemer] = await ethers.getSigners();

//     const factory: LazyTokenVender__factory = await ethers.getContractFactory(
//         "Lazy",
//         seller);
//     const contract = await factory.deploy(seller.address)

//   // the redeemerContract is an instance of the contract that's wired up to the redeemer's signing key
//     const redeemerFactory = factory.connect(redeemer)
//     const redeemerContract = redeemerFactory.attach(contract.address)

//     return {
//         minter: seller,
//         redeemer,
//         contract,
//         redeemerContract,
//     }
// }

describe("LazySelling", function() {
    let mockERC20Factory:ERC20Mock__factory;
    let mockERC20:ERC20Mock
    let salesTokenFactory:ERC1155MOCKToken__factory
    let salesToken:ERC1155MOCKToken
    
    let lazyTokenVenderFactory:LazyTokenVender__factory;
    let lazyVender:LazyTokenVender;
    let redeemerFactory:LazyTokenVender__factory;
    let redeemerContract:LazyTokenVender;
    let seller:SignerWithAddress;
    let redeemer:SignerWithAddress;


    beforeEach(async ()=>{
        const signers = await ethers.getSigners();
        seller = signers[0];
        redeemer = signers[1];

        //ERC20 mock token deploy
        mockERC20Factory = await ethers.getContractFactory("ERC20Mock");
        mockERC20 = await mockERC20Factory.deploy("DATAX", "DTX");
        await mockERC20.deployed();

        //ERC1155 mock token deploy
        salesTokenFactory = await ethers.getContractFactory("ERC1155MOCKToken");
        salesToken = await salesTokenFactory.deploy("https://ipfs.io/ipfs/bafybeibjyk3y5i3ixlamzqzkycufgb3nhoggaloscummimbsmamtwag2ju/{id}.json");
        await mockERC20.deployed();
        mockERC20.mint(redeemer.address, 1e4);
        salesToken.connect(seller).send();
    })

    it("Should deploy", async function() {
        lazyTokenVenderFactory = await ethers.getContractFactory("LazyTokenVender");
        lazyVender = await lazyTokenVenderFactory.deploy();
        await lazyVender.deployed()

        redeemerFactory = lazyTokenVenderFactory.connect(redeemer);
        redeemerContract = redeemerFactory.attach(lazyVender.address);
    });

    it("Should redeem an Sale from a signed sale", async function() {
        const lazySeller = new SaleSeller(lazyVender.address, seller);
        const tokenId = await salesToken.DATAX();
        const { sale, signature } = await lazySeller.createSale(
            salesToken.address,
            tokenId,
            mockERC20.address,
            seller.address,
            1,
            10,
        );
        await salesToken.connect(seller).setApprovalForAll(redeemerContract.address,true)
        await mockERC20.connect(redeemer).approve(redeemerContract.address, 10);
        await redeemerContract.redeem(redeemer.address, sale, signature)
        
        expect(await salesToken.balanceOf(seller.address, tokenId)).to.equal(1);
        expect(await mockERC20.balanceOf(seller.address)).to.equal(10);
        expect(await salesToken.balanceOf(redeemer.address,tokenId)).to.equal(1);
    
    });

    it("Should reject an Sale when mockToken value is less than price", async function() {
        const lazySeller = new SaleSeller(lazyVender.address, seller);
        const tokenId = await salesToken.DATAX();
        const { sale, signature } = await lazySeller.createSale(
            salesToken.address,
            tokenId,
            mockERC20.address,
            seller.address,
            1,
            10,
        );
        await salesToken.connect(seller).setApprovalForAll(redeemerContract.address,true)
        await mockERC20.connect(redeemer).approve(redeemerContract.address, 5);
        await expect(redeemerContract.redeem(redeemer.address, sale, signature)).to.reverted
    });

    

});