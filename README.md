# Sale Token
1. General solution
 File Name: TokenVender.sol
 Seller register Sale Info to contract and contract generate ID by Counter and create mapping
 to save this sale info. 
 sale info included 
 token: ERC1155 Token Address 
 tokenId: ERC1155 is just multi token standard so need to point detailed tokenId
 tokenWaned: ERC20 Token which seller wanted. assume seller point which he want token type:ERC20
 amount: the amount of ERC1155 token.
 price: ratio - ERC1155 token : ERC20 token
 deadline: time limitation which active this sale info. 

 Buyer only one ERCToken with buy token transaction in deadline. 

 2. Lazy Sale solution. 
 In over model, seller have to register his sale info to sell. 
 but who knows someone buy this token or not. 
 if seller register 100 ERC1155 Token:NFT and to register, takes 30$ gas fee, it's just 3000$. 
 it drop down seller's loyalty to platform. 

 so to avoid this, can implement lazy sale function. it means that sell transaction delay when buyer appear. 
 To implement this, need to implement backend + frontend + smart contract architecture. 
 when user register sale info to service backend. it does not takes gas fee so it can upgrade seller's loyalty about service. frontend display registered sale info by API with backend. 

 when buyer want to take one from this list, lazy seller smart contact will implement this. 
 in second solution, it does not need register process and fetch sales code so decrease initial deploy gas fee and transaction fee. also upgrade seller's loyalty. 

 3. Code Test method 
 - npx hardhat test 
 - checked code with slither
    slither setting already included so run follow command. 
    slither . 
