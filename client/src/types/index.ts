export type Role = 'ADMIN' | 'TECHNICIAN' | 'REVIEWER';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AttachmentCategory =
  | 'INSTRUMENT_PHOTO'
  | 'NAMEPLATE_PHOTO'
  | 'TEST_SETUP_PHOTO'
  | 'CALIBRATION_CERTIFICATE'
  | 'TECHNICAL_DOCUMENT'
  | 'OTHER_EVIDENCE';

export type AccuracyClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII';

export type TestStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REPORT_GENERATED'
  | 'ARCHIVED';

export type TestResult = 'PENDING' | 'PASS' | 'FAIL' | 'INCOMPLETE' | 'NOT_APPLICABLE';

export type LoadDirection = 'INCREASING' | 'DECREASING';

export type LoadPosition = 'CENTER' | 'CORNER_1' | 'CORNER_2' | 'CORNER_3' | 'CORNER_4';

export type ReviewAction = 'SUBMIT' | 'REQUEST_CHANGES' | 'APPROVE' | 'REJECT';

export type FileFormat = 'PDF' | 'DOCX';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  laboratoryId?: number;
  laboratoryName?: string;
  active: boolean;
  approvalStatus?: ApprovalStatus;
  emailVerified?: boolean;
  rejectionReason?: string;
  createdAt?: string;
}

export interface Laboratory {
  id: number;
  labCode: string;
  labName: string;
  accreditationNumber?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
}

export interface Manufacturer {
  id: number;
  name: string;
  code: string;
  country?: string;
  contactPerson?: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface Instrument {
  id: number;
  instrumentId: string;
  manufacturerId: number;
  manufacturerName: string;
  modelName: string;
  modelNumber?: string;
  serialNumber: string;
  instrumentType: string;
  accuracyClass: AccuracyClass;
  accuracyClassDisplay: string;
  maxCapacity: number;
  minCapacity: number;
  scaleIntervalE: number;
  scaleIntervalD: number;
  unit: string;
  numLoadCells?: number;
  indicatorInfo?: string;
  firmwareVersion?: string;
  technicalSpecifications?: string;
  photoPath?: string;
  numberOfIntervalsN?: number;
  createdAt: string;
}

export interface Standard {
  id: number;
  standardCode: string;
  title: string;
  description?: string;
}

export interface StandardVersion {
  id: number;
  standard: Standard;
  versionCode: string;
  effectiveDate?: string;
  active: boolean;
}

export interface Rule {
  id: number;
  standardVersion: StandardVersion;
  testCode: string;
  accuracyClass: AccuracyClass;
  ruleName: string;
  minLoadE: number;
  maxLoadE: number;
  mpeFactorE: number;
  isOfficial: boolean;
  description?: string;
}

export interface TestDefinition {
  id: number;
  testCode: string;
  testName: string;
  category: string;
  sequenceOrder: number;
  active: boolean;
  configurationJson?: string;
}

export interface LaboratoryCondition {
  id?: number;
  testCaseId?: number;
  recordedAt?: string;
  temperatureCelsius: number;
  relativeHumidityPct: number;
  atmosphericPressureHpa?: number;
  referenceStandardsUsed?: string;
  calibrationCertNo?: string;
  operatorName?: string;
  remarks?: string;
}

export interface TestObservation {
  id?: number;
  testExecutionId?: number;
  pointIndex: number;
  loadDirection: LoadDirection;
  appliedLoad: number;
  nominalValue?: number;
  indicatedValue: number;
  changeoverLoad?: number;
  positionLocation?: LoadPosition;
  errorValue?: number;
  correctedError?: number;
  mpeValue?: number;
  pointCompliance?: TestResult;
  rawDataJson?: string;
}

export interface TestExecution {
  id: number;
  testCaseId: number;
  testDefinitionId: number;
  testCode: string;
  testName: string;
  category: string;
  sequenceOrder: number;
  status: string;
  testResult: TestResult;
  evaluatedRuleVersion?: string;
  summaryNotes?: string;
  executedAt: string;
  observations: TestObservation[];
}

export interface ReviewRecord {
  id: number;
  testCaseId: number;
  reviewerId: number;
  reviewerName: string;
  action: ReviewAction;
  comments?: string;
  reviewedAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  category: AttachmentCategory;
  fileSize: number;
  description?: string;
  uploadedById?: number;
  uploadedByName?: string;
  testCaseId?: number;
  instrumentId?: number;
  testExecutionId?: number;
  includeInReport: boolean;
  createdAt: string;
}

export interface DigitalSignature {
  id: number;
  signatureReference: string;
  signerId: number;
  signerName: string;
  signerRole: string;
  signedAt: string;
  signatureDeclaration?: string;
  signatureDigest: string;
  certificateAuthority?: string;
  valid: boolean;
}

export interface TestCase {
  id: number;
  testId: string;
  instrument: Instrument;
  laboratoryId: number;
  laboratoryName: string;
  standardVersionId: number;
  standardVersionCode: string;
  technicianId: number;
  technicianName: string;
  reviewerId?: number;
  reviewerName?: string;
  status: TestStatus;
  overallResult: TestResult;
  startDate?: string;
  completionDate?: string;
  remarks?: string;
  laboratoryCondition?: LaboratoryCondition;
  testExecutions: TestExecution[];
  reviewRecords: ReviewRecord[];
  attachments?: Attachment[];
  digitalSignature?: DigitalSignature;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: number;
  reportNumber: string;
  testCaseId: number;
  testId: string;
  instrumentId: string;
  instrumentModel: string;
  manufacturerName: string;
  overallResult: string;
  reportVersion: number;
  fileFormat: FileFormat;
  filePath: string;
  fileSize?: number;
  checksumSha256?: string;
  digitalSignatureReference?: string;
  signedByName?: string;
  generatedByName?: string;
  generatedAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  entityName?: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalInstruments: number;
  testsInProgress: number;
  testsSubmitted: number;
  testsUnderReview: number;
  testsApproved: number;
  testsRejected: number;
  totalReportsGenerated: number;
  totalPass: number;
  totalFail: number;
  recentTests: TestCase[];
  recentReports: Report[];
  pendingReviewActions: TestCase[];
  statusDistribution: Record<string, number>;
  resultDistribution: Record<string, number>;
  monthlyTrends: { month: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
