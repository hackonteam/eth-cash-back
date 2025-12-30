// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICashbackManager
 * @notice Interface for the CashbackManager contract
 * @dev Defines the public API for cashback management
 */
interface ICashbackManager {
    // ============ Events ============

    event RuleRegistered(
        bytes32 indexed ruleId,
        uint256 percentage,
        uint256 cap,
        uint256 cumulativeLimit,
        uint256 validFrom,
        uint256 validUntil
    );

    event CashbackDistributed(
        address indexed user,
        uint256 amount,
        bytes32 indexed ruleId,
        uint256 transactionValue
    );

    event FundsWithdrawn(address indexed admin, uint256 amount);

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    // ============ Errors ============

    error Unauthorized();
    error InvalidPercentage(uint256 percentage);
    error ZeroAmount();
    error InvalidValidityWindow();
    error ZeroAddress();
    error RuleNotFound();
    error RuleExpired();
    error RuleInactive();
    error LimitExceeded();
    error InsufficientFunds(uint256 requested, uint256 available);
    error TransferFailed();
    error AlreadyPaused();
    error NotPaused();

    // ============ External Functions ============

    /**
     * @notice Registers a new cashback rule
     * @param percentage Cashback percentage in basis points (1-1000)
     * @param cap Maximum cashback per transaction in wei
     * @param cumulativeLimit Maximum total cashback per user in wei
     * @param validityWindow Duration in seconds the rule remains active
     * @return ruleId Unique identifier for the registered rule
     */
    function registerRule(
        uint256 percentage,
        uint256 cap,
        uint256 cumulativeLimit,
        uint256 validityWindow
    ) external returns (bytes32 ruleId);

    /**
     * @notice Processes a transaction and distributes cashback
     * @param ruleId The cashback rule to apply
     */
    function processTransaction(bytes32 ruleId) external payable;

    /**
     * @notice Calculates cashback for a given transaction
     * @param ruleId The cashback rule to apply
     * @param user The user address
     * @param amount The transaction amount in wei
     * @return cashback The calculated cashback amount in wei
     */
    function calculateCashback(
        bytes32 ruleId,
        address user,
        uint256 amount
    ) external view returns (uint256 cashback);

    /**
     * @notice Gets usage statistics for a user
     * @param user The user address to query
     * @return totalReceived Cumulative cashback received in wei
     * @return transactionCount Number of cashback transactions
     * @return lastUpdated Timestamp of last transaction
     */
    function getUserUsage(
        address user
    ) external view returns (uint256 totalReceived, uint256 transactionCount, uint256 lastUpdated);

    /**
     * @notice Gets rule details by ID
     * @param ruleId The rule ID to query
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
        );

    /**
     * @notice Withdraws ETH from the contract
     * @param amount Amount to withdraw in wei
     */
    function withdrawFunds(uint256 amount) external;

    /**
     * @notice Pauses the contract
     */
    function pause() external;

    /**
     * @notice Unpauses the contract
     */
    function unpause() external;

    /**
     * @notice Transfers admin role to a new address
     * @param newAdmin Address of the new admin
     */
    function transferAdmin(address newAdmin) external;
}
