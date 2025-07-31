// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IComplianceManager
 * @dev Interface for the Compliance Manager contract
 * @author CoreLiquid Protocol
 */
interface IComplianceManager {
    // Enums (must be declared first)
    enum RuleType {
        KYC_RULE,
        AML_RULE,
        TRANSACTION_LIMIT,
        GEOGRAPHIC_RESTRICTION,
        ASSET_RESTRICTION,
        TIME_RESTRICTION,
        VELOCITY_CHECK,
        PATTERN_DETECTION,
        SANCTION_SCREENING,
        REGULATORY_REPORTING
    }
    
    enum RuleSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
    
    enum ViolationType {
        KYC_VIOLATION,
        AML_VIOLATION,
        TRANSACTION_LIMIT_EXCEEDED,
        GEOGRAPHIC_VIOLATION,
        ASSET_RESTRICTION_VIOLATION,
        TIME_RESTRICTION_VIOLATION,
        VELOCITY_VIOLATION,
        PATTERN_VIOLATION,
        SANCTION_VIOLATION,
        REPORTING_VIOLATION
    }
    
    enum ViolationSeverity {
        MINOR,
        MODERATE,
        MAJOR,
        CRITICAL
    }
    
    enum KYCStatus {
        NOT_STARTED,
        IN_PROGRESS,
        PENDING_REVIEW,
        APPROVED,
        REJECTED,
        EXPIRED,
        SUSPENDED
    }
    
    enum AMLResult {
        CLEAR,
        REVIEW_REQUIRED,
        SUSPICIOUS,
        BLOCKED
    }
    
    enum ActionType {
        BLOCK_TRANSACTION,
        FLAG_FOR_REVIEW,
        REQUIRE_APPROVAL,
        SEND_NOTIFICATION,
        GENERATE_REPORT,
        ESCALATE_TO_COMPLIANCE,
        FREEZE_ACCOUNT,
        REQUEST_DOCUMENTATION
    }
    
    enum ReportType {
        DAILY_COMPLIANCE,
        WEEKLY_COMPLIANCE,
        MONTHLY_COMPLIANCE,
        QUARTERLY_COMPLIANCE,
        ANNUAL_COMPLIANCE,
        SUSPICIOUS_ACTIVITY,
        REGULATORY_FILING,
        AUDIT_REPORT
    }
    
    enum SubmissionStatus {
        PENDING,
        SUBMITTED,
        ACKNOWLEDGED,
        REJECTED,
        UNDER_REVIEW
    }
    
    enum TrainingType {
        KYC_TRAINING,
        AML_TRAINING,
        REGULATORY_TRAINING,
        ETHICS_TRAINING,
        SECURITY_TRAINING,
        GENERAL_COMPLIANCE
    }
    
    enum AlertType {
        RULE_VIOLATION,
        SUSPICIOUS_ACTIVITY,
        REGULATORY_DEADLINE,
        SYSTEM_ANOMALY,
        TRAINING_DUE,
        DOCUMENT_EXPIRY,
        REVIEW_REQUIRED
    }
    
    enum AlertSeverity {
        INFO,
        WARNING,
        CRITICAL,
        EMERGENCY
    }

    // Events
    event ComplianceRuleCreated(
        bytes32 indexed ruleId,
        string ruleName,
        RuleType ruleType,
        RuleSeverity severity,
        address createdBy,
        uint256 timestamp
    );
    
    event ComplianceRuleUpdated(
        bytes32 indexed ruleId,
        string fieldUpdated,
        bytes oldValue,
        bytes newValue,
        address updatedBy,
        uint256 timestamp
    );
    
    event ComplianceViolationDetected(
        bytes32 indexed violationId,
        bytes32 indexed ruleId,
        address indexed user,
        ViolationType violationType,
        ViolationSeverity severity,
        string description,
        uint256 timestamp
    );
    
    event ComplianceCheckCompleted(
        address indexed user,
        address indexed asset,
        bool isCompliant,
        uint256 violationCount,
        uint256 timestamp
    );
    
    event KYCStatusUpdated(
        address indexed user,
        KYCStatus oldStatus,
        KYCStatus newStatus,
        address updatedBy,
        uint256 timestamp
    );
    
    event AMLCheckCompleted(
        address indexed user,
        address indexed transaction,
        AMLResult result,
        uint256 riskScore,
        uint256 timestamp
    );
    
    event SanctionListUpdated(
        bytes32 indexed listId,
        string listName,
        uint256 entriesAdded,
        uint256 entriesRemoved,
        uint256 timestamp
    );
    
