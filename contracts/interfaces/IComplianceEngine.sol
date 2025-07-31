// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IComplianceManager.sol";

/**
 * @title IComplianceEngine
 * @dev Interface for the Compliance Engine contract
 * @author CoreLiquid Protocol
 */
interface IComplianceEngine {
    // Events
    event ComplianceCheckCompleted(
        bytes32 indexed checkId,
        address indexed subject,
        ComplianceType complianceType,
        bool isCompliant,
        uint256 timestamp
    );
    
    event ComplianceViolationDetected(
        bytes32 indexed violationId,
        address indexed violator,
        ViolationType violationType,
        uint256 severity,
        string description,
        uint256 timestamp
    );
    
    event KYCStatusUpdated(
        address indexed user,
        KYCStatus oldStatus,
        KYCStatus newStatus,
        uint256 timestamp
    );
    
    event AMLCheckCompleted(
        bytes32 indexed checkId,
        address indexed user,
        AMLRiskLevel riskLevel,
        bool passed,
        uint256 timestamp
    );
    
    event TransactionBlocked(
        bytes32 indexed transactionId,
        address indexed user,
        BlockReason reason,
        uint256 amount,
        uint256 timestamp
    );
    
    event WhitelistUpdated(
        address indexed user,
        bool isWhitelisted,
        WhitelistType whitelistType,
        uint256 timestamp
    );
    
    event BlacklistUpdated(
        address indexed user,
        bool isBlacklisted,
        BlacklistReason reason,
        uint256 timestamp
    );
    
    event ComplianceRuleAdded(
        bytes32 indexed ruleId,
        RuleType ruleType,
        uint256 priority,
        bool isActive,
        uint256 timestamp
    );
    
    event ComplianceRuleUpdated(
        bytes32 indexed ruleId,
        uint256 oldPriority,
        uint256 newPriority,
        bool wasActive,
        bool isActive,
        uint256 timestamp
    );
    
    event RegulatoryReportGenerated(
        bytes32 indexed reportId,
        ReportType reportType,
        uint256 fromTimestamp,
        uint256 toTimestamp,
        uint256 timestamp
    );
    
    event ComplianceAuditCompleted(
        bytes32 indexed auditId,
        address indexed auditor,
        uint256 findingsCount,
        uint256 score,
        uint256 timestamp
    );
    
    event SanctionsCheckCompleted(
        bytes32 indexed checkId,
        address indexed user,
        bool isSanctioned,
        string[] matchedLists,
        uint256 timestamp
    );

    // Structs
    struct ComplianceProfile {
        address user;
        KYCStatus kycStatus;
        AMLRiskLevel amlRiskLevel;
        uint256 riskScore;
        bool isWhitelisted;
        bool isBlacklisted;
        bool isSanctioned;
        uint256 lastKYCUpdate;
        uint256 lastAMLCheck;
        uint256 lastSanctionsCheck;
        ComplianceFlags flags;
        ComplianceMetrics metrics;
        string jurisdiction;
        uint256 createdAt;
        uint256 lastUpdate;
    }
    
    struct ComplianceFlags {
        bool requiresEnhancedDueDiligence;
        bool isPEP; // Politically Exposed Person
        bool isHighRisk;
        bool requiresManualReview;
        bool hasComplianceViolations;
        bool isUnderInvestigation;
        bool requiresDocumentVerification;
        bool hasTransactionLimits;
        bool requiresApproval;
        bool isRestricted;
    }
    
    struct ComplianceMetrics {
        uint256 totalTransactions;
        uint256 totalVolume;
        uint256 flaggedTransactions;
        uint256 blockedTransactions;
        uint256 violationCount;
        uint256 averageTransactionSize;
        uint256 maxDailyVolume;
        uint256 maxMonthlyVolume;
        uint256 suspiciousActivityScore;
        uint256 lastViolationDate;
    }
    
    struct KYCData {
        address user;
        string documentHash;
        DocumentType documentType;
        VerificationLevel verificationLevel;
        uint256 expiryDate;
        bool isVerified;
        address verifier;
        uint256 verifiedAt;
        string jurisdiction;
        KYCFlags flags;
        string[] requiredDocuments;
        string[] providedDocuments;
    }
    
    struct KYCFlags {
        bool identityVerified;
        bool addressVerified;
        bool phoneVerified;
        bool emailVerified;
        bool incomeVerified;
        bool sourceOfFundsVerified;
        bool biometricVerified;
        bool videoCallCompleted;
    }
    
    struct AMLCheck {
        bytes32 checkId;
        address user;
        uint256 transactionAmount;
        AMLCheckType checkType;
        AMLRiskLevel riskLevel;
        bool passed;
        uint256 riskScore;
        string[] riskFactors;
        string[] alerts;
        uint256 timestamp;
        address checker;
        AMLResult result;
    }
    
    struct AMLResult {
        bool requiresReporting;
        bool requiresInvestigation;
        bool requiresApproval;
        bool shouldBlock;
        string recommendation;
        uint256 confidence;
        SuspiciousActivityIndicators indicators;
    }
    
    struct SuspiciousActivityIndicators {
        bool unusualTransactionPattern;
        bool highVelocityTransactions;
        bool roundDollarAmounts;
        bool geographicRiskFactors;
        bool timeBasedAnomalies;
        bool counterpartyRisks;
        bool structuringIndicators;
        bool layeringIndicators;
    }
    
    struct ComplianceRule {
        bytes32 ruleId;
        string name;
        RuleType ruleType;
        uint256 priority;
        bool isActive;
        RuleCondition[] conditions;
        RuleAction[] actions;
        uint256 createdAt;
        uint256 lastUpdate;
        address creator;
        RuleMetrics metrics;
    }
    
    struct RuleCondition {
        ConditionType conditionType;
        string field;
        ComparisonOperator operator;
        string value;
        bool isRequired;
    }
    
    struct RuleAction {
        ActionType actionType;
        string[] parameters;
        uint256 severity;
        bool isAutomatic;
    }
    
    struct RuleMetrics {
        uint256 timesTriggered;
        uint256 timesBlocked;
        uint256 falsePositives;
        uint256 truePositives;
        uint256 lastTriggered;
        uint256 effectiveness;
    }
    

    
    struct TransactionCompliance {
        bytes32 transactionId;
        address from;
        address to;
        uint256 amount;
        address asset;
        bool isCompliant;
        ComplianceCheckResult[] checkResults;
        uint256 riskScore;
        string[] flags;
        uint256 timestamp;
        bool requiresApproval;
        bool isApproved;
        address approver;
    }
    
    struct ComplianceCheckResult {
        ComplianceType checkType;
        bool passed;
        uint256 score;
        string[] issues;
        string recommendation;
        uint256 confidence;
    }
    
    struct RegulatoryReport {
        bytes32 reportId;
        ReportType reportType;
        uint256 fromTimestamp;
        uint256 toTimestamp;
        bytes reportData;
        string reportHash;
        uint256 generatedAt;
        address generator;
        bool isSubmitted;
        uint256 submittedAt;
        string submissionReference;
    }
    
    struct ComplianceAudit {
        bytes32 auditId;
        address auditor;
        AuditType auditType;
        uint256 startTime;
        uint256 endTime;
        AuditFinding[] findings;
        uint256 score;
        AuditStatus status;
        string summary;
        string[] recommendations;
        uint256 completedAt;
    }
    
    struct AuditFinding {
        FindingSeverity severity;
        string category;
        string description;
        string recommendation;
        bool isResolved;
        uint256 resolvedAt;
    }
    
    struct SanctionsCheck {
        bytes32 checkId;
        address user;
        bool isSanctioned;
        string[] matchedLists;
        uint256 confidence;
        uint256 timestamp;
        SanctionsResult result;
    }
    
    struct SanctionsResult {
        bool shouldBlock;
        bool requiresInvestigation;
        bool requiresApproval;
        string[] matchedEntries;
        uint256 matchScore;
        string recommendation;
    }

    // Enums
    enum ComplianceType {
        KYC,
        AML,
        SANCTIONS,
        TRANSACTION_LIMITS,
        GEOGRAPHIC_RESTRICTIONS,
        REGULATORY_COMPLIANCE,
        RISK_ASSESSMENT
    }
    
    enum KYCStatus {
        NOT_STARTED,
        IN_PROGRESS,
        PENDING_REVIEW,
        VERIFIED,
        REJECTED,
        EXPIRED,
        SUSPENDED
    }
    
    enum AMLRiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        VERY_HIGH,
        PROHIBITED
    }
    
    enum ViolationType {
        KYC_VIOLATION,
        AML_VIOLATION,
        SANCTIONS_VIOLATION,
        TRANSACTION_LIMIT_EXCEEDED,
        GEOGRAPHIC_RESTRICTION,
        SUSPICIOUS_ACTIVITY,
        REGULATORY_BREACH
    }
    
    enum BlockReason {
        SANCTIONS_MATCH,
        AML_RISK,
        TRANSACTION_LIMIT,
        GEOGRAPHIC_RESTRICTION,
        SUSPICIOUS_PATTERN,
        REGULATORY_REQUIREMENT,
        MANUAL_REVIEW_REQUIRED
    }
    
    enum WhitelistType {
        GENERAL,
        HIGH_VALUE,
        INSTITUTIONAL,
        REGULATORY_APPROVED,
        PARTNER
    }
    
    enum BlacklistReason {
        SANCTIONS,
        FRAUD,
        AML_VIOLATION,
        REGULATORY_ACTION,
        SUSPICIOUS_ACTIVITY,
        COURT_ORDER
    }
    
    enum RuleType {
        TRANSACTION_MONITORING,
        RISK_ASSESSMENT,
        SANCTIONS_SCREENING,
        GEOGRAPHIC_RESTRICTION,
        VELOCITY_CHECK,
        PATTERN_DETECTION
    }
    
    enum ConditionType {
        AMOUNT_THRESHOLD,
        FREQUENCY_LIMIT,
        GEOGRAPHIC_CHECK,
        TIME_RESTRICTION,
        COUNTERPARTY_CHECK,
        PATTERN_MATCH
    }
    
    enum ComparisonOperator {
        EQUALS,
        NOT_EQUALS,
        GREATER_THAN,
        LESS_THAN,
        GREATER_EQUAL,
        LESS_EQUAL,
        CONTAINS,
        NOT_CONTAINS
    }
    
    enum ActionType {
        BLOCK_TRANSACTION,
        FLAG_FOR_REVIEW,
        REQUIRE_APPROVAL,
        GENERATE_ALERT,
        UPDATE_RISK_SCORE,
        TRIGGER_INVESTIGATION
    }
    
    enum ViolationStatus {
        OPEN,
        UNDER_INVESTIGATION,
        RESOLVED,
        DISMISSED,
        ESCALATED
    }
    
    enum DocumentType {
        PASSPORT,
        DRIVERS_LICENSE,
        NATIONAL_ID,
        UTILITY_BILL,
        BANK_STATEMENT,
        PROOF_OF_INCOME,
        BUSINESS_REGISTRATION
    }
    
    enum VerificationLevel {
        BASIC,
        STANDARD,
        ENHANCED,
        INSTITUTIONAL
    }
    
    enum AMLCheckType {
        TRANSACTION_SCREENING,
        PERIODIC_REVIEW,
        RISK_ASSESSMENT,
        SUSPICIOUS_ACTIVITY,
        REGULATORY_REQUIREMENT
    }
    
    enum ReportType {
        SAR, // Suspicious Activity Report
        CTR, // Currency Transaction Report
        REGULATORY_FILING,
        AUDIT_REPORT,
        COMPLIANCE_SUMMARY,
        VIOLATION_REPORT
    }
    
    enum AuditType {
        INTERNAL,
        EXTERNAL,
        REGULATORY,
        COMPLIANCE_REVIEW,
        RISK_ASSESSMENT
    }
    
    enum AuditStatus {
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
    
    enum FindingSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    // Core compliance functions
    function performComplianceCheck(
        address user,
        ComplianceType checkType
    ) external returns (bool isCompliant, uint256 riskScore);
    
    function checkTransactionCompliance(
        address from,
        address to,
        uint256 amount,
        address asset
    ) external returns (TransactionCompliance memory result);
    
    function updateKYCStatus(
        address user,
        KYCStatus status,
        string calldata documentHash
    ) external;
    
    function performAMLCheck(
        address user,
        uint256 transactionAmount,
        AMLCheckType checkType
    ) external returns (AMLCheck memory result);
    
    function performSanctionsCheck(
        address user
    ) external returns (SanctionsCheck memory result);
    
    // Advanced compliance functions
    function batchComplianceCheck(
        address[] calldata users,
        ComplianceType checkType
    ) external returns (bool[] memory results, uint256[] memory riskScores);
    
    function performEnhancedDueDiligence(
        address user
    ) external returns (bool passed, string[] memory findings);
    
    function assessTransactionRisk(
        address from,
        address to,
        uint256 amount,
        address asset
    ) external returns (uint256 riskScore, string[] memory riskFactors);
    
    function detectSuspiciousActivity(
        address user,
        uint256 timeWindow
    ) external returns (SuspiciousActivityIndicators memory indicators);
    
    function validateGeographicCompliance(
        address user,
        string calldata jurisdiction
    ) external returns (bool isCompliant, string[] memory restrictions);
    
    // Rule management functions
    function addComplianceRule(
        string calldata name,
        RuleType ruleType,
        RuleCondition[] calldata conditions,
        RuleAction[] calldata actions,
        uint256 priority
    ) external returns (bytes32 ruleId);
    
    function updateComplianceRule(
        bytes32 ruleId,
        RuleCondition[] calldata conditions,
        RuleAction[] calldata actions,
        uint256 priority
    ) external;
    
    function activateRule(
        bytes32 ruleId
    ) external;
    
    function deactivateRule(
        bytes32 ruleId
    ) external;
    
    function deleteRule(
        bytes32 ruleId
    ) external;
    
    function testRule(
        bytes32 ruleId,
        address testUser,
        uint256 testAmount
    ) external returns (bool triggered, string[] memory results);
    
    // Whitelist/Blacklist management
    function addToWhitelist(
        address user,
        WhitelistType whitelistType
    ) external;
    
    function removeFromWhitelist(
        address user
    ) external;
    
    function addToBlacklist(
        address user,
        BlacklistReason reason
    ) external;
    
    function removeFromBlacklist(
        address user
    ) external;
    
    function updateUserJurisdiction(
        address user,
        string calldata jurisdiction
    ) external;
    
    // Violation management
    function reportViolation(
        address violator,
        ViolationType violationType,
        string calldata description,
        uint256 severity
    ) external returns (bytes32 violationId);
    
    function investigateViolation(
        bytes32 violationId
    ) external;
    
    function resolveViolation(
        bytes32 violationId,
        string calldata resolution,
        uint256 penalty
    ) external;
    
    function escalateViolation(
        bytes32 violationId
    ) external;
    
    function dismissViolation(
        bytes32 violationId,
        string calldata reason
    ) external;
    
    // Reporting functions
    function generateRegulatoryReport(
        ReportType reportType,
        uint256 fromTimestamp,
        uint256 toTimestamp
    ) external returns (bytes32 reportId);
    
    function submitReport(
        bytes32 reportId,
        string calldata submissionReference
    ) external;
    
    function generateSAR(
        address user,
        string calldata suspiciousActivity
    ) external returns (bytes32 reportId);
    
    function generateCTR(
        address user,
        uint256 amount,
        uint256 timestamp
    ) external returns (bytes32 reportId);
    
    // Audit functions
    function initiateAudit(
        AuditType auditType,
        address auditor
    ) external returns (bytes32 auditId);
    
    function addAuditFinding(
        bytes32 auditId,
        FindingSeverity severity,
        string calldata category,
        string calldata description,
        string calldata recommendation
    ) external;
    
    function completeAudit(
        bytes32 auditId,
        uint256 score,
        string calldata summary
    ) external;
    
    function resolveAuditFinding(
        bytes32 auditId,
        uint256 findingIndex
    ) external;
    
    // Configuration functions
    function setTransactionLimits(
        address user,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external;
    
    function setGlobalTransactionLimits(
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external;
    
    function updateRiskThresholds(
        AMLRiskLevel riskLevel,
        uint256 threshold
    ) external;
    
    function setComplianceOfficer(
        address officer
    ) external;
    
    function updateSanctionsList(
        string[] calldata sanctionedAddresses
    ) external;
    
    // Emergency functions
    function emergencyFreeze(
        address user,
        string calldata reason
    ) external;
    
    function emergencyUnfreeze(
        address user
    ) external;
    
    function pauseCompliance(
        ComplianceType complianceType
    ) external;
    
    function resumeCompliance(
        ComplianceType complianceType
    ) external;
    
    function emergencyBlockTransaction(
        bytes32 transactionId,
        string calldata reason
    ) external;
    
    // View functions - Compliance profiles
    function getComplianceProfile(
        address user
    ) external view returns (ComplianceProfile memory);
    
    function getKYCStatus(
        address user
    ) external view returns (KYCStatus);
    
    function getAMLRiskLevel(
        address user
    ) external view returns (AMLRiskLevel);
    
    function getRiskScore(
        address user
    ) external view returns (uint256);
    
    function isWhitelisted(
        address user
    ) external view returns (bool, WhitelistType);
    
    function isBlacklisted(
        address user
    ) external view returns (bool, BlacklistReason);
    
    function isSanctioned(
        address user
    ) external view returns (bool);
    
    function isCompliant(
        address user
    ) external view returns (bool);
    
    // View functions - KYC
    function getKYCData(
        address user
    ) external view returns (KYCData memory);
    
    function getVerificationLevel(
        address user
    ) external view returns (VerificationLevel);
    
    function getKYCFlags(
        address user
    ) external view returns (KYCFlags memory);
    
    function getRequiredDocuments(
        address user
    ) external view returns (string[] memory);
    
    function isKYCExpired(
        address user
    ) external view returns (bool);
    
    // View functions - AML
    function getLatestAMLCheck(
        address user
    ) external view returns (AMLCheck memory);
    
    function getAMLHistory(
        address user,
        uint256 limit
    ) external view returns (AMLCheck[] memory);
    
    function getSuspiciousActivityIndicators(
        address user
    ) external view returns (SuspiciousActivityIndicators memory);
    
    function getAMLAlerts(
        address user
    ) external view returns (string[] memory);
    
    // View functions - Rules
    function getComplianceRule(
        bytes32 ruleId
    ) external view returns (ComplianceRule memory);
    
    function getAllRules() external view returns (bytes32[] memory);
    
    function getActiveRules() external view returns (bytes32[] memory);
    
    function getRulesByType(
        RuleType ruleType
    ) external view returns (bytes32[] memory);
    
    function getRuleMetrics(
        bytes32 ruleId
    ) external view returns (RuleMetrics memory);
    
    // View functions - Violations
    function getViolation(
        bytes32 violationId
    ) external view returns (IComplianceManager.ComplianceViolation memory);
    
    function getUserViolations(
        address user
    ) external view returns (bytes32[] memory);
    
    function getOpenViolations() external view returns (bytes32[] memory);
    
    function getViolationsByType(
        ViolationType violationType
    ) external view returns (bytes32[] memory);
    
    function getViolationCount(
        address user
    ) external view returns (uint256);
    
    // View functions - Transactions
    function getTransactionCompliance(
        bytes32 transactionId
    ) external view returns (TransactionCompliance memory);
    
    function getBlockedTransactions(
        address user
    ) external view returns (bytes32[] memory);
    
    function getFlaggedTransactions(
        address user
    ) external view returns (bytes32[] memory);
    
    function getTransactionLimits(
        address user
    ) external view returns (uint256 dailyLimit, uint256 monthlyLimit);
    
    function getRemainingLimits(
        address user
    ) external view returns (uint256 dailyRemaining, uint256 monthlyRemaining);
    
    // View functions - Reports
    function getReport(
        bytes32 reportId
    ) external view returns (RegulatoryReport memory);
    
    function getReportsByType(
        ReportType reportType
    ) external view returns (bytes32[] memory);
    
    function getPendingReports() external view returns (bytes32[] memory);
    
    function getSubmittedReports() external view returns (bytes32[] memory);
    
    // View functions - Audits
    function getAudit(
        bytes32 auditId
    ) external view returns (ComplianceAudit memory);
    
    function getAllAudits() external view returns (bytes32[] memory);
    
    function getActiveAudits() external view returns (bytes32[] memory);
    
    function getAuditFindings(
        bytes32 auditId
    ) external view returns (AuditFinding[] memory);
    
    function getUnresolvedFindings() external view returns (uint256 count);
    
    // View functions - System health
    function getComplianceHealth() external view returns (
        bool isHealthy,
        uint256 complianceRate,
        uint256 violationRate,
        uint256 riskLevel
    );
    
    function getComplianceMetrics() external view returns (
        uint256 totalUsers,
        uint256 verifiedUsers,
        uint256 flaggedUsers,
        uint256 blockedUsers
    );
    
    function getSystemCompliance() external view returns (
        uint256 overallScore,
        uint256 kycCompliance,
        uint256 amlCompliance,
        uint256 sanctionsCompliance
    );
}