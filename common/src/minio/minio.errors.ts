/**
 * Errors returned by Minio conform to the S3 error spec
 * https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html#RESTErrorResponses
 */
export interface MinioError {
  code: MinioErrorCode;
  message: string;
  resource: string;
  requestid: string;
}

export enum MinioErrorCode {
  AccessControlListNotSupported = 'AccessControlListNotSupported',
  AccessDenied = 'AccessDenied',
  AccessPointAlreadyOwnedByYou = 'AccessPointAlreadyOwnedByYou',
  AccountProblem = 'AccountProblem',
  AllAccessDisabled = 'AllAccessDisabled',
  AmbiguousGrantByEmailAddress = 'AmbiguousGrantByEmailAddress',
  AuthorizationHeaderMalformed = 'AuthorizationHeaderMalformed',
  BadDigest = 'BadDigest',
  BucketAlreadyExists = 'BucketAlreadyExists',
  BucketAlreadyOwnedByYou = 'BucketAlreadyOwnedByYou',
  BucketNotEmpty = 'BucketNotEmpty',
  ClientTokenConflict = 'ClientTokenConflict',
  CredentialsNotSupported = 'CredentialsNotSupported',
  CrossLocationLoggingProhibited = 'CrossLocationLoggingProhibited',
  EntityTooSmall = 'EntityTooSmall',
  EntityTooLarge = 'EntityTooLarge',
  ExpiredToken = 'ExpiredToken',
  IllegalLocationConstraintException = 'IllegalLocationConstraintException',
  IllegalVersioningConfigurationException = 'IllegalVersioningConfigurationException',
  IncompleteBody = 'IncompleteBody',
  IncorrectNumberOfFilesInPostRequest = 'IncorrectNumberOfFilesInPostRequest',
  InlineDataTooLarge = 'InlineDataTooLarge',
  InternalError = 'InternalError',
  InvalidAccessKeyId = 'InvalidAccessKeyId',
  InvalidAccessPoint = 'InvalidAccessPoint',
  InvalidAccessPointAliasError = 'InvalidAccessPointAliasError',
  InvalidAddressingHeader = 'InvalidAddressingHeader',
  InvalidArgument = 'InvalidArgument',
  InvalidBucketAclWithObjectOwnership = 'InvalidBucketAclWithObjectOwnership',
  InvalidBucketName = 'InvalidBucketName',
  InvalidBucketState = 'InvalidBucketState',
  InvalidDigest = 'InvalidDigest',
  InvalidEncryptionAlgorithmError = 'InvalidEncryptionAlgorithmError',
  InvalidLocationConstraint = 'InvalidLocationConstraint',
  InvalidObjectState = 'InvalidObjectState',
  InvalidPart = 'InvalidPart',
  InvalidPartOrder = 'InvalidPartOrder',
  InvalidPayer = 'InvalidPayer',
  InvalidPolicyDocument = 'InvalidPolicyDocument',
  InvalidRange = 'InvalidRange',
  InvalidRequest = 'InvalidRequest',
  InvalidSecurity = 'InvalidSecurity',
  InvalidSOAPRequest = 'InvalidSOAPRequest',
  InvalidStorageClass = 'InvalidStorageClass',
  InvalidTargetBucketForLogging = 'InvalidTargetBucketForLogging',
  InvalidToken = 'InvalidToken',
  InvalidURI = 'InvalidURI',
  KeyTooLongError = 'KeyTooLongError',
  MalformedACLError = 'MalformedACLError',
  MalformedPOSTRequest = 'MalformedPOSTRequest',
  MalformedXML = 'MalformedXML',
  MaxMessageLengthExceeded = 'MaxMessageLengthExceeded',
  MaxPostPreDataLengthExceededError = 'MaxPostPreDataLengthExceededError',
  MetadataTooLarge = 'MetadataTooLarge',
  MethodNotAllowed = 'MethodNotAllowed',
  MissingAttachment = 'MissingAttachment',
  MissingContentLength = 'MissingContentLength',
  MissingRequestBodyError = 'MissingRequestBodyError',
  MissingSecurityElement = 'MissingSecurityElement',
  MissingSecurityHeader = 'MissingSecurityHeader',
  NoLoggingStatusForKey = 'NoLoggingStatusForKey',
  NoSuchBucket = 'NoSuchBucket',
  NoSuchBucketPolicy = 'NoSuchBucketPolicy',
  NoSuchCORSConfiguration = 'NoSuchCORSConfiguration',
  NoSuchKey = 'NoSuchKey',
  NoSuchLifecycleConfiguration = 'NoSuchLifecycleConfiguration',
  NoSuchMultiRegionAccessPoint = 'NoSuchMultiRegionAccessPoint',
  NoSuchWebsiteConfiguration = 'NoSuchWebsiteConfiguration',
  NoSuchTagSet = 'NoSuchTagSet',
  NoSuchUpload = 'NoSuchUpload',
  NoSuchVersion = 'NoSuchVersion',
  NotImplemented = 'NotImplemented',
  NotModified = 'NotModified',
  NotSignedUp = 'NotSignedUp',
  OwnershipControlsNotFoundError = 'OwnershipControlsNotFoundError',
  OperationAborted = 'OperationAborted',
  PermanentRedirect = 'PermanentRedirect',
  PreconditionFailed = 'PreconditionFailed',
  Redirect = 'Redirect',
  RequestHeaderSectionTooLarge = 'RequestHeaderSectionTooLarge',
  RequestIsNotMultiPartContent = 'RequestIsNotMultiPartContent',
  RequestTimeout = 'RequestTimeout',
  RequestTimeTooSkewed = 'RequestTimeTooSkewed',
  RequestTorrentOfBucketError = 'RequestTorrentOfBucketError',
  RestoreAlreadyInProgress = 'RestoreAlreadyInProgress',
  ServerSideEncryptionConfigurationNotFoundError = 'ServerSideEncryptionConfigurationNotFoundError',
  ServiceUnavailable = 'ServiceUnavailable',
  SignatureDoesNotMatch = 'SignatureDoesNotMatch',
  SlowDown = 'SlowDown',
  TemporaryRedirect = 'TemporaryRedirect',
  TokenRefreshRequired = 'TokenRefreshRequired',
  TooManyAccessPoints = 'TooManyAccessPoints',
  TooManyBuckets = 'TooManyBuckets',
  TooManyMultiRegionAccessPointregionsError = 'TooManyMultiRegionAccessPointregionsError',
  TooManyMultiRegionAccessPoints = 'TooManyMultiRegionAccessPoints',
  UnexpectedContent = 'UnexpectedContent',
  UnresolvableGrantByEmailAddress = 'UnresolvableGrantByEmailAddress',
  UserKeyMustBeSpecified = 'UserKeyMustBeSpecified',
  NoSuchAccessPoint = 'NoSuchAccessPoint',
  InvalidTag = 'InvalidTag',
  MalformedPolicy = 'MalformedPolicy',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isMinioError = (e: unknown): e is MinioError => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const obj = e as any;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.prototype.hasOwnProperty.call(e, 'code') &&
    typeof obj.code === 'string' &&
    Object.values<string>(MinioErrorCode).includes(obj.code as string) &&
    Object.prototype.hasOwnProperty.call(e, 'message') &&
    typeof obj.message === 'string' &&
    Object.prototype.hasOwnProperty.call(e, 'resource') &&
    typeof obj.resource === 'string' &&
    Object.prototype.hasOwnProperty.call(e, 'requestid') &&
    typeof obj.requestid === 'string'
  );
};
