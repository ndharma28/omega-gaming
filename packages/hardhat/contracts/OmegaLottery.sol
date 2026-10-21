// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @notice Same shape as Chainlink's IReceiver: the CRE KeystoneForwarder calls onReport().
interface IReceiver is IERC165 {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

contract OmegaLottery is IReceiver, Ownable, ReentrancyGuard {
    // ---------------------------------------------------------------------
    // CONFIG
    // ---------------------------------------------------------------------
    address private _treasuryAddress;
    uint256 private _winnerCut;

    /// @notice Chainlink forwarder allowed to call onReport. Owner can update it
    ///         (simulation uses a MockKeystoneForwarder, production uses KeystoneForwarder).
    address public creForwarder;

    uint256 public immutable _lotteryDuration;
    uint256 public immutable _defaultEntryFee;

    /// @notice If a round is still OPEN this long after endTime, anyone can refund it.
    uint256 public constant REFUND_DELAY = 6 hours;

    /// @dev Gas cap for ETH pushes so a hostile winner can't brick a draw.
    uint256 private constant PAYOUT_GAS = 50_000;

    // ---------------------------------------------------------------------
    // ERRORS
    // ---------------------------------------------------------------------
    error InsufficientFunds();
    error InvalidTreasuryAddress();
    error InvalidForwarder();
    error InvalidConfig();
    error UnauthorizedForwarder();
    error InvalidReport();

    error LotteryDNE();
    error LotteryEnded();
    error LotteryNotEnded();
    error LotteryNotOpen();
    error LotteryNotStarted();
    error NotLatestLottery();
    error PreviousLotteryNotResolved();
    error RefundNotAvailable();
    error NothingToWithdraw();
    error WithdrawFailed();

    // ---------------------------------------------------------------------
    // EVENTS
    // ---------------------------------------------------------------------
    event LotteryCreated(uint256 indexed lotteryId, uint256 entryFee, uint256 startTime, uint256 endTime);
    event LotteryEntered(uint256 indexed lotteryId, address indexed user, uint256 amount);
    event LotteryStatusUpdated(uint256 indexed lotteryId, LotteryStatus lotteryStatus, uint256 timestamp);
    event WinnerSelected(uint256 indexed lotteryId, address indexed user, uint256 randomValue);
    event WinnerPaid(uint256 indexed lotteryId, address indexed user, uint256 payout, uint256 fee, uint256 totalPot);
    event LotteryRefunded(uint256 indexed lotteryId, uint256 totalRefunded);
    event PayoutDeferred(address indexed to, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event ForwarderUpdated(address indexed newForwarder);

    // ---------------------------------------------------------------------
    // TYPES
    // ---------------------------------------------------------------------
    enum LotteryStatus {
        OPEN, // 0
        DRAWING, // 1
        RESOLVED // 2
    }

    struct Lottery {
        uint256 id;
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPot;
        LotteryStatus status;
        address winner;
        uint256 randomValue;
    }

    // ---------------------------------------------------------------------
    // STORAGE
    // ---------------------------------------------------------------------
    uint256 public lotteryIdCounter;
    mapping(uint256 => Lottery) internal lotteries;
    mapping(uint256 => address[]) internal lotteryPlayers;
    mapping(uint256 => mapping(address => uint256)) internal activePlayerStakes;
    mapping(uint256 => mapping(address => uint256)) internal playerTickets;
    mapping(uint256 => uint256) internal totalTickets;

    /// @notice ETH owed to addresses whose direct payout failed, or refunds.
    mapping(address => uint256) public claimable;

    constructor(
        address treasuryAddress,
        address forwarderAddress,
        uint256 defaultEntryFee,
        uint256 lotteryDuration,
        uint256 winnerCut
    ) Ownable(msg.sender) {
        if (treasuryAddress == address(0)) revert InvalidTreasuryAddress();
        if (forwarderAddress == address(0)) revert InvalidForwarder();
        if (defaultEntryFee == 0 || lotteryDuration == 0 || winnerCut > 100) revert InvalidConfig();

        _treasuryAddress = treasuryAddress;
        creForwarder = forwarderAddress;
        _defaultEntryFee = defaultEntryFee;
        _lotteryDuration = lotteryDuration;
        _winnerCut = winnerCut;

        lotteryIdCounter = 1;
        _createLottery();
    }

    // ---------------------------------------------------------------------
    // CRE RECEIVER
    // ---------------------------------------------------------------------

    /// @notice Called by the CRE KeystoneForwarder with a DON-signed report.
    /// @dev report = abi.encode(uint256 lotteryId, uint256 randomValue)
    function onReport(bytes calldata, /* metadata */ bytes calldata report) external override {
        if (msg.sender != creForwarder) revert UnauthorizedForwarder();
        if (report.length != 64) revert InvalidReport();

        (uint256 lotteryId, uint256 randomValue) = abi.decode(report, (uint256, uint256));
        _draw(lotteryId, randomValue);
    }

    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return interfaceId == type(IReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function setForwarder(address newForwarder) external onlyOwner {
        if (newForwarder == address(0)) revert InvalidForwarder();
        creForwarder = newForwarder;
        emit ForwarderUpdated(newForwarder);
    }

    // ---------------------------------------------------------------------
    // JOIN
    // ---------------------------------------------------------------------
    function joinLottery(uint256 lotteryId) external payable nonReentrant {
        if (lotteryId == 0 || lotteryId >= lotteryIdCounter) revert LotteryDNE();
        Lottery storage lottery = lotteries[lotteryId];

        if (block.timestamp < lottery.startTime) revert LotteryNotStarted();
        if (block.timestamp >= lottery.endTime) revert LotteryEnded();
        if (lottery.status != LotteryStatus.OPEN) revert LotteryNotOpen();
        if (msg.value < lottery.entryFee || msg.value % lottery.entryFee != 0) revert InsufficientFunds();

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

    // ---------------------------------------------------------------------
    // ROUND CREATION
    // ---------------------------------------------------------------------

    /// @notice Testing helper. Only allowed when the latest round is already resolved,
    ///         so it can no longer replace a live round and reset the countdown.
    function createLotteryManually() external onlyOwner {
        if (lotteries[lotteryIdCounter - 1].status != LotteryStatus.RESOLVED) revert PreviousLotteryNotResolved();
        _createLottery();
    }

    function _createLottery() internal {
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

    // ---------------------------------------------------------------------
    // DRAW
    // ---------------------------------------------------------------------
    function _draw(uint256 lotteryId, uint256 randomValue) internal nonReentrant {
        // Only the newest round can be drawn.
        if (lotteryId == 0 || lotteryId != lotteryIdCounter - 1) revert NotLatestLottery();

        Lottery storage lottery = lotteries[lotteryId];

        if (lottery.status != LotteryStatus.OPEN) revert LotteryNotOpen();
        if (block.timestamp < lottery.endTime) revert LotteryNotEnded();

        uint256 ticketCount = totalTickets[lotteryId];
        if (ticketCount == 0) {
            // Nobody entered: close the round and start a fresh one.
            lottery.status = LotteryStatus.RESOLVED;
            emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);
            _createLottery();
            return;
        }

        lottery.status = LotteryStatus.DRAWING;
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);

        lottery.randomValue = randomValue;

        // Pick the winning ticket and map it to a player.
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

        uint256 totalPot = lottery.totalPot;
        uint256 winnerPayout = (totalPot * _winnerCut) / 100;
        uint256 treasuryCut = totalPot - winnerPayout;

        // State is final before any external call.
        lottery.status = LotteryStatus.RESOLVED;
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);

        _pay(winnerAddress, winnerPayout);
        _pay(_treasuryAddress, treasuryCut);

        emit WinnerPaid(lotteryId, winnerAddress, winnerPayout, treasuryCut, totalPot);

        _createLottery();
    }

    /// @dev Tries a gas-capped push; if it fails the amount is parked in `claimable`.
    function _pay(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok,) = to.call{value: amount, gas: PAYOUT_GAS}("");
        if (!ok) {
            claimable[to] += amount;
            emit PayoutDeferred(to, amount);
        }
    }

    // ---------------------------------------------------------------------
    // SAFETY VALVES
    // ---------------------------------------------------------------------

    /// @notice If the CRE workflow never draws a round, anyone can refund it
    ///         once REFUND_DELAY has passed after endTime. Stakes go to `claimable`.
    function refundExpiredLottery(uint256 lotteryId) external nonReentrant {
        if (lotteryId == 0 || lotteryId >= lotteryIdCounter) revert LotteryDNE();
        Lottery storage lottery = lotteries[lotteryId];

        if (lottery.status != LotteryStatus.OPEN) revert LotteryNotOpen();
        if (block.timestamp < lottery.endTime + REFUND_DELAY) revert RefundNotAvailable();

        lottery.status = LotteryStatus.RESOLVED;
        emit LotteryStatusUpdated(lotteryId, lottery.status, block.timestamp);

        address[] storage players = lotteryPlayers[lotteryId];
        uint256 total;
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 stake = activePlayerStakes[lotteryId][player];
            if (stake > 0) {
                activePlayerStakes[lotteryId][player] = 0;
                claimable[player] += stake;
                total += stake;
            }
        }
        emit LotteryRefunded(lotteryId, total);

        // Keep the game going if this was the live round.
        if (lotteryId == lotteryIdCounter - 1) {
            _createLottery();
        }
    }