    event ComplianceReportGenerated(
        bytes32 indexed reportId,
        address indexed user,
        ReportType reportType,
        uint256 periodStart,
        uint256 periodEnd,
        uint256 timestamp
    );
    
    event RegulatorySubmissionCreated(
        bytes32 indexed submissionId,
        string regulatorName,
        string reportType,
        uint256 periodStart,
        uint256 periodEnd,
        uint256 timestamp
    );
    
    event ComplianceTrainingCompleted(
        address indexed user,
        bytes32 indexed courseId,
        uint256 score,
        uint256 completedAt,
        uint256 validUntil
    );
    
    event AuditTrailEntry(
        bytes32 indexed entryId,
        address indexed user,
        string action,
        string details,
        bytes32 transactionHash,
        uint256 timestamp
    );
    
    event ComplianceAlertTriggered(
        bytes32 indexed alertId,
        AlertType alertType,
        AlertSeverity severity,
        address indexed user,
        string message,
        uint256 timestamp
    );

    // Structs
    struct ComplianceRule {
        bytes32 ruleId;
        string name;
        string description;
        RuleType ruleType;
        RuleSeverity severity;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        address createdBy;
        RuleParameters parameters;
        RuleConditions conditions;
        RuleActions actions;
        RuleMetrics metrics;
    }
    
    struct RuleParameters {
        uint256 threshold;
        uint256 timeWindow;
        uint256 frequency;
        string[] applicableJurisdictions;
        string[] applicableAssets;
        string[] applicableUserTypes;
        bool requiresManualReview;
        uint256 autoResolveTime;
    }
    
    struct RuleConditions {
        string[] conditions;
        string logicalOperator; // AND, OR, NOT
        uint256[] thresholds;
        string[] comparators; // GT, LT, EQ, NE, GTE, LTE
        bool[] isRequired;
    }
    
    struct RuleActions {
        ActionType[] actions;
        string[] parameters;
        bool[] isAutomatic;
        uint256[] delays;
        address[] notificationRecipients;
    }
    
    struct RuleMetrics {
        uint256 totalChecks;
        uint256 totalViolations;
        uint256 falsePositives;
        uint256 averageProcessingTime;
        uint256 lastTriggered;
        uint256 effectiveness;
    }
    
    struct ComplianceViolation {
        bytes32 violationId;
        bytes32 ruleId;
        address user;
        address asset;
        ViolationType violationType;
        ViolationSeverity severity;
        string description;
        uint256 detectedAt;
        uint256 resolvedAt;
        bool isResolved;
        bool isApproved;
        ViolationDetails details;
        ResolutionInfo resolution;
    }
    
    struct ViolationDetails {
        uint256 transactionAmount;
        address counterparty;
        string jurisdiction;
        string[] evidenceHashes;
        string[] relatedTransactions;
        uint256 riskScore;
        string investigationNotes;
    }
    
    struct ResolutionInfo {
        address resolvedBy;
        string resolutionType;
        string resolutionNotes;
        bool requiresReporting;
        uint256 penaltyAmount;
        string[] correctiveActions;
    }
    
    struct KYCRecord {
        address user;
        KYCStatus status;
        uint256 verificationLevel;
        uint256 completedAt;
        uint256 expiresAt;
        uint256 lastUpdate;
        address verifiedBy;
        KYCDocuments documents;
        KYCChecks checks;
        bool requiresRenewal;
    }
    
    struct KYCDocuments {
        string[] documentTypes;
        string[] documentHashes;
        uint256[] uploadDates;
        bool[] isVerified;
        address[] verifiedBy;
        uint256[] expiryDates;
    }
    
    struct KYCChecks {
        bool identityVerified;
        bool addressVerified;
        bool sourceOfFundsVerified;
        bool sanctionScreeningPassed;
        bool pepScreeningPassed;
        bool adverseMediaScreeningPassed;
        uint256 lastScreeningDate;
        uint256 nextScreeningDue;
    }
    
    struct AMLCheck {
        bytes32 checkId;
        address user;
        bytes32 transaction;
        uint256 amount;
        AMLResult result;
        uint256 riskScore;
        uint256 checkedAt;
        AMLFlags flags;
        string[] alerts;
        bool requiresInvestigation;
    }
    
    struct AMLFlags {
        bool highRiskCountry;
        bool sanctionedEntity;
        bool pepRelated;
        bool structuredTransaction;
        bool unusualPattern;
        bool highVelocity;
        bool crossBorderTransaction;
        bool cashIntensive;
    }
    
