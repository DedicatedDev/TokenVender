//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
contract TokenVender is OwnableUpgradeable   {
    using Counters for Counters.Counter;
    Counters.Counter private saleIds_;
    struct SaleInfo {
        address token;          // Seller's token address
        uint256 tokenId;        // ERC115's just multi token standard so need to select tokenId
        address tokenWanted;    // ERC20 token address
        address seller;         // seller's address
        uint256 amount;         // ERC115 token's amount 
        uint256 price;          // ERC115 token's price
        uint256 deadline;       // deadline
    }
    mapping(uint256 => SaleInfo) private saleInfos_;
    uint256 private constant _TIMELOCK = 1 days;
    mapping(uint256 => uint256) public timelock;

    function initialize(address _owner) public initializer {
        __Ownable_init();
        transferOwnership(_owner);
    }

    function registerSale(address token_, uint256 tokenId_, address tokenWanted_, uint256 amount_, uint256 price_, uint256 period_) external {
        require(token_ != address(0) && tokenWanted_ != address(0) && price_ > 0 && period_ > 0 && amount_ > 0, "TokenVender: invalid input info");
        require(IERC1155(token_).isApprovedForAll(msg.sender, address(this)), "TokenVender: no permited");
        uint256 newTokenId = saleIds_.current();
        SaleInfo memory newSale = SaleInfo(token_, tokenId_, tokenWanted_,msg.sender, amount_, price_,block.timestamp + period_);
        saleInfos_[newTokenId] = newSale;
        saleIds_.increment();
    }

    function buyToken(uint _saleId) external {
        SaleInfo memory sale = saleInfos_[_saleId];
        require(sale.token != address(0) && sale.tokenWanted != address(0), "Token Vender:invalid pair");
        require(sale.amount > 0, "Token Vender: insuficient balance!");
        require(block.timestamp <= sale.deadline, "Token Vender: sale expired!");
        IERC20(sale.tokenWanted).transferFrom(msg.sender, sale.seller, sale.price);
        IERC1155(sale.token).safeTransferFrom(sale.seller, msg.sender, sale.tokenId, 1, "");
    }

    function getSales() external view returns(SaleInfo[] memory) {
        SaleInfo[] memory _saleInfos = new SaleInfo[](saleIds_.current());
        for (uint256 index = 0; index < saleIds_.current(); index++) {
            SaleInfo memory sale = saleInfos_[index];
            _saleInfos[index] = sale;
        }
        return _saleInfos;
    }
    
    //@reactive sale. after deadline expired user's sale will be deactive. this function will permit reactive sale for sale
    function reActiveSale(uint256 _saleId, uint256 period) external {
        SaleInfo memory sale = saleInfos_[_saleId];
        require(sale.token != address(0) && sale.tokenWanted != address(0), "Token Vender:invalid pair");
        require(msg.sender == sale.seller, "Token Vender: can't access ot other's sale");
        sale.deadline = block.timestamp + period;
        saleInfos_[_saleId] = sale;
    }

}