    /// @notice Pull any ETH owed to the caller (failed payouts or refunds).
    function withdraw() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        claimable[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(msg.sender, amount);
    }

    // ---------------------------------------------------------------------
    // OWNER
    // ---------------------------------------------------------------------
    function setWinnerCut(uint256 winnerCut) external onlyOwner {
        if (winnerCut > 100) revert InvalidConfig();
        _winnerCut = winnerCut;
    }

    // ---------------------------------------------------------------------
    // VIEWS (names match what the frontend ABI uses)
    // ---------------------------------------------------------------------
    function getLottery(uint256 lotteryId) external view returns (Lottery memory lottery) {
        return lotteries[lotteryId];
    }

    function getPlayersByLotteryId(uint256 lotteryId) external view returns (address[] memory players) {
        return lotteryPlayers[lotteryId];
    }

    function getPlayerCount(uint256 lotteryId) external view returns (uint256) {
        return lotteryPlayers[lotteryId].length;
    }

    function getStakeByUserAddress(uint256 lotteryId, address user) external view returns (uint256) {
        return activePlayerStakes[lotteryId][user];
    }

    function getPlayerTickets(uint256 lotteryId, address user) external view returns (uint256) {
        return playerTickets[lotteryId][user];
    }

    function getTotalTickets(uint256 lotteryId) external view returns (uint256) {
        return totalTickets[lotteryId];
    }

    function getLotteryStatusById(uint256 lotteryId) external view returns (uint8) {
        return uint8(lotteries[lotteryId].status);
    }

    function getTreasuryAddress() external view returns (address) {
        return _treasuryAddress;
    }

    function getWinnerCut() external view returns (uint256) {
        return _winnerCut;
    }
}