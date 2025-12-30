// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CashbackManager
 * @author ETH Cash Back Team
 * @notice Manages ETH cashback distribution for Web3 dApps
 * @dev Implements CEI pattern, reentrancy protection, and pausable functionality
 */
contract CashbackManager is ReentrancyGuard, Pausable {
    // ============ Type Declarations ============

    /**
     * @notice Cashback rule configuration
     * @param percentage Cashback percentage in basis points (100 = 1%, max 1000 = 10%)
     * @param cap Maximum cashback per transaction in wei
     * @param cumulativeLimit Maximum total cashback per user in wei
     * @param validFrom Timestamp when rule becomes active
     * @param validUntil Timestamp when rule expires
     * @param active Whether the rule is currently active
     */
    struct Rule {
        uint256 percentage;
        uint256 cap;
        uint256 cumulativeLimit;
        uint256 validFrom;
        uint256 validUntil;
        bool active;
    }

    /**
     * @notice Per-user usage tracking
     * @param totalReceived Cumulative cashback received in wei
     * @param transactionCount Number of cashback transactions
     * @param lastUpdated Timestamp of last transaction
     */
    struct Usage {
        uint256 totalReceived;
        uint256 transactionCount;
        uint256 lastUpdated;
    }

    // ============ Constants ============

    /// @notice Maximum allowed cashback percentage (10% = 1000 basis points)
    uint256 public constant MAX_PERCENTAGE = 1000;

    /// @notice Basis points divisor for percentage calculations
    uint256 private constant BASIS_POINTS = 10000;

    // ============ State Variables ============

    /// @notice Admin address for privileged operations
    address public admin;

    /// @notice Cashback rules indexed by rule ID
    mapping(bytes32 => Rule) public rules;

    /// @notice Per-user usage tracking
    mapping(address => Usage) public userUsage;

    // ============ Events ============

    /**
     * @notice Emitted when a new cashback rule is registered
     * @param ruleId Unique identifier for the rule
     * @param percentage Cashback percentage in basis points
     * @param cap Maximum cashback per transaction
     * @param cumulativeLimit Maximum total cashback per user
     * @param validFrom Activation timestamp
     * @param validUntil Expiration timestamp
     */
    event RuleRegistered(
        bytes32 indexed ruleId,
        uint256 percentage,
        uint256 cap,
        uint256 cumulativeLimit,
        uint256 validFrom,
        uint256 validUntil
    );

    /**
     * @notice Emitted when cashback is distributed to a user
     * @param user Recipient address
     * @param amount Cashback amount in wei
     * @param ruleId Rule used for calculation
     * @param transactionValue Original transaction value
     */
    event CashbackDistributed(
        address indexed user,
        uint256 amount,
        bytes32 indexed ruleId,
        uint256 transactionValue
    );

    /**
     * @notice Emitted when admin withdraws funds
     * @param admin Admin address
     * @param amount Amount withdrawn in wei
     */
    event FundsWithdrawn(address indexed admin, uint256 amount);

    /**
     * @notice Emitted when admin is changed
     * @param oldAdmin Previous admin address
     * @param newAdmin New admin address
     */
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    // ============ Errors ============

    /// @notice Caller is not authorized
    error Unauthorized();

    /// @notice Invalid percentage value (must be 1-1000)
    error InvalidPercentage(uint256 percentage);

    /// @notice Amount cannot be zero
    error ZeroAmount();

    /// @notice Validity window cannot be zero
    error InvalidValidityWindow();

    /// @notice Address cannot be zero
    error ZeroAddress();

    /// @notice Rule does not exist
    error RuleNotFound();

    /// @notice Rule has expired
    error RuleExpired();

    /// @notice Rule is not active
    error RuleInactive();

    /// @notice User has exceeded cumulative limit
    error LimitExceeded();

    /// @notice Contract has insufficient funds for transfer
    error InsufficientFunds(uint256 requested, uint256 available);

    /// @notice ETH transfer failed
    error TransferFailed();

    /// @notice Contract is already paused
    error AlreadyPaused();

    /// @notice Contract is not paused
    error NotPaused();

    // ============ Modifiers ============

    /**
     * @notice Restricts function to admin only
     */
    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initializes the contract with the deployer as admin
     */
    constructor() {
        admin = msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Registers a new cashback rule
     * @dev Only admin can register rules. Rule ID is deterministically generated.
     * @param percentage Cashback percentage in basis points (1-1000, where 100 = 1%)
     * @param cap Maximum cashback per transaction in wei (must be > 0)
     * @param cumulativeLimit Maximum total cashback per user in wei (must be > 0)
     * @param validityWindow Duration in seconds the rule remains active (must be > 0)
     * @return ruleId Unique identifier for the registered rule
     */
    function registerRule(
        uint256 percentage,
        uint256 cap,
        uint256 cumulativeLimit,
        uint256 validityWindow
    ) external onlyAdmin whenNotPaused returns (bytes32 ruleId) {
        // Validate percentage (1-1000 basis points = 0.01% - 10%)
        if (percentage == 0 || percentage > MAX_PERCENTAGE) {
            revert InvalidPercentage(percentage);
        }

        // Validate cap
        if (cap == 0) revert ZeroAmount();

        // Validate cumulative limit
        if (cumulativeLimit == 0) revert ZeroAmount();

        // Validate validity window
        if (validityWindow == 0) revert InvalidValidityWindow();

        // Generate rule ID
        ruleId = keccak256(
            abi.encode(percentage, cap, cumulativeLimit, validityWindow, block.timestamp)
        );

        // Calculate validity period
        uint256 validFrom = block.timestamp;
        uint256 validUntil = block.timestamp + validityWindow;

        // Store rule
        rules[ruleId] = Rule({
            percentage: percentage,
            cap: cap,
            cumulativeLimit: cumulativeLimit,
            validFrom: validFrom,
            validUntil: validUntil,
            active: true
        });

        // Emit event
        emit RuleRegistered(
            ruleId,
            percentage,
            cap,
            cumulativeLimit,
            validFrom,
            validUntil
        );

        return ruleId;
    }

    /**
     * @notice Processes a transaction and distributes cashback to the sender
     * @dev Follows CEI pattern. Protected against reentrancy.
     * @param ruleId The cashback rule to apply
     */
    function processTransaction(bytes32 ruleId) external payable nonReentrant whenNotPaused {
        // CHECKS: Load and validate rule
        Rule memory rule = rules[ruleId];

        if (rule.validFrom == 0) revert RuleNotFound();
        if (!rule.active) revert RuleInactive();
        if (block.timestamp > rule.validUntil) revert RuleExpired();

        // CHECKS: Load user usage
        Usage storage usage = userUsage[msg.sender];

        // CHECKS: Validate user hasn't exceeded limit
        if (usage.totalReceived >= rule.cumulativeLimit) revert LimitExceeded();

        // Calculate cashback
        uint256 cashback = _calculateCashbackInternal(rule, usage, msg.value);

        // CHECKS: Validate contract balance
        if (address(this).balance < cashback) {
            revert InsufficientFunds(cashback, address(this).balance);
        }

        // EFFECTS: Update user usage
        usage.totalReceived += cashback;
        usage.transactionCount += 1;
        usage.lastUpdated = block.timestamp;

        // INTERACTIONS: Transfer cashback
        if (cashback > 0) {
            (bool success, ) = msg.sender.call{value: cashback}("");
            if (!success) revert TransferFailed();
        }

        // Emit event
        emit CashbackDistributed(msg.sender, cashback, ruleId, msg.value);
    }

    /**
     * @notice Withdraws ETH from the contract to admin
     * @dev Only admin can withdraw funds
     * @param amount Amount to withdraw in wei
     */
    function withdrawFunds(uint256 amount) external onlyAdmin {
        if (amount == 0) revert ZeroAmount();

        if (address(this).balance < amount) {
            revert InsufficientFunds(amount, address(this).balance);
        }

        (bool success, ) = admin.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(admin, amount);
    }

    /**
     * @notice Pauses the contract
     * @dev Only admin can pause. Prevents processTransaction and registerRule.
     */
    function pause() external onlyAdmin {
        if (paused()) revert AlreadyPaused();
        _pause();
    }

    /**
     * @notice Unpauses the contract
     * @dev Only admin can unpause
     */
    function unpause() external onlyAdmin {
        if (!paused()) revert NotPaused();
        _unpause();
    }

    /**
     * @notice Transfers admin role to a new address
     * @dev Only current admin can transfer. Cannot transfer to zero address.
     * @param newAdmin Address of the new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();

        address oldAdmin = admin;
        admin = newAdmin;

        emit AdminChanged(oldAdmin, newAdmin);
    }

    // ============ View Functions ============

    /**
     * @notice Calculates cashback for a given transaction (preview)
     * @dev View function for frontend preview. Returns 0 for invalid/expired rules.
     * @param ruleId The cashback rule to apply
     * @param user The user address
     * @param amount The transaction amount in wei
     * @return cashback The calculated cashback amount in wei
     */
    function calculateCashback(
        bytes32 ruleId,
        address user,
        uint256 amount
    ) external view returns (uint256 cashback) {
        // Load rule
        Rule memory rule = rules[ruleId];

        // Return 0 for invalid/expired rules (no revert for preview)
        if (rule.validFrom == 0) return 0;
        if (!rule.active) return 0;
        if (block.timestamp > rule.validUntil) return 0;

        // Load user usage
        Usage memory usage = userUsage[user];

        // Return 0 if limit exhausted
        if (usage.totalReceived >= rule.cumulativeLimit) return 0;

        // Calculate and return
        return _calculateCashbackInternal(rule, usage, amount);
    }

    /**
     * @notice Gets usage statistics for a user
     * @dev Returns zeroes for users with no transactions
     * @param user The user address to query
     * @return totalReceived Cumulative cashback received in wei
     * @return transactionCount Number of cashback transactions
     * @return lastUpdated Timestamp of last transaction
     */
    function getUserUsage(
        address user
    ) external view returns (uint256 totalReceived, uint256 transactionCount, uint256 lastUpdated) {
        Usage memory usage = userUsage[user];
        return (usage.totalReceived, usage.transactionCount, usage.lastUpdated);
    }

    /**
     * @notice Gets rule details by ID
     * @param ruleId The rule ID to query
     * @return percentage Cashback percentage in basis points
     * @return cap Maximum cashback per transaction
     * @return cumulativeLimit Maximum total cashback per user
     * @return validFrom Activation timestamp
     * @return validUntil Expiration timestamp
     * @return active Whether the rule is active
     */
    function getRule(
        bytes32 ruleId
    )
        external
        view
        returns (
            uint256 percentage,
            uint256 cap,
            uint256 cumulativeLimit,
            uint256 validFrom,
            uint256 validUntil,
            bool active
        )
    {
        Rule memory rule = rules[ruleId];
        return (
            rule.percentage,
            rule.cap,
            rule.cumulativeLimit,
            rule.validFrom,
            rule.validUntil,
            rule.active
        );
    }

    // ============ Internal Functions ============

    /**
     * @notice Internal cashback calculation logic
     * @dev Applies percentage, per-tx cap, and user limit
     * @param rule The cashback rule
     * @param usage The user's current usage
     * @param amount The transaction amount
     * @return finalCashback The final cashback amount
     */
    function _calculateCashbackInternal(
        Rule memory rule,
        Usage memory usage,
        uint256 amount
    ) internal pure returns (uint256 finalCashback) {
        // Step 1: Calculate raw cashback
        uint256 rawCashback = (amount * rule.percentage) / BASIS_POINTS;

        // Step 2: Apply per-transaction cap
        uint256 cappedCashback = rawCashback > rule.cap ? rule.cap : rawCashback;

        // Step 3: Apply user cumulative limit
        uint256 remainingLimit = rule.cumulativeLimit - usage.totalReceived;
        finalCashback = cappedCashback > remainingLimit ? remainingLimit : cappedCashback;

        return finalCashback;
    }

    // ============ Receive Function ============

    /**
     * @notice Accepts ETH deposits to fund cashback distributions
     */
    receive() external payable {}
}