    struct SanctionList {
        bytes32 listId;
        string name;
        string source;
        uint256 lastUpdated;
        uint256 entryCount;
        bool isActive;
    }
    
    struct SanctionEntry {
        string identifier;
        string name;
        string[] aliases;
        string entityType;
        string[] addresses;
        string jurisdiction;
        string sanctionType;
        uint256 addedDate;
        bool isActive;
    }
    
    struct ComplianceReport {
        bytes32 reportId;
        address user;
        ReportType reportType;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 generatedAt;
        ReportData data;
        ReportMetrics metrics;
        bool isSubmitted;
        string[] attachments;
    }
    
    struct ReportData {
        uint256 totalTransactions;
        uint256 totalVolume;
        uint256 suspiciousTransactions;
        uint256 reportedTransactions;
        uint256 violationCount;
        string[] keyFindings;
    }
    
    struct ReportMetrics {
        uint256 complianceScore;
        uint256 riskLevel;
        uint256 improvementAreas;
        string[] recommendations;
        uint256 nextReviewDate;
    }
    

    
    struct AuditTrail {
        bytes32 entryId;
        address user;
        string action;
        string details;
        bytes32 transactionHash;
        uint256 timestamp;
        string ipAddress;
        string userAgent;
        bool isSystemAction;
    }
    
    struct TrainingMetrics {
        uint256 totalEnrollments;
        uint256 completions;
        uint256 averageScore;
        uint256 averageCompletionTime;
        uint256 lastUpdated;
    }
    
    struct ComplianceTraining {
        bytes32 courseId;
        string courseName;
        string description;
        TrainingType trainingType;
        uint256 duration;
        uint256 validityPeriod;
        bool isMandatory;
        string[] modules;
        uint256 passingScore;
        TrainingMetrics metrics;
    }
    
    struct RegulatorySubmission {
        bytes32 submissionId;
        string regulatorName;
        string reportType;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 submittedAt;
        uint256 dueDate;
        SubmissionStatus status;
        string[] attachments;
        string confirmationNumber;
    }
    
    struct ComplianceAlert {
        bytes32 alertId;
        AlertType alertType;
        AlertSeverity severity;
        address user;
        string message;
        string description;
        uint256 triggeredAt;
        uint256 acknowledgedAt;
        uint256 resolvedAt;
        bool isActive;
        bool requiresAction;
        string[] actionItems;
    }
    
    struct JurisdictionConfig {
        string jurisdiction;
        bool isSupported;
        string[] requiredLicenses;
        string[] applicableRegulations;
        uint256 kycRequirements;
        uint256 amlRequirements;
        bool requiresLocalEntity;
        string[] restrictedActivities;
        uint256 reportingFrequency;
    }

    // Core compliance functions
    function checkCompliance(
        address user,
        address asset,
        uint256 amount,
        string calldata transactionType
    ) external returns (bool isCompliant, bytes32[] memory violationIds);
    
    function performKYCCheck(
        address user
    ) external returns (KYCStatus status, string[] memory requirements);
    
    function performAMLCheck(
        address user,
        address transaction,
        uint256 amount
    ) external returns (AMLResult result, uint256 riskScore);
    
    function screenSanctions(
        address user,
        string calldata name
    ) external returns (bool isClean, string[] memory matches);
    
    function validateTransaction(
        address from,
        address to,
        address asset,
        uint256 amount
    ) external returns (bool isValid, string[] memory violations);
    
    // Rule management functions
    function createComplianceRule(
        string calldata name,
        string calldata description,
        RuleType ruleType,
        RuleSeverity severity,
        RuleParameters calldata parameters,
        RuleConditions calldata conditions,
        RuleActions calldata actions
    ) external returns (bytes32 ruleId);
    
    function updateComplianceRule(
        bytes32 ruleId,
        RuleParameters calldata parameters,
        RuleConditions calldata conditions,
        RuleActions calldata actions
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
    
    // KYC management functions
    function initiateKYC(
        address user
    ) external returns (bytes32 kycId);
    
    function submitKYCDocuments(
        address user,
        string[] calldata documentTypes,
        string[] calldata documentHashes
    ) external;
    
    function verifyKYCDocuments(
        address user,
        string[] calldata documentTypes,
        bool[] calldata verificationResults
    ) external;
    
    function approveKYC(
        address user,
        uint256 verificationLevel
    ) external;
    
    function rejectKYC(
        address user,
        string calldata reason
    ) external;
    
    function renewKYC(
        address user
    ) external;
    
    // Violation management functions
    function reportViolation(
        bytes32 ruleId,
        address user,
        ViolationType violationType,
        ViolationSeverity severity,
        string calldata description,
        ViolationDetails calldata details
    ) external returns (bytes32 violationId);
    
    function investigateViolation(
        bytes32 violationId,
        string calldata notes
    ) external;
    
    function resolveViolation(
        bytes32 violationId,
        ResolutionInfo calldata resolution
    ) external;
    
    function approveViolation(
        bytes32 violationId,
        string calldata approvalNotes
    ) external;
    
    function escalateViolation(
        bytes32 violationId,
        address escalateTo
    ) external;
    
    // Sanction list management
    function updateSanctionList(
        bytes32 listId,
        SanctionEntry[] calldata entries,
        bool[] calldata isActive
    ) external;
    
    function addSanctionEntry(
        bytes32 listId,
        SanctionEntry calldata entry
    ) external;
    
    function removeSanctionEntry(
        bytes32 listId,
        string calldata identifier
    ) external;
    
    function importSanctionList(
        string calldata source,
        bytes calldata data
    ) external returns (bytes32 listId);
    
    // Reporting functions
    function generateComplianceReport(
        address user,
        ReportType reportType,
        uint256 periodStart,
        uint256 periodEnd
    ) external returns (bytes32 reportId);
    
    function submitRegulatoryReport(
        string calldata regulatorName,
        string calldata reportType,
        bytes32 reportId,
        uint256 dueDate
    ) external returns (bytes32 submissionId);
    
    function schedulePeriodicReporting(
        ReportType reportType,
        uint256 frequency,
        string calldata regulatorName
    ) external;
    
    function exportComplianceData(
        uint256 periodStart,
        uint256 periodEnd,
        string[] calldata dataTypes
    ) external returns (bytes memory data);
    
    // Training functions
    function createTrainingCourse(
        string calldata courseName,
        string calldata description,
        TrainingType trainingType,
        uint256 duration,
        uint256 validityPeriod,
        bool isMandatory,
        string[] calldata modules,
        uint256 passingScore
    ) external returns (bytes32 courseId);
    
    function enrollInTraining(
        address user,
        bytes32 courseId
    ) external;
    
    function completeTraining(
        address user,
        bytes32 courseId,
        uint256 score
    ) external;
    
    function assignMandatoryTraining(
        address[] calldata users,
        bytes32 courseId,
        uint256 deadline
    ) external;
    
    // Audit trail functions
    function logAction(
        address user,
        string calldata action,
        string calldata details,
        bytes32 transactionHash
    ) external returns (bytes32 entryId);
    
    function getAuditTrail(
        address user,
        uint256 fromTime,
        uint256 toTime
    ) external view returns (AuditTrail[] memory);
    
    function searchAuditTrail(
        string calldata action,
        uint256 fromTime,
        uint256 toTime
    ) external view returns (bytes32[] memory entryIds);
    
    // Alert management functions
    function createComplianceAlert(
        AlertType alertType,
        AlertSeverity severity,
        address user,
        string calldata message,
        string calldata description,
        string[] calldata actionItems
    ) external returns (bytes32 alertId);
    
    function acknowledgeAlert(
        bytes32 alertId
    ) external;
    
    function resolveAlert(
        bytes32 alertId,
        string calldata resolution
    ) external;
    
    function escalateAlert(
        bytes32 alertId,
        address escalateTo
    ) external;
    
    // Configuration functions
    function updateJurisdictionConfig(
        string calldata jurisdiction,
        JurisdictionConfig calldata config
    ) external;
    
    function setComplianceOfficer(
        address officer,
        string[] calldata permissions
    ) external;
    
    function updateGlobalComplianceSettings(
        string calldata setting,
        bytes calldata value
    ) external;
    
    function pauseComplianceSystem(
        string calldata reason
    ) external;
    
    function unpauseComplianceSystem() external;
    
    // View functions - Rules
    function getComplianceRule(
        bytes32 ruleId
    ) external view returns (ComplianceRule memory);
    
    function getAllComplianceRules() external view returns (bytes32[] memory);
    
    function getActiveComplianceRules() external view returns (bytes32[] memory);
    
    function getRulesByType(
        RuleType ruleType
    ) external view returns (bytes32[] memory);
    
    function getRuleMetrics(
        bytes32 ruleId
    ) external view returns (RuleMetrics memory);
    
    // View functions - KYC
    function getKYCRecord(
        address user
    ) external view returns (KYCRecord memory);
    
    function getKYCStatus(
        address user
    ) external view returns (KYCStatus status, uint256 expiresAt);
    
    function getKYCRequirements(
        address user
    ) external view returns (string[] memory requirements);
    
    function isKYCCompliant(
        address user
    ) external view returns (bool compliant);
    
    function getKYCStatistics() external view returns (
        uint256 totalUsers,
        uint256 approvedUsers,
        uint256 pendingUsers,
        uint256 rejectedUsers
    );
    
    // View functions - Violations
    function getViolation(
        bytes32 violationId
    ) external view returns (ComplianceViolation memory);
    
    function getUserViolations(
        address user
    ) external view returns (bytes32[] memory);
    
    function getActiveViolations() external view returns (bytes32[] memory);
    
    function getViolationsByType(
        ViolationType violationType
    ) external view returns (bytes32[] memory);
    
    function getViolationStatistics(
        uint256 timeframe
    ) external view returns (
        uint256 totalViolations,
        uint256 resolvedViolations,
        uint256 pendingViolations,
        uint256 averageResolutionTime
    );
    
    // View functions - AML
    function getAMLCheck(
        bytes32 checkId
    ) external view returns (AMLCheck memory);
    
    function getUserAMLHistory(
        address user
    ) external view returns (bytes32[] memory);
    
    function getAMLStatistics(
        uint256 timeframe
    ) external view returns (
        uint256 totalChecks,
        uint256 suspiciousTransactions,
        uint256 blockedTransactions,
        uint256 averageRiskScore
    );
    
    // View functions - Sanctions
    function getSanctionList(
        bytes32 listId
    ) external view returns (SanctionList memory);
    
    function getAllSanctionLists() external view returns (bytes32[] memory);
    
    function checkSanctionMatch(
        string calldata identifier
    ) external view returns (bool isMatch, SanctionEntry[] memory matches);
    
    function getSanctionStatistics() external view returns (
        uint256 totalLists,
        uint256 totalEntries,
        uint256 lastUpdate,
        uint256 totalScreenings
    );
    
    // View functions - Reports
    function getComplianceReport(
        bytes32 reportId
    ) external view returns (ComplianceReport memory);
    
    function getUserReports(
        address user,
        ReportType reportType
    ) external view returns (bytes32[] memory);
    
    function getRegulatorySubmission(
        bytes32 submissionId
    ) external view returns (RegulatorySubmission memory);
    
    function getPendingSubmissions() external view returns (bytes32[] memory);
    
    // View functions - Training
    function getTrainingCourse(
        bytes32 courseId
    ) external view returns (ComplianceTraining memory);
    
    function getUserTrainingStatus(
        address user,
        bytes32 courseId
    ) external view returns (
        bool isCompleted,
        uint256 score,
        uint256 completedAt,
        uint256 validUntil
    );
    
    function getMandatoryTraining(
        address user
    ) external view returns (bytes32[] memory courseIds, uint256[] memory deadlines);
    
    function getTrainingStatistics(
        bytes32 courseId
    ) external view returns (TrainingMetrics memory);
    
    // View functions - Alerts
    function getComplianceAlert(
        bytes32 alertId
    ) external view returns (ComplianceAlert memory);
    
    function getUserAlerts(
        address user,
        bool activeOnly
    ) external view returns (bytes32[] memory);
    
    function getSystemAlerts(
        AlertSeverity minSeverity
    ) external view returns (bytes32[] memory);
    
    function getAlertStatistics(
        uint256 timeframe
    ) external view returns (
        uint256 totalAlerts,
        uint256 criticalAlerts,
        uint256 resolvedAlerts,
        uint256 averageResolutionTime
    );
    
    // View functions - Analytics
    function getComplianceScore(
        address user
    ) external view returns (uint256 score, string memory rating);
    
    function getSystemComplianceHealth() external view returns (
        uint256 overallScore,
        uint256 activeViolations,
        uint256 pendingReviews,
        uint256 systemRisk
    );
    
    function getComplianceTrends(
        uint256 timeframe
    ) external view returns (
        uint256[] memory timestamps,
        uint256[] memory violationCounts,
        uint256[] memory complianceScores
    );
    
    function getJurisdictionCompliance(
        string calldata jurisdiction
    ) external view returns (
        bool isCompliant,
        string[] memory requirements,
        string[] memory gaps
    );
}