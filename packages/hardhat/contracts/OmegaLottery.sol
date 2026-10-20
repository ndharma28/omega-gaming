// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OmegaLottery is Ownable, ReentrancyGuard
{
    using Strings for uint256;

    // Treasury Address
    address _treasuryAddress;
    uint256 _winnerCut;

    // CRE Forwarder Address for Sepolia
    address public immutable CRE_FORWARDER;

    // ERRORS
    error InsufficientFunds();
    error InvalidEntryTime();
    error InvalidTreasuryAddress();
    error UnauthorizedForwarder();

    error LotteryDNE();
    error LotteryEnded();
    error LotteryNotEnded();
    error LotteryNotOpen();
    error LotteryNotStarted();

    error NotEnoughPlayers();

    // Lottery Creation
    uint256 public immutable _lotteryDuration;
    uint256 public immutable _defaultEntryFee;
    
    // EVENTS
    event LotteryCreated
    (
        uint256 indexed lotteryId,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime
    );

    event LotteryEntered
    (
        uint256 indexed lotteryId,
        address indexed user,
        uint256 amount
    );

    event LotteryStatusUpdated
    (
        uint256 indexed lotteryId,
        LotteryStatus lotteryStatus,
        uint256 timestamp
    );

    event WinnerSelected
    (
        uint256 indexed lotteryId,
        address indexed user,
        uint256 randomValue
    );

    event WinnerPaid
    (
        uint256 indexed lotteryId,
        address indexed user,
        uint256 payout,
        uint256 fee,
        uint256 totalPot
    );

    // TYPES
    enum LotteryStatus 
    {
        OPEN,         // 0
        DRAWING,      // 1
        RESOLVED      // 2
    }

    struct Lottery 
    {
        uint256 id;
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPot;
        LotteryStatus status;
        address winner;
        uint256 randomValue;
    }

    // STORAGE
    uint256 public lotteryIdCounter;
    mapping(uint256 => Lottery) internal lotteries;
    mapping(uint256 => address[]) internal lotteryPlayers;
    mapping(uint256 => mapping(address => uint256)) internal activePlayerStakes;
    mapping(uint256 => mapping(address => uint256)) internal playerTickets;
    mapping(uint256 => uint256) internal totalTickets;

    modifier onlyForwarder() {
        if (msg.sender != CRE_FORWARDER) revert UnauthorizedForwarder();
        _;
    }

    constructor(
        address treasuryAddress, 
        address forwarderAddress,
        uint256 defaultEntryFee, 
        uint256 lotteryDuration, 
        uint256 winnerCut
    ) Ownable(msg.sender) {
        _treasuryAddress = treasuryAddress;
        CRE_FORWARDER = forwarderAddress;

        lotteryIdCounter = 1;
        _defaultEntryFee = defaultEntryFee;
        _lotteryDuration = lotteryDuration;
        _winnerCut = winnerCut;
        
        // immediately create first lottery
        _createLottery();
    }

    // JOIN LOTTERY
    function joinLottery(uint256 lotteryId) external payable nonReentrant
    {
        Lottery storage lottery = lotteries[lotteryId];

        if (lotteryId == 0) revert LotteryDNE();
        if (block.timestamp < lottery.startTime) revert LotteryNotStarted();
        if (block.timestamp >= lottery.endTime) revert LotteryEnded();
        if (msg.value < lottery.entryFee) revert InsufficientFunds();
        if (lottery.status != LotteryStatus.OPEN) revert LotteryNotOpen();
        if (msg.value % lottery.entryFee != 0) revert InsufficientFunds();

        uint256 tickets = msg.value / lottery.entryFee;

        if (activePlayerStakes[lotteryId][msg.sender] == 0) {
            lotteryPlayers[lotteryId].push(msg.sender);
        }

        playerTickets[lotteryId][msg.sender] += tickets;
        totalTickets[lotteryId] += tickets;

        lottery.totalPot += msg.value;
        activePlayerStakes[lotteryId][msg.sender] += msg.value;

        emit LotteryEntered(lotteryId, msg.sender, msg.value);
    }

    // MANUAL CREATION HELPER FOR TESTING
    function createLotteryManually() external onlyOwner {
        _createLottery();
    }
    
    // LOTTERY CREATION
    function _createLottery() internal 
    {
        uint256 lotteryId = lotteryIdCounter++;

        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + _lotteryDuration;

        Lottery storage lottery = lotteries[lotteryId];
        lottery.id = lotteryId;
        lottery.entryFee = _defaultEntryFee;
        lottery.startTime = startTime;
        lottery.endTime = endTime;
        lottery.status = LotteryStatus.OPEN;

        emit LotteryCreated(lotteryId, _defaultEntryFee, startTime, endTime);
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);
    }

    // FULFILL DRAW (CALLED BY CRE WORKFLOW VIA FORWARDER)
    function fulfillDraw(uint256 lotteryId, uint256 randomValue) external onlyForwarder nonReentrant
    {
        Lottery storage lottery = lotteries[lotteryId];
        
        if (lottery.status != LotteryStatus.OPEN) revert LotteryNotOpen();
        
        uint256 ticketCount = totalTickets[lotteryId];
        if (ticketCount == 0) {
            // Rollover if no players joined
            lottery.status = LotteryStatus.RESOLVED;
            emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);
            _createLottery();
            return;
        }

        lottery.status = LotteryStatus.DRAWING;
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);

        lottery.randomValue = randomValue;

        // Select Winner
        uint256 winningTicket = randomValue % ticketCount;
        uint256 cumulativeTickets = 0;
        address[] storage players = lotteryPlayers[lotteryId];
        address winnerAddress;

        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            cumulativeTickets += playerTickets[lotteryId][player];

            if (winningTicket < cumulativeTickets) {
                winnerAddress = player;
                break;
            }
        }

        lottery.winner = winnerAddress;
        emit WinnerSelected(lotteryId, winnerAddress, randomValue);

        // Pay Winner & Treasury
        uint256 totalPot = lottery.totalPot;
        uint256 winnerPayout = (totalPot * _winnerCut) / 100;
        uint256 treasuryCut = totalPot - winnerPayout;

        (bool winnerCall, ) = winnerAddress.call{value: winnerPayout}("");
        require(winnerCall, "Winner transfer failed");

        (bool treasuryCall, ) = _treasuryAddress.call{value: treasuryCut}("");
        require(treasuryCall, "Treasury transfer failed");

        emit WinnerPaid(lotteryId, winnerAddress, winnerPayout, treasuryCut, totalPot);

        lottery.status = LotteryStatus.RESOLVED;
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);

        _createLottery();
    }

    function setWinnerCut(uint256 winnerCut) external onlyOwner
    {
        require(winnerCut <= 100, "Invalid winner cut");
        _winnerCut = winnerCut;
    }

    // VIEW FUNCTIONS
    function getLottery(uint256 lotteryId) external view returns (Lottery memory lottery)
    {
        return lotteries[lotteryId];
    }

    function getPlayersByLotteryId(uint256 lotteryId) external view returns (address[] memory players)
    {
        return lotteryPlayers[lotteryId];
    }
}