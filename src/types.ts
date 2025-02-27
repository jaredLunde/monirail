export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
	T extends { [key: string]: unknown },
	K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
	| T
	| {
			[P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
	  };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	BigInt: { input: any; output: any };
	CanvasConfig: { input: any; output: any };
	DateTime: { input: any; output: any };
	DeploymentMeta: { input: any; output: any };
	DisplayConfig: { input: any; output: any };
	EnvironmentVariables: { input: any; output: any };
	EventProperties: { input: any; output: any };
	JSON: { input: any; output: any };
	SerializedTemplateConfig: { input: any; output: any };
	ServiceInstanceLimit: { input: any; output: any };
	SubscriptionPlanLimit: { input: any; output: any };
	TemplateConfig: { input: any; output: any };
	TemplateMetadata: { input: any; output: any };
	TemplateServiceConfig: { input: any; output: any };
	TemplateVolume: { input: any; output: any };
	Upload: { input: any; output: any };
};

export const ActiveFeatureFlag = {
	CreateHobbyTeam: "CREATE_HOBBY_TEAM",
	MetalVolumeCreation: "METAL_VOLUME_CREATION",
	PriorityBoarding: "PRIORITY_BOARDING",
	V2NewProjectPage: "V2_NEW_PROJECT_PAGE",
} as const;

export type ActiveFeatureFlag =
	(typeof ActiveFeatureFlag)[keyof typeof ActiveFeatureFlag];
export const ActiveServiceFeatureFlag = {
	BetterCronWorkflow: "BETTER_CRON_WORKFLOW",
	CopyVolumeToEnvironment: "COPY_VOLUME_TO_ENVIRONMENT",
	LegacyCrons: "LEGACY_CRONS",
	Placeholder: "PLACEHOLDER",
} as const;

export type ActiveServiceFeatureFlag =
	(typeof ActiveServiceFeatureFlag)[keyof typeof ActiveServiceFeatureFlag];
export type ApiTokenCreateInput = {
	name: Scalars["String"]["input"];
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type BaseEnvironmentOverrideInput = {
	baseEnvironmentOverrideId?: InputMaybe<Scalars["String"]["input"]>;
};

export const Builder = {
	Heroku: "HEROKU",
	Nixpacks: "NIXPACKS",
	Paketo: "PAKETO",
	Railpack: "RAILPACK",
} as const;

export type Builder = (typeof Builder)[keyof typeof Builder];
export const CdnProvider = {
	DetectedCdnProviderCloudflare: "DETECTED_CDN_PROVIDER_CLOUDFLARE",
	DetectedCdnProviderUnspecified: "DETECTED_CDN_PROVIDER_UNSPECIFIED",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type CdnProvider = (typeof CdnProvider)[keyof typeof CdnProvider];
export const CertificateStatus = {
	CertificateStatusTypeIssueFailed: "CERTIFICATE_STATUS_TYPE_ISSUE_FAILED",
	CertificateStatusTypeIssuing: "CERTIFICATE_STATUS_TYPE_ISSUING",
	CertificateStatusTypeUnspecified: "CERTIFICATE_STATUS_TYPE_UNSPECIFIED",
	CertificateStatusTypeValid: "CERTIFICATE_STATUS_TYPE_VALID",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type CertificateStatus =
	(typeof CertificateStatus)[keyof typeof CertificateStatus];
export const CnameCheckStatus = {
	Error: "ERROR",
	Info: "INFO",
	Invalid: "INVALID",
	Valid: "VALID",
	Waiting: "WAITING",
} as const;

export type CnameCheckStatus =
	(typeof CnameCheckStatus)[keyof typeof CnameCheckStatus];
export const CreditType = {
	Applied: "APPLIED",
	Credit: "CREDIT",
	Debit: "DEBIT",
	Stripe: "STRIPE",
	Transfer: "TRANSFER",
	Waived: "WAIVED",
} as const;

export type CreditType = (typeof CreditType)[keyof typeof CreditType];
export type CustomDomainCreateInput = {
	domain: Scalars["String"]["input"];
	environmentId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
	targetPort?: InputMaybe<Scalars["Int"]["input"]>;
};

export const DnsRecordPurpose = {
	DnsRecordPurposeAcmeDns01Challenge: "DNS_RECORD_PURPOSE_ACME_DNS01_CHALLENGE",
	DnsRecordPurposeTrafficRoute: "DNS_RECORD_PURPOSE_TRAFFIC_ROUTE",
	DnsRecordPurposeUnspecified: "DNS_RECORD_PURPOSE_UNSPECIFIED",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type DnsRecordPurpose =
	(typeof DnsRecordPurpose)[keyof typeof DnsRecordPurpose];
export const DnsRecordStatus = {
	DnsRecordStatusPropagated: "DNS_RECORD_STATUS_PROPAGATED",
	DnsRecordStatusRequiresUpdate: "DNS_RECORD_STATUS_REQUIRES_UPDATE",
	DnsRecordStatusUnspecified: "DNS_RECORD_STATUS_UNSPECIFIED",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type DnsRecordStatus =
	(typeof DnsRecordStatus)[keyof typeof DnsRecordStatus];
export const DnsRecordType = {
	DnsRecordTypeA: "DNS_RECORD_TYPE_A",
	DnsRecordTypeCname: "DNS_RECORD_TYPE_CNAME",
	DnsRecordTypeNs: "DNS_RECORD_TYPE_NS",
	DnsRecordTypeUnspecified: "DNS_RECORD_TYPE_UNSPECIFIED",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type DnsRecordType = (typeof DnsRecordType)[keyof typeof DnsRecordType];
export const DeploymentEventStep = {
	BuildImage: "BUILD_IMAGE",
	CreateContainer: "CREATE_CONTAINER",
	DrainInstances: "DRAIN_INSTANCES",
	Healthcheck: "HEALTHCHECK",
	MigrateVolumes: "MIGRATE_VOLUMES",
	PreDeployCommand: "PRE_DEPLOY_COMMAND",
	PublishImage: "PUBLISH_IMAGE",
	SnapshotCode: "SNAPSHOT_CODE",
	WaitForDependencies: "WAIT_FOR_DEPENDENCIES",
} as const;

export type DeploymentEventStep =
	(typeof DeploymentEventStep)[keyof typeof DeploymentEventStep];
export type DeploymentInstanceExecutionCreateInput = {
	serviceInstanceId: Scalars["String"]["input"];
};

export type DeploymentInstanceExecutionInput = {
	deploymentId: Scalars["String"]["input"];
};

export type DeploymentInstanceExecutionListInput = {
	environmentId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export const DeploymentInstanceStatus = {
	Crashed: "CRASHED",
	Created: "CREATED",
	Exited: "EXITED",
	Initializing: "INITIALIZING",
	Removed: "REMOVED",
	Removing: "REMOVING",
	Restarting: "RESTARTING",
	Running: "RUNNING",
	Skipped: "SKIPPED",
	Stopped: "STOPPED",
} as const;

export type DeploymentInstanceStatus =
	(typeof DeploymentInstanceStatus)[keyof typeof DeploymentInstanceStatus];
export type DeploymentListInput = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	includeDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
	projectId?: InputMaybe<Scalars["String"]["input"]>;
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	status?: InputMaybe<DeploymentStatusInput>;
};

export const DeploymentStatus = {
	Building: "BUILDING",
	Crashed: "CRASHED",
	Deploying: "DEPLOYING",
	Failed: "FAILED",
	Initializing: "INITIALIZING",
	NeedsApproval: "NEEDS_APPROVAL",
	Queued: "QUEUED",
	Removed: "REMOVED",
	Removing: "REMOVING",
	Skipped: "SKIPPED",
	Sleeping: "SLEEPING",
	Success: "SUCCESS",
	Waiting: "WAITING",
} as const;

export type DeploymentStatus =
	(typeof DeploymentStatus)[keyof typeof DeploymentStatus];
export type DeploymentStatusInput = {
	in?: InputMaybe<Array<DeploymentStatus>>;
	notIn?: InputMaybe<Array<DeploymentStatus>>;
};

export type DeploymentTriggerCreateInput = {
	branch: Scalars["String"]["input"];
	checkSuites?: InputMaybe<Scalars["Boolean"]["input"]>;
	environmentId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	provider: Scalars["String"]["input"];
	repository: Scalars["String"]["input"];
	rootDirectory?: InputMaybe<Scalars["String"]["input"]>;
	serviceId: Scalars["String"]["input"];
};

export type DeploymentTriggerUpdateInput = {
	branch?: InputMaybe<Scalars["String"]["input"]>;
	checkSuites?: InputMaybe<Scalars["Boolean"]["input"]>;
	repository?: InputMaybe<Scalars["String"]["input"]>;
	rootDirectory?: InputMaybe<Scalars["String"]["input"]>;
};

export type EgressGatewayCreateInput = {
	environmentId: Scalars["String"]["input"];
	region?: InputMaybe<Scalars["String"]["input"]>;
	serviceId: Scalars["String"]["input"];
};

export type EgressGatewayServiceTargetInput = {
	environmentId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export type EnvironmentCreateInput = {
	ephemeral?: InputMaybe<Scalars["Boolean"]["input"]>;
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	/** When committing the changes immediately, skip any initial deployments. */
	skipInitialDeploys?: InputMaybe<Scalars["Boolean"]["input"]>;
	/** Create the environment with all of the services, volumes, configuration, and variables from this source environment. */
	sourceEnvironmentId?: InputMaybe<Scalars["String"]["input"]>;
	/** Stage the initial changes for the environment. If false (default), the changes will be committed immediately. */
	stageInitialChanges?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type EnvironmentRenameInput = {
	name: Scalars["String"]["input"];
};

export type EnvironmentTriggersDeployInput = {
	environmentId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export type EventBatchTrackInput = {
	events: Array<EventTrackInput>;
};

export type EventFilterInput = {
	action?: InputMaybe<EventStringListFilter>;
	object?: InputMaybe<EventStringListFilter>;
};

export type EventStringListFilter = {
	in?: InputMaybe<Array<Scalars["String"]["input"]>>;
	notIn?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type EventTrackInput = {
	eventName: Scalars["String"]["input"];
	properties?: InputMaybe<Scalars["EventProperties"]["input"]>;
	ts: Scalars["String"]["input"];
};

export type ExplicitOwnerInput = {
	/** The ID of the owner */
	id: Scalars["String"]["input"];
	/** The type of owner */
	type: ResourceOwnerType;
};

export type FeatureFlagToggleInput = {
	flag: ActiveFeatureFlag;
};

export type GitHubRepoDeployInput = {
	branch?: InputMaybe<Scalars["String"]["input"]>;
	projectId: Scalars["String"]["input"];
	repo: Scalars["String"]["input"];
};

export type GitHubRepoUpdateInput = {
	environmentId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export type HelpStationFormInput = {
	isPrivate: Scalars["Boolean"]["input"];
	message: Scalars["String"]["input"];
	subject: Scalars["String"]["input"];
	topic: Scalars["String"]["input"];
};

export type HerokuImportVariablesInput = {
	environmentId: Scalars["String"]["input"];
	herokuAppId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export const IncidentStatus = {
	Identified: "IDENTIFIED",
	Investigating: "INVESTIGATING",
	Monitoring: "MONITORING",
	Resolved: "RESOLVED",
} as const;

export type IncidentStatus =
	(typeof IncidentStatus)[keyof typeof IncidentStatus];
export type IntegrationCreateInput = {
	config: Scalars["JSON"]["input"];
	integrationAuthId?: InputMaybe<Scalars["String"]["input"]>;
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type IntegrationUpdateInput = {
	config: Scalars["JSON"]["input"];
	integrationAuthId?: InputMaybe<Scalars["String"]["input"]>;
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type JobApplicationCreateInput = {
	email: Scalars["String"]["input"];
	jobId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	why: Scalars["String"]["input"];
};

export const KeyType = {
	KeyTypeEcdsa: "KEY_TYPE_ECDSA",
	KeyTypeRsa_2048: "KEY_TYPE_RSA_2048",
	KeyTypeRsa_4096: "KEY_TYPE_RSA_4096",
	KeyTypeUnspecified: "KEY_TYPE_UNSPECIFIED",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type KeyType = (typeof KeyType)[keyof typeof KeyType];
export type LoginSessionAuthInput = {
	code: Scalars["String"]["input"];
	hostname?: InputMaybe<Scalars["String"]["input"]>;
};

export const MaintenanceStatus = {
	Completed: "COMPLETED",
	Inprogress: "INPROGRESS",
	Notstartedyet: "NOTSTARTEDYET",
} as const;

export type MaintenanceStatus =
	(typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];
/** A thing that can be measured on Railway. */
export const MetricMeasurement = {
	BackupUsageGb: "BACKUP_USAGE_GB",
	CpuLimit: "CPU_LIMIT",
	CpuUsage: "CPU_USAGE",
	CpuUsage_2: "CPU_USAGE_2",
	DiskUsageGb: "DISK_USAGE_GB",
	EphemeralDiskUsageGb: "EPHEMERAL_DISK_USAGE_GB",
	MeasurementUnspecified: "MEASUREMENT_UNSPECIFIED",
	MemoryLimitGb: "MEMORY_LIMIT_GB",
	MemoryUsageGb: "MEMORY_USAGE_GB",
	NetworkRxGb: "NETWORK_RX_GB",
	NetworkTxGb: "NETWORK_TX_GB",
	Unrecognized: "UNRECOGNIZED",
} as const;

export type MetricMeasurement =
	(typeof MetricMeasurement)[keyof typeof MetricMeasurement];
/** A property that can be used to group metrics. */
export const MetricTag = {
	DeploymentId: "DEPLOYMENT_ID",
	DeploymentInstanceId: "DEPLOYMENT_INSTANCE_ID",
	EnvironmentId: "ENVIRONMENT_ID",
	HostType: "HOST_TYPE",
	KeyUnspecified: "KEY_UNSPECIFIED",
	PluginId: "PLUGIN_ID",
	ProjectId: "PROJECT_ID",
	ServiceId: "SERVICE_ID",
	Unrecognized: "UNRECOGNIZED",
	VolumeId: "VOLUME_ID",
} as const;

export type MetricTag = (typeof MetricTag)[keyof typeof MetricTag];
export type MissingCommandAlertInput = {
	page: Scalars["String"]["input"];
	text: Scalars["String"]["input"];
};

export type ObservabilityDashboardCreateInput = {
	environmentId: Scalars["String"]["input"];
	/** If no items are provided, a default dashboard will be created. */
	items?: InputMaybe<Array<ObservabilityDashboardUpdateInput>>;
};

export type ObservabilityDashboardItemConfigInput = {
	logsFilter?: InputMaybe<Scalars["String"]["input"]>;
	measurements?: InputMaybe<Array<MetricMeasurement>>;
	projectUsageProperties?: InputMaybe<Array<ProjectUsageProperty>>;
	resourceIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type ObservabilityDashboardItemCreateInput = {
	config: ObservabilityDashboardItemConfigInput;
	description?: InputMaybe<Scalars["String"]["input"]>;
	id: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	type: ObservabilityDashboardItemType;
};

export const ObservabilityDashboardItemType = {
	ProjectUsageItem: "PROJECT_USAGE_ITEM",
	ServiceLogsItem: "SERVICE_LOGS_ITEM",
	ServiceMetricsItem: "SERVICE_METRICS_ITEM",
	VolumeMetricsItem: "VOLUME_METRICS_ITEM",
} as const;

export type ObservabilityDashboardItemType =
	(typeof ObservabilityDashboardItemType)[keyof typeof ObservabilityDashboardItemType];
export type ObservabilityDashboardUpdateInput = {
	dashboardItem: ObservabilityDashboardItemCreateInput;
	displayConfig: Scalars["DisplayConfig"]["input"];
	id: Scalars["String"]["input"];
};

export type OverrideInput = {
	enabled: Scalars["Boolean"]["input"];
	name: Scalars["String"]["input"];
	resource: Scalars["String"]["input"];
	resourceId: Scalars["String"]["input"];
};

export type PluginCreateInput = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	friendlyName?: InputMaybe<Scalars["String"]["input"]>;
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type PluginRestartInput = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
};

export const PluginStatus = {
	Deprecated: "DEPRECATED",
	Locked: "LOCKED",
	Removed: "REMOVED",
	Running: "RUNNING",
	Stopped: "STOPPED",
} as const;

export type PluginStatus = (typeof PluginStatus)[keyof typeof PluginStatus];
export const PluginType = {
	Mongodb: "mongodb",
	Mysql: "mysql",
	Postgresql: "postgresql",
	Redis: "redis",
} as const;

export type PluginType = (typeof PluginType)[keyof typeof PluginType];
export type PluginUpdateInput = {
	friendlyName: Scalars["String"]["input"];
};

export type PreferenceOverridesCreateUpdateData = {
	overrides: Array<OverrideInput>;
};

export type PreferenceOverridesDestroyData = {
	resource: Scalars["String"]["input"];
	resourceId: Scalars["String"]["input"];
};

export type PreferencesUpdateData = {
	buildFailedEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	changelogEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	communityEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	deployCrashedEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	ephemeralEnvironmentEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	marketingEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	subprocessorUpdatesEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
	token?: InputMaybe<Scalars["String"]["input"]>;
	usageEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type PrivateNetworkCreateOrGetInput = {
	environmentId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	tags: Array<Scalars["String"]["input"]>;
};

export type PrivateNetworkEndpointCreateOrGetInput = {
	environmentId: Scalars["String"]["input"];
	privateNetworkId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
	serviceName: Scalars["String"]["input"];
	tags: Array<Scalars["String"]["input"]>;
};

export type ProjectCreateInput = {
	defaultEnvironmentName?: InputMaybe<Scalars["String"]["input"]>;
	description?: InputMaybe<Scalars["String"]["input"]>;
	isPublic?: InputMaybe<Scalars["Boolean"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	plugins?: InputMaybe<Array<Scalars["String"]["input"]>>;
	prDeploys?: InputMaybe<Scalars["Boolean"]["input"]>;
	repo?: InputMaybe<ProjectCreateRepo>;
	runtime?: InputMaybe<PublicRuntime>;
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProjectCreateRepo = {
	branch: Scalars["String"]["input"];
	fullRepoName: Scalars["String"]["input"];
};

export type ProjectInviteUserInput = {
	email: Scalars["String"]["input"];
	link: Scalars["String"]["input"];
};

export type ProjectInvitee = {
	email: Scalars["String"]["input"];
	role: ProjectRole;
};

export type ProjectMemberRemoveInput = {
	projectId: Scalars["String"]["input"];
	userId: Scalars["String"]["input"];
};

export type ProjectMemberUpdateInput = {
	projectId: Scalars["String"]["input"];
	role: ProjectRole;
	userId: Scalars["String"]["input"];
};

export const ProjectRole = {
	Admin: "ADMIN",
	Member: "MEMBER",
	Viewer: "VIEWER",
} as const;

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];
export type ProjectTokenCreateInput = {
	environmentId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type ProjectTransferConfirmInput = {
	ownershipTransferId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type ProjectTransferInitiateInput = {
	memberId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export type ProjectTransferToTeamInput = {
	teamId: Scalars["String"]["input"];
};

export type ProjectUpdateInput = {
	baseEnvironmentId?: InputMaybe<Scalars["String"]["input"]>;
	/** Enable/disable pull request environments for PRs created by bots */
	botPrEnvironments?: InputMaybe<Scalars["Boolean"]["input"]>;
	description?: InputMaybe<Scalars["String"]["input"]>;
	isPublic?: InputMaybe<Scalars["Boolean"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	prDeploys?: InputMaybe<Scalars["Boolean"]["input"]>;
	/** Enable/disable copying volume data to PR environment from the base environment */
	prEnvCopyVolData?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export const ProjectUsageProperty = {
	BackupUsage: "BACKUP_USAGE",
	CpuUsage: "CPU_USAGE",
	CurrentUsage: "CURRENT_USAGE",
	DiskUsage: "DISK_USAGE",
	EstimatedUsage: "ESTIMATED_USAGE",
	MemoryUsage: "MEMORY_USAGE",
	NetworkUsage: "NETWORK_USAGE",
} as const;

export type ProjectUsageProperty =
	(typeof ProjectUsageProperty)[keyof typeof ProjectUsageProperty];
export const PublicRuntime = {
	Legacy: "LEGACY",
	Unspecified: "UNSPECIFIED",
	V2: "V2",
} as const;

export type PublicRuntime = (typeof PublicRuntime)[keyof typeof PublicRuntime];
export type RecoveryCodeValidateInput = {
	code: Scalars["String"]["input"];
	twoFactorLinkingKey?: InputMaybe<Scalars["String"]["input"]>;
};

export type ReferralInfoUpdateInput = {
	code: Scalars["String"]["input"];
};

export const ReferralStatus = {
	RefereeCredited: "REFEREE_CREDITED",
	ReferrerCredited: "REFERRER_CREDITED",
	Registered: "REGISTERED",
} as const;

export type ReferralStatus =
	(typeof ReferralStatus)[keyof typeof ReferralStatus];
/** Possible decisions for a RefundRequest */
export const RefundRequestDecisionEnum = {
	AutoRefunded: "AUTO_REFUNDED",
	AutoRejected: "AUTO_REJECTED",
	ManuallyRefunded: "MANUALLY_REFUNDED",
} as const;

export type RefundRequestDecisionEnum =
	(typeof RefundRequestDecisionEnum)[keyof typeof RefundRequestDecisionEnum];
export const RegistrationStatus = {
	Onboarded: "ONBOARDED",
	Registered: "REGISTERED",
	Waitlisted: "WAITLISTED",
} as const;

export type RegistrationStatus =
	(typeof RegistrationStatus)[keyof typeof RegistrationStatus];
/** Private Docker registry credentials. Only available for Pro plan deployments. */
export type RegistryCredentialsInput = {
	password: Scalars["String"]["input"];
	username: Scalars["String"]["input"];
};

export type ResetPluginCredentialsInput = {
	environmentId: Scalars["String"]["input"];
};

export type ResetPluginInput = {
	environmentId: Scalars["String"]["input"];
};

export const ResourceOwnerType = {
	Team: "TEAM",
	User: "USER",
} as const;

export type ResourceOwnerType =
	(typeof ResourceOwnerType)[keyof typeof ResourceOwnerType];
export const RestartPolicyType = {
	Always: "ALWAYS",
	Never: "NEVER",
	OnFailure: "ON_FAILURE",
} as const;

export type RestartPolicyType =
	(typeof RestartPolicyType)[keyof typeof RestartPolicyType];
export type SendCommunityThreadNotificationEmailInput = {
	postEntryContent?: InputMaybe<Scalars["String"]["input"]>;
	threadTitle: Scalars["String"]["input"];
	threadUrl: Scalars["String"]["input"];
	userIds: Array<Scalars["String"]["input"]>;
};

export type ServiceConnectInput = {
	/** The branch to connect to. e.g. 'main' */
	branch?: InputMaybe<Scalars["String"]["input"]>;
	/** Name of the Dockerhub or GHCR image to connect this service to. */
	image?: InputMaybe<Scalars["String"]["input"]>;
	/** The full name of the repo to connect to. e.g. 'railwayapp/starters' */
	repo?: InputMaybe<Scalars["String"]["input"]>;
};

export type ServiceCreateInput = {
	branch?: InputMaybe<Scalars["String"]["input"]>;
	/** Environment ID. If the specified environment is a fork, the service will only be created in it. Otherwise it will created in all environments that are not forks of other environments */
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	icon?: InputMaybe<Scalars["String"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	projectId: Scalars["String"]["input"];
	registryCredentials?: InputMaybe<RegistryCredentialsInput>;
	source?: InputMaybe<ServiceSourceInput>;
	templateServiceId?: InputMaybe<Scalars["String"]["input"]>;
	variables?: InputMaybe<Scalars["EnvironmentVariables"]["input"]>;
};

export type ServiceDomainCreateInput = {
	environmentId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
	targetPort?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ServiceDomainUpdateInput = {
	domain: Scalars["String"]["input"];
	environmentId: Scalars["String"]["input"];
	serviceDomainId?: InputMaybe<Scalars["String"]["input"]>;
	serviceId: Scalars["String"]["input"];
	targetPort?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ServiceFeatureFlagToggleInput = {
	flag: ActiveServiceFeatureFlag;
	serviceId: Scalars["String"]["input"];
};

export type ServiceInstanceLimitsUpdateInput = {
	environmentId: Scalars["String"]["input"];
	/** Amount of memory in GB to allocate to the service instance */
	memoryGB?: InputMaybe<Scalars["Float"]["input"]>;
	serviceId: Scalars["String"]["input"];
	/** Number of vCPUs to allocate to the service instance */
	vCPUs?: InputMaybe<Scalars["Float"]["input"]>;
};

export type ServiceInstanceUpdateInput = {
	buildCommand?: InputMaybe<Scalars["String"]["input"]>;
	builder?: InputMaybe<Builder>;
	cronSchedule?: InputMaybe<Scalars["String"]["input"]>;
	healthcheckPath?: InputMaybe<Scalars["String"]["input"]>;
	healthcheckTimeout?: InputMaybe<Scalars["Int"]["input"]>;
	multiRegionConfig?: InputMaybe<Scalars["JSON"]["input"]>;
	nixpacksPlan?: InputMaybe<Scalars["JSON"]["input"]>;
	numReplicas?: InputMaybe<Scalars["Int"]["input"]>;
	preDeployCommand?: InputMaybe<Array<Scalars["String"]["input"]>>;
	railwayConfigFile?: InputMaybe<Scalars["String"]["input"]>;
	region?: InputMaybe<Scalars["String"]["input"]>;
	registryCredentials?: InputMaybe<RegistryCredentialsInput>;
	restartPolicyMaxRetries?: InputMaybe<Scalars["Int"]["input"]>;
	restartPolicyType?: InputMaybe<RestartPolicyType>;
	rootDirectory?: InputMaybe<Scalars["String"]["input"]>;
	sleepApplication?: InputMaybe<Scalars["Boolean"]["input"]>;
	source?: InputMaybe<ServiceSourceInput>;
	startCommand?: InputMaybe<Scalars["String"]["input"]>;
	watchPatterns?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type ServiceSourceInput = {
	image?: InputMaybe<Scalars["String"]["input"]>;
	repo?: InputMaybe<Scalars["String"]["input"]>;
};

export type ServiceUpdateInput = {
	icon?: InputMaybe<Scalars["String"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
};

export const SessionType = {
	Browser: "BROWSER",
	Cli: "CLI",
	Forums: "FORUMS",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];
export type SharedVariableConfigureInput = {
	disabledServiceIds: Array<Scalars["String"]["input"]>;
	enabledServiceIds: Array<Scalars["String"]["input"]>;
	environmentId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
};

export const SubscriptionModel = {
	Free: "FREE",
	Team: "TEAM",
	User: "USER",
} as const;

export type SubscriptionModel =
	(typeof SubscriptionModel)[keyof typeof SubscriptionModel];
export const SubscriptionPlanType = {
	Free: "free",
	Hobby: "hobby",
	Pro: "pro",
	Trial: "trial",
} as const;

export type SubscriptionPlanType =
	(typeof SubscriptionPlanType)[keyof typeof SubscriptionPlanType];
export const SubscriptionState = {
	Active: "ACTIVE",
	Cancelled: "CANCELLED",
	Inactive: "INACTIVE",
	PastDue: "PAST_DUE",
	Unpaid: "UNPAID",
} as const;

export type SubscriptionState =
	(typeof SubscriptionState)[keyof typeof SubscriptionState];
export const SupportTierOverride = {
	BusinessClass: "BUSINESS_CLASS",
	BusinessClassTrial: "BUSINESS_CLASS_TRIAL",
} as const;

export type SupportTierOverride =
	(typeof SupportTierOverride)[keyof typeof SupportTierOverride];
export type TcpProxyCreateInput = {
	applicationPort: Scalars["Int"]["input"];
	environmentId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
};

export type TeamBulkProjectTransferInput = {
	projectIds: Array<Scalars["String"]["input"]>;
	teamId: Scalars["String"]["input"];
};

export type TeamCreateAndSubscribeInput = {
	avatar?: InputMaybe<Scalars["String"]["input"]>;
	name: Scalars["String"]["input"];
	paymentMethodId: Scalars["String"]["input"];
};

export type TeamCreateInput = {
	avatar?: InputMaybe<Scalars["String"]["input"]>;
	name: Scalars["String"]["input"];
};

export type TeamInviteCodeCreateInput = {
	role: Scalars["String"]["input"];
};

export type TeamPermissionChangeInput = {
	role: TeamRole;
	teamId: Scalars["String"]["input"];
	userId: Scalars["String"]["input"];
};

export const TeamRole = {
	Admin: "ADMIN",
	Member: "MEMBER",
	Viewer: "VIEWER",
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];
export type TeamTrustedDomainCreateInput = {
	domainName: Scalars["String"]["input"];
	teamId: Scalars["String"]["input"];
	teamRole: Scalars["String"]["input"];
};

export type TeamUpdateInput = {
	avatar?: InputMaybe<Scalars["String"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	preferredRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type TeamUserInviteInput = {
	code: Scalars["String"]["input"];
	email: Scalars["String"]["input"];
};

export type TeamUserRemoveInput = {
	userId: Scalars["String"]["input"];
};

export type TelemetrySendInput = {
	command: Scalars["String"]["input"];
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	error: Scalars["String"]["input"];
	projectId?: InputMaybe<Scalars["String"]["input"]>;
	stacktrace: Scalars["String"]["input"];
	version?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplateCloneInput = {
	code: Scalars["String"]["input"];
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplateDeleteInput = {
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplateDeployInput = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	projectId?: InputMaybe<Scalars["String"]["input"]>;
	services: Array<TemplateDeployService>;
	teamId?: InputMaybe<Scalars["String"]["input"]>;
	templateCode?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplateDeployService = {
	commit?: InputMaybe<Scalars["String"]["input"]>;
	hasDomain?: InputMaybe<Scalars["Boolean"]["input"]>;
	healthcheckPath?: InputMaybe<Scalars["String"]["input"]>;
	id: Scalars["String"]["input"];
	isPrivate?: InputMaybe<Scalars["Boolean"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	owner?: InputMaybe<Scalars["String"]["input"]>;
	preDeployCommand?: InputMaybe<Array<Scalars["String"]["input"]>>;
	rootDirectory?: InputMaybe<Scalars["String"]["input"]>;
	serviceIcon?: InputMaybe<Scalars["String"]["input"]>;
	serviceName: Scalars["String"]["input"];
	startCommand?: InputMaybe<Scalars["String"]["input"]>;
	tcpProxyApplicationPort?: InputMaybe<Scalars["Int"]["input"]>;
	template: Scalars["String"]["input"];
	variables?: InputMaybe<Scalars["EnvironmentVariables"]["input"]>;
	volumes?: InputMaybe<Array<Scalars["TemplateVolume"]["input"]>>;
};

export type TemplateDeployV2Input = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	projectId?: InputMaybe<Scalars["String"]["input"]>;
	serializedConfig: Scalars["SerializedTemplateConfig"]["input"];
	teamId?: InputMaybe<Scalars["String"]["input"]>;
	templateId: Scalars["String"]["input"];
};

export type TemplateGenerateInput = {
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	projectId: Scalars["String"]["input"];
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplatePublishInput = {
	category: Scalars["String"]["input"];
	demoProjectId?: InputMaybe<Scalars["String"]["input"]>;
	description: Scalars["String"]["input"];
	image?: InputMaybe<Scalars["String"]["input"]>;
	readme: Scalars["String"]["input"];
	teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type TemplateServiceSourceEjectInput = {
	projectId: Scalars["String"]["input"];
	repoName: Scalars["String"]["input"];
	repoOwner: Scalars["String"]["input"];
	/** Provide multiple serviceIds when ejecting services from a monorepo. */
	serviceIds: Array<Scalars["String"]["input"]>;
	upstreamUrl: Scalars["String"]["input"];
};

export const TemplateStatus = {
	Hidden: "HIDDEN",
	Published: "PUBLISHED",
	Unpublished: "UNPUBLISHED",
} as const;

export type TemplateStatus =
	(typeof TemplateStatus)[keyof typeof TemplateStatus];
export type TwoFactorInfoCreateInput = {
	token: Scalars["String"]["input"];
};

export type TwoFactorInfoValidateInput = {
	token: Scalars["String"]["input"];
	twoFactorLinkingKey?: InputMaybe<Scalars["String"]["input"]>;
};

/** Possible actions for a UsageAnomaly. */
export const UsageAnomalyAction = {
	Allowed: "ALLOWED",
	Autobanned: "AUTOBANNED",
	Banned: "BANNED",
} as const;

export type UsageAnomalyAction =
	(typeof UsageAnomalyAction)[keyof typeof UsageAnomalyAction];
/** Possible flag reasons for a UsageAnomaly. */
export const UsageAnomalyFlagReason = {
	HighCpuUsage: "HIGH_CPU_USAGE",
	HighDiskUsage: "HIGH_DISK_USAGE",
	HighNetworkUsage: "HIGH_NETWORK_USAGE",
} as const;

export type UsageAnomalyFlagReason =
	(typeof UsageAnomalyFlagReason)[keyof typeof UsageAnomalyFlagReason];
export type UsageLimitRemoveInput = {
	customerId: Scalars["String"]["input"];
};

export type UsageLimitSetInput = {
	customerId: Scalars["String"]["input"];
	hardLimitDollars?: InputMaybe<Scalars["Int"]["input"]>;
	softLimitDollars: Scalars["Int"]["input"];
};

export const UserFlag = {
	Beta: "BETA",
} as const;

export type UserFlag = (typeof UserFlag)[keyof typeof UserFlag];
export type UserFlagsRemoveInput = {
	flags: Array<UserFlag>;
	userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserFlagsSetInput = {
	flags: Array<UserFlag>;
	userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserProfileUpdateInput = {
	bio?: InputMaybe<Scalars["String"]["input"]>;
	isPublic: Scalars["Boolean"]["input"];
	website?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserUpdateInput = {
	avatar?: InputMaybe<Scalars["String"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	username?: InputMaybe<Scalars["String"]["input"]>;
};

export type VariableCollectionUpsertInput = {
	environmentId: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	/** When set to true, removes all existing variables before upserting the new collection. */
	replace?: InputMaybe<Scalars["Boolean"]["input"]>;
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	variables: Scalars["EnvironmentVariables"]["input"];
};

export type VariableDeleteInput = {
	environmentId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
};

export type VariableUpsertInput = {
	environmentId: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	projectId: Scalars["String"]["input"];
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	value: Scalars["String"]["input"];
};

export type VolumeCreateInput = {
	/** The environment to deploy the volume instances into. If `null`, the volume will not be deployed to any environment. `undefined` will deploy to all environments. */
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	/** The path in the container to mount the volume to */
	mountPath: Scalars["String"]["input"];
	/** The project to create the volume in */
	projectId: Scalars["String"]["input"];
	/** The service to attach the volume to. If not provided, the volume will be disconnected. */
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
};

export const VolumeInstanceBackupScheduleKind = {
	Daily: "DAILY",
	Monthly: "MONTHLY",
	Weekly: "WEEKLY",
} as const;

export type VolumeInstanceBackupScheduleKind =
	(typeof VolumeInstanceBackupScheduleKind)[keyof typeof VolumeInstanceBackupScheduleKind];
export const VolumeInstanceType = {
	Cloud: "CLOUD",
	Metal: "METAL",
} as const;

export type VolumeInstanceType =
	(typeof VolumeInstanceType)[keyof typeof VolumeInstanceType];
export type VolumeInstanceUpdateInput = {
	/** The mount path of the volume instance. If not provided, the mount path will not be updated. */
	mountPath?: InputMaybe<Scalars["String"]["input"]>;
	/** The service to attach the volume to. If not provided, the volume will be disconnected. */
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	/** The state of the volume instance. If not provided, the state will not be updated. */
	state?: InputMaybe<VolumeState>;
	/** The type of the volume instance. If not provided, the type will not be updated. */
	type?: InputMaybe<VolumeInstanceType>;
};

export const VolumeState = {
	Deleted: "DELETED",
	Deleting: "DELETING",
	Error: "ERROR",
	Migrating: "MIGRATING",
	MigrationPending: "MIGRATION_PENDING",
	Ready: "READY",
	Updating: "UPDATING",
} as const;

export type VolumeState = (typeof VolumeState)[keyof typeof VolumeState];
export type VolumeUpdateInput = {
	/** The name of the volume */
	name?: InputMaybe<Scalars["String"]["input"]>;
};

export type WebhookCreateInput = {
	filters?: InputMaybe<Array<Scalars["String"]["input"]>>;
	projectId: Scalars["String"]["input"];
	url: Scalars["String"]["input"];
};

export type WebhookUpdateInput = {
	filters?: InputMaybe<Array<Scalars["String"]["input"]>>;
	url: Scalars["String"]["input"];
};

export const WithdrawalPlatformTypes = {
	Bmac: "BMAC",
	Github: "GITHUB",
	Paypal: "PAYPAL",
} as const;

export type WithdrawalPlatformTypes =
	(typeof WithdrawalPlatformTypes)[keyof typeof WithdrawalPlatformTypes];
export const WithdrawalStatusType = {
	Cancelled: "CANCELLED",
	Completed: "COMPLETED",
	Failed: "FAILED",
	Pending: "PENDING",
} as const;

export type WithdrawalStatusType =
	(typeof WithdrawalStatusType)[keyof typeof WithdrawalStatusType];
export const WorkflowStatus = {
	Complete: "Complete",
	Error: "Error",
	NotFound: "NotFound",
	Running: "Running",
} as const;

export type WorkflowStatus =
	(typeof WorkflowStatus)[keyof typeof WorkflowStatus];
export type WorkspaceUpdateInput = {
	avatar?: InputMaybe<Scalars["String"]["input"]>;
	name?: InputMaybe<Scalars["String"]["input"]>;
	preferredRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type CustomerTogglePayoutsToCreditsInput = {
	isWithdrawingToCredits: Scalars["Boolean"]["input"];
};

export type ListDeploymentLogsQueryVariables = Exact<{
	deploymentId: Scalars["String"]["input"];
	startDate: Scalars["DateTime"]["input"];
	endDate: Scalars["DateTime"]["input"];
	filter: Scalars["String"]["input"];
	limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type ListDeploymentLogsQuery = {
	deploymentLogs: Array<{ timestamp: string }>;
};

export type ListEnvironmentsQueryVariables = Exact<{
	projectId: Scalars["String"]["input"];
	after?: InputMaybe<Scalars["String"]["input"]>;
	last?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type ListEnvironmentsQuery = {
	environments: {
		edges: Array<{ node: { id: string; name: string } }>;
		pageInfo: { endCursor?: string | null; hasNextPage: boolean };
	};
};

export type ListEnvironmentLogsQueryVariables = Exact<{
	environmentId: Scalars["String"]["input"];
	startDate: Scalars["String"]["input"];
	endDate: Scalars["String"]["input"];
	filter: Scalars["String"]["input"];
	limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type ListEnvironmentLogsQuery = {
	environmentLogs: Array<{ timestamp: string }>;
};

export type ListHttpLogsQueryVariables = Exact<{
	deploymentId: Scalars["String"]["input"];
	startDate: Scalars["String"]["input"];
	endDate: Scalars["String"]["input"];
	filter: Scalars["String"]["input"];
	limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type ListHttpLogsQuery = {
	httpLogs: Array<{ totalDuration: number; timestamp: string }>;
};

export type ListMetricsQueryVariables = Exact<{
	environmentId: Scalars["String"]["input"];
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	volumeId?: InputMaybe<Scalars["String"]["input"]>;
	measurements: Array<MetricMeasurement> | MetricMeasurement;
	startDate: Scalars["DateTime"]["input"];
	endDate: Scalars["DateTime"]["input"];
	groupBy?: InputMaybe<Array<MetricTag> | MetricTag>;
}>;

export type ListMetricsQuery = {
	metrics: Array<{
		measurement: MetricMeasurement;
		values: Array<{ value: number; ts: number }>;
	}>;
};

export type ListDeploymentsQueryVariables = Exact<{
	projectId?: InputMaybe<Scalars["String"]["input"]>;
	environmentId?: InputMaybe<Scalars["String"]["input"]>;
	serviceId?: InputMaybe<Scalars["String"]["input"]>;
	status?: InputMaybe<DeploymentStatusInput>;
	first?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type ListDeploymentsQuery = {
	deployments: {
		edges: Array<{
			node: {
				id: string;
				projectId: string;
				staticUrl?: string | null;
				status: DeploymentStatus;
				updatedAt: any;
				environment: { id: string; name: string };
				service: { id: string; name: string };
			};
		}>;
	};
};

export type GetDeploymentByIdQueryVariables = Exact<{
	deploymentId: Scalars["String"]["input"];
}>;

export type GetDeploymentByIdQuery = {
	deployment: {
		id: string;
		projectId: string;
		staticUrl?: string | null;
		environment: { id: string; name: string };
		service: { id: string; name: string };
	};
};

export type GetServiceByIdQueryVariables = Exact<{
	id: Scalars["String"]["input"];
}>;

export type GetServiceByIdQuery = {
	service: { id: string; name: string; project: { id: string; name: string } };
};

export type GetEnvironmentByIdQueryVariables = Exact<{
	id: Scalars["String"]["input"];
}>;

export type GetEnvironmentByIdQuery = {
	environment: {
		id: string;
		name: string;
		projectId: string;
		serviceInstances: {
			edges: Array<{ node: { serviceId: string; serviceName: string } }>;
		};
	};
};

export type GetProjectByIdQueryVariables = Exact<{
	id: Scalars["String"]["input"];
}>;

export type GetProjectByIdQuery = { project: { id: string; name: string } };

export type ListTcpProxiesQueryVariables = Exact<{
	environmentId: Scalars["String"]["input"];
	serviceId: Scalars["String"]["input"];
}>;

export type ListTcpProxiesQuery = {
	tcpProxies: Array<{
		id: string;
		domain: string;
		proxyPort: number;
		deletedAt?: any | null;
	}>;
};
