import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { time } from "console";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ERC1155MOCKToken, ERC1155MOCKToken__factory, ERC20Mock, ERC20Mock__factory, TokenVender, TokenVenderFactory, TokenVenderFactory__factory, TokenVender__factory } from "../typechain";

describe("TokenVender", () => {
    let mockERC20Factory:ERC20Mock__factory;
    let mockERC20:ERC20Mock
    let salesTokenFactory:ERC1155MOCKToken__factory
    let salesToken:ERC1155MOCKToken
    let tokenVenderFactory:TokenVender__factory
    let tokenVender:TokenVender
    let accounts:SignerWithAddress[]
    let tokenVenderDeployerFactory:TokenVenderFactory__factory
    let tokenVenderDeployer:TokenVenderFactory

    function delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    before(async()=>{
        accounts = await ethers.getSigners();
        //ERC20 mock token deploy
        mockERC20Factory = await ethers.getContractFactory("ERC20Mock");
        mockERC20 = await mockERC20Factory.deploy("DATAX", "DTX");
        await mockERC20.deployed();

        //ERC1155 mock token deploy
        salesTokenFactory = await ethers.getContractFactory("ERC1155MOCKToken");
        salesToken = await salesTokenFactory.deploy("https://ipfs.io/ipfs/bafybeibjyk3y5i3ixlamzqzkycufgb3nhoggaloscummimbsmamtwag2ju/{id}.json");
        await mockERC20.deployed();
        mockERC20.mint(accounts[2].address, 1e4);
        

        //Main contract deploy
        tokenVenderFactory = await ethers.getContractFactory("TokenVender");
        
        tokenVender = await tokenVenderFactory.deploy();
        await tokenVender.deployed()
        
        //Main contract initialize 
        //await tokenVender.initialize(accounts[0].address);
        
        
    });

    it("should be success in registering Sale", async () => {
        salesToken.connect(accounts[1]).send();
        const tokenId = await salesToken.DATAX();
        await salesToken.connect(accounts[1]).setApprovalForAll(tokenVender.address,true)
        await expect(tokenVender.connect(accounts[1]).registerSale(salesToken.address,tokenId, mockERC20.address, 1, 10,1000)).to.not.reverted;
        await expect(tokenVender.connect(accounts[1]).registerSale(salesToken.address,tokenId, mockERC20.address, 1, 20,1)).to.not.reverted;
    })

    it("shoud be success in buying Sale", async () => {
        const tokenId = await salesToken.DATAX();
        await mockERC20.connect(accounts[2]).approve(tokenVender.address, 10);
        await tokenVender.connect(accounts[2]).buyToken(0);
        expect(await salesToken.balanceOf(accounts[2].address, tokenId)).to.equal(1);
    })

    it("Should be rejected buy after time limit", async () => {
        const tokenId = await salesToken.DATAX();
        await mockERC20.connect(accounts[2]).approve(tokenVender.address, 20);
        delay(2000);
        await expect(tokenVender.connect(accounts[2]).buyToken(1)).to.reverted;
    })

    it("Should be reject in reactive", async () => {
        await expect(  tokenVender.connect(accounts[3]).reActiveSale(1, 10)).to.reverted;
    })

    it("Should be success in reactive", async () => {
        await tokenVender.connect(accounts[1]).reActiveSale(1, 50)
        await expect(tokenVender.connect(accounts[2]).buyToken(1)).to.not.reverted;
    })
})