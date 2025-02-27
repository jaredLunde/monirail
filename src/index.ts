import { Database } from "bun:sqlite";
import { createClient, createSdk } from "./client";
import { DeploymentStatus } from "./types";
import type {
	GetEnvironmentByIdQuery,
	GetServiceByIdQuery,
	GetServiceByIdQueryVariables,
	ListEnvironmentLogsQuery,
	ListEnvironmentLogsQueryVariables,
	ListHttpLogsQuery,
	ListHttpLogsQueryVariables,
	ListMetricsQuery,
	ListMetricsQueryVariables,
} from "./types";
import { env } from "./env";

const db = new Database(env.SQLITE_DB_FILE);

db.run(`
  CREATE TABLE IF NOT EXISTS monitor_states (
    name TEXT PRIMARY KEY,
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at INTEGER NOT NULL
  );
`);

export const railway = createSdk(
	createClient(env.RAILWAY_API_URL, {
		headers: {
			Authorization: `Bearer ${env.RAILWAY_API_TOKEN}`,
		},
	}),
);

function shouldNotify(name: string, triggered: boolean): boolean {
	const row = db
		.prepare("SELECT triggered FROM monitor_states WHERE name = ?")
		.get(name) as { triggered: 0 | 1 } | undefined;

	if (!row) {
		return triggered;
	}

	return Boolean(row.triggered) !== triggered;
}

const upsertMonitorStateStmt = db.prepare(`
  INSERT INTO monitor_states (name, triggered, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(name) DO UPDATE SET
    triggered = ?,
    updated_at = ?
`);
const MAX_LOG_LIMIT = 5000;

function upsertMonitorState(name: string, triggered: boolean) {
	const now = Date.now();
	return upsertMonitorStateStmt.run(
		name,
		Number(triggered),
		now,
		Number(triggered),
		now,
	);
}

const environmentIdCache = new Map<string, Promise<string>>();

async function getEnvironmentId(maybeEnvironmentId: string) {
	if (isUuidRe.test(maybeEnvironmentId)) {
		return maybeEnvironmentId;
	}

	if (environmentIdCache.has(maybeEnvironmentId)) {
		return environmentIdCache.get(maybeEnvironmentId)!;
	}

	const envIdPromise = new Promise<string>(async (resolve, reject) => {
		let envId: string | undefined;
		let after: string | undefined;

		while (!envId) {
			const envs = await railway.listEnvironments({
				projectId: env.RAILWAY_PROJECT_ID,
				last: 500,
				after,
			});

			if (!envs.environments.edges.length) {
				reject(
					`No environments found for project ${env.RAILWAY_PROJECT_ID} with name: "${maybeEnvironmentId}"`,
				);
			}
			const environment = envs.environments.edges.find(
				(e) => e.node.name === maybeEnvironmentId,
			);
			if (environment) {
				envId = environment.node.id;
			} else if (!envs.environments.pageInfo.hasNextPage) {
				reject(
					`No environments found for project ${env.RAILWAY_PROJECT_ID} with name: "${maybeEnvironmentId}"`,
				);
			} else {
				after = envs.environments.pageInfo.endCursor ?? undefined;
			}
		}

		resolve(envId);
	});

	environmentIdCache.set(maybeEnvironmentId, envIdPromise);
	return envIdPromise;
}

const environmentCache = new Map<string, Promise<GetEnvironmentByIdQuery>>();

async function getEnvironment(maybeEnvironmentId: string) {
	const environmentId = await getEnvironmentId(maybeEnvironmentId);
	if (environmentCache.has(environmentId)) {
		const env = await environmentCache.get(environmentId)!;
		return env.environment;
	}
	const envPromise = railway.getEnvironmentById({ id: environmentId });
	environmentCache.set(environmentId, envPromise);
	const env = await envPromise;
	return env.environment;
}

const isUuidRe =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function monitor(opt: MonitorOptions): Monitor {
	switch (opt.type) {
		case "match":
			const timeWindow = opt.timeWindow ?? 5;

			return {
				type: "match",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				timeWindow,
				async check() {
					const source = await opt.source;
					const environment = source.environment;
					const services = source.services;
					console.log(
						`Checking for matches for environment ${environment.name}`,
					);
					const now = new Date();
					const past = new Date(now.getTime() - timeWindow * 60 * 1000); // last 5 min
					let matches: unknown[] = [];

					if (source.type === "http_logs") {
						matches = (
							await Promise.all(
								services.map(async (service) => {
									const deploys = (
										await railway.listDeployments({
											environmentId: environment.id,
											serviceId: service.serviceId,
											status: {
												in: [
													DeploymentStatus.Removed,
													DeploymentStatus.Crashed,
													DeploymentStatus.Success,
													DeploymentStatus.Sleeping,
												],
											},
											first: 10,
										})
									).deployments.edges
										.filter(
											(deploy) =>
												[
													DeploymentStatus.Success,
													DeploymentStatus.Sleeping,
												].includes(deploy.node.status as any) ||
												new Date(deploy.node.updatedAt) > past,
										)
										.map((deploy) => deploy.node);

									const results = await Promise.all(
										deploys.map((deploy) => {
											return source.fetch({
												filter: opt.filter,
												deploymentId: deploy.id,
												startDate: past.toJSON(),
												endDate: now.toJSON(),
												limit: 1,
											});
										}),
									);
									return results.flatMap((result) => result.httpLogs);
								}),
							)
						).flat();
					} else {
						const results = await source.fetch({
							filter: `( ${services.map((service) => `@service:${service.serviceId}`).join(" OR ")} ) AND ${opt.filter}`,
							environmentId: environment.id,
							startDate: past.toJSON(),
							endDate: now.toJSON(),
							limit: 1,
						});
						matches = results.environmentLogs;
					}

					console.log(
						`Found a match for ${opt.filter} in the last ${timeWindow} minutes`,
					);
					if (matches.length >= 1 && shouldNotify(opt.name, true)) {
						upsertMonitorState(opt.name, true);
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "match",
									monitor: {
										name: this.name,
										description: this.description,
										timeWindow: this.timeWindow,
										source: {
											type: "environment_logs",
											environment,
											services,
										},
									},
									triggered: true,
									timestamp: now,
								}),
							),
						);
					} else if (matches.length < 1 && shouldNotify(opt.name, false)) {
						upsertMonitorState(opt.name, false);
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "match",
									monitor: {
										name: this.name,
										description: this.description,
										timeWindow: this.timeWindow,
										source: {
											type: "environment_logs",
											environment,
											services,
										},
									},
									triggered: false,
									timestamp: now,
								}),
							),
						);
					}
				},
				then(onfulfilled, onrejected) {
					return this.check().then(onfulfilled, onrejected);
				},
			};

		case "threshold":
			const threshold = opt.value ?? 1;
			const timeWindow2 = opt.timeWindow ?? 5;
			return {
				type: "threshold",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				value: opt.value,
				notifyOn: opt.notifyOn,
				notifyOnNoData: opt.notifyOnNoData,
				timeWindow: timeWindow2,
				async check() {
					const source = await opt.source;
					if (source.type !== "metrics" && threshold > MAX_LOG_LIMIT) {
						throw new Error(
							`${opt.name}: threshold cannot be greater than ${MAX_LOG_LIMIT}`,
						);
					}

					// TODO:
					// const now = new Date();
					// const past = new Date(now.getTime() - 5 * 60 * 1000);
					// const values = await opt.source.fetch(past, now);
					// const avg =
					// 	values.reduce((sum, v) => sum + v.value, 0) / values.length;
					// let shouldNotify = false;
					// switch (opt.notifyOn) {
					// 	case "above":
					// 		shouldNotify = avg > opt.value;
					// 		break;
					// 	case "above_or_equal":
					// 		shouldNotify = avg >= opt.value;
					// 		break;
					// 	case "below":
					// 		shouldNotify = avg < opt.value;
					// 		break;
					// 	case "below_or_equal":
					// 		shouldNotify = avg <= opt.value;
					// 		break;
					// }
					// if (shouldNotify || (opt.notifyOnNoData && values.length === 0)) {
					// 	await Promise.allSettled(
					// 		opt.notify.map((n) =>
					// 			n.send({
					// 				type: "threshold",
					// 				monitor: this,
					// 				value: avg,
					// 				threshold: opt.value,
					// 				triggered: true,
					// 				timestamp: now,
					// 			}),
					// 		),
					// 	);
					// }
				},
				then(onfulfilled, onrejected) {
					return this.check().then(onfulfilled, onrejected);
				},
			};

		case "liveliness":
			return {
				type: "liveliness",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				path: opt.path,
				async check() {
					const source = await opt.source;
					const environment = source.environment;
					const services = source.services;

					await Promise.allSettled(
						services.map(async (service) => {
							console.log(
								`Checking liveliness for service "${service.serviceName}" in environment "${environment.name}"`,
							);
							const now = new Date();
							const deploy = await railway.listDeployments({
								environmentId: environment.id,
								serviceId: service.serviceId,
								status: {
									in: [
										DeploymentStatus.Sleeping,
										DeploymentStatus.Success,
										DeploymentStatus.Crashed,
									],
								},
								first: 1,
							});
							const [deployment] = deploy.deployments.edges;
							const url = deployment?.node.staticUrl;
							if (!url) {
								console.error(
									`No static URL for service "${service.serviceName}" in environment "${environment.name}"`,
								);
								return;
							}
							const u = new URL(opt.path ?? "/", `https://${url}`);
							const res = await fetch(u.toString());
							console.log(
								`Service "${service.serviceName}" in environment "${environment.name}" returned status ${res.status} for: ${url}`,
							);
							const triggered = !res.ok;
							if (
								shouldNotify(`${opt.name}/${service.serviceName}`, triggered)
							) {
								upsertMonitorState(opt.name, triggered);
								await Promise.allSettled(
									opt.notify.map((n) =>
										n.send({
											type: "liveliness",
											monitor: {
												name: this.name,
												description: this.description,
												path: this.path,
												source: {
													type: "service",
													environment,
													services,
												},
											},
											triggered: !res.ok,
											timestamp: now,
										}),
									),
								);
							}
						}),
					);
				},
				then(onfulfilled, onrejected) {
					return this.check().then(onfulfilled, onrejected);
				},
			};

		case "custom":
			return {
				type: "custom",
				name: opt.name,
				description: opt.description,
				// @ts-expect-error: not sure
				source: opt.source,
				async check() {
					const source = await opt.source;
					const now = new Date();
					const { triggered, ...data } = await opt.check();

					if (triggered) {
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "custom",
									monitor: {
										name: this.name,
										description: this.description,
										source,
									},
									triggered: true,
									data,
									timestamp: now,
								}),
							),
						);
					}
				},
				then(onfulfilled, onrejected) {
					return this.check().then(onfulfilled, onrejected);
				},
			};
	}
}

export type MonitorOptions = {
	/**
	 * A _unique_ name for the monitor. This is also used as a key to store the state
	 * of the monitor in the database.
	 */
	name: string;
	/**
	 * A description of the monitor.
	 */
	description?: string;
	notify: Notifier[];
} & (
	| /**
	 * Filter for key events and send them to you
	 */
	{
			type: "match";
			source: Promise<SourceEnvironmentLogs | SourceHttpLogs>;
			/**
			 * THe filter to match events against
			 */
			filter: string;
			/**
			 * The duration in minutes to sample events over starting from the current time
			 * @default 5
			 */
			timeWindow?: number;
	  }
	/**
	 * Aggregate event data over time. When the results of a metric cross a threshold,
	 * send alert.
	 */
	| {
			type: "threshold";
			source: Promise<SourceMetrics | SourceEnvironmentLogs | SourceHttpLogs>;
			value: number;
			notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
			/**
			 * Whether to notify when there is no data returned from the source
			 */
			notifyOnNoData: boolean;
			/**
			 * The window of time to aggregate over in minutes
			 * @default 5
			 */
			timeWindow?: number;
	  }
	| {
			type: "liveliness";
			source: Promise<SourceService>;
			/**
			 * The path to check for liveliness
			 * @default "/"
			 */
			path?: string;
	  }
	| {
			type: "custom";
			source: Promise<
				SourceMetrics | SourceEnvironmentLogs | SourceHttpLogs | SourceService
			>;
			check<Data extends Record<string, unknown>>(): Promise<
				Data & { triggered: boolean }
			>;
	  }
);

export type Monitor =
	| MonitorMatch
	| MonitorThreshold
	| MonitorLiveliness
	| MonitorCustom;

type BaseMonitor = {
	name: string;
	description?: string;
	check(): Promise<void>;
	then<TResult1 = void, TResult2 = never>(
		onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2>;
};
export type MonitorMatch = BaseMonitor & {
	type: "match";
	source: Promise<SourceEnvironmentLogs | SourceHttpLogs>;
	timeWindow: number;
};
export type MonitorThreshold = BaseMonitor & {
	type: "threshold";
	source: Promise<SourceMetrics | SourceEnvironmentLogs | SourceHttpLogs>;
	value: number;
	notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
	notifyOnNoData: boolean;
	/**
	 * The window of time to aggregate over in minutes
	 * @default 5
	 */
	timeWindow: number;
};
export type MonitorLiveliness = BaseMonitor & {
	type: "liveliness";
	source: Promise<SourceService>;
	path?: string;
};
export type MonitorCustom = BaseMonitor & {
	type: "custom";
	source: Promise<SourceMetrics | SourceEnvironmentLogs | SourceHttpLogs>;
};

export async function source<O extends SourceOptions>(
	opt: O,
): Promise<
	O["type"] extends "service"
		? SourceService
		: O["type"] extends "environment_logs"
			? SourceEnvironmentLogs
			: O["type"] extends "http_logs"
				? SourceHttpLogs
				: O["type"] extends "metrics"
					? SourceMetrics
					: never
> {
	const environment = await getEnvironment(
		opt.environment ?? env.RAILWAY_ENVIRONMENT_ID,
	);
	const services = (
		"services" in opt
			? (opt.services ?? [])
			: "service" in opt
				? [opt.service]
				: []
	).map((service) => {
		const s = environment.serviceInstances.edges.find(
			(e) => e.node.serviceName === service || e.node.serviceId === service,
		);
		if (!s) {
			throw new Error(
				`No service found for environment ${environment.name} with name: "${service}"`,
			);
		}
		return s.node;
	});

	switch (opt.type) {
		case "service":
			// @ts-expect-error
			return {
				type: "service",
				environment,
				services,
				fetch(
					input: GetServiceByIdQueryVariables,
				): Promise<GetServiceByIdQuery> {
					return railway.getServiceById(input);
				},
			};

		case "environment_logs":
			// @ts-expect-error
			return {
				type: "environment_logs",
				environment,
				services,
				fetch(
					input: ListEnvironmentLogsQueryVariables,
				): Promise<ListEnvironmentLogsQuery> {
					return railway.listEnvironmentLogs(input);
				},
			};

		case "http_logs":
			// @ts-expect-error
			return {
				type: "http_logs",
				environment,
				services,
				fetch(input: ListHttpLogsQueryVariables): Promise<ListHttpLogsQuery> {
					return railway.listHttpLogs(input);
				},
			};

		case "metrics":
			// @ts-expect-error
			return {
				type: "metrics",
				environment,
				services,
				fetch(input: ListMetricsQueryVariables): Promise<ListMetricsQuery> {
					return railway.listMetrics(input);
				},
			};
	}
}

export type SourceOptions = {
	/**
	 * The ID or name of the Railway environment to check. Defaults to the environment you
	 * deployed monirail to.
	 */
	environment?: string;
} & (
	| {
			type: "environment_logs";
			/**
			 * The ID or names of the Railway services to check.
			 */
			services?: string[];
	  }
	| {
			type: "http_logs";
			/**
			 * The ID or name of the Railway service to check.
			 */
			service: string;
	  }
	| {
			type: "metrics";
			/**
			 * The ID or name of the Railway service to check.
			 */
			service: string;
	  }
	| {
			type: "service";
			/**
			 * The ID or name of the Railway service to check.
			 */
			service: string;
	  }
);

type BaseSource = {
	environment: GetEnvironmentByIdQuery["environment"];
	services: GetEnvironmentByIdQuery["environment"]["serviceInstances"]["edges"][number]["node"][];
};
export type SourceEnvironmentLogs = BaseSource & {
	type: "environment_logs";
	fetch(
		input: ListEnvironmentLogsQueryVariables,
	): Promise<ListEnvironmentLogsQuery>;
};
export type SourceHttpLogs = BaseSource & {
	type: "http_logs";
	fetch(input: ListHttpLogsQueryVariables): Promise<ListHttpLogsQuery>;
};
export type SourceMetrics = BaseSource & {
	type: "metrics";
	fetch(input: ListMetricsQueryVariables): Promise<ListMetricsQuery>;
};
export type SourceService = BaseSource & {
	type: "service";
	fetch(input: GetServiceByIdQueryVariables): Promise<GetServiceByIdQuery>;
};

export function notify(opt: NotifyOptions): Notifier {
	const monitorUrl = `https://railway.com/project/${env.RAILWAY_PROJECT_ID}/service/${env.RAILWAY_SERVICE_ID}?environmentId=${env.RAILWAY_ENVIRONMENT_ID}`;
	// function getEnv(payload: NotificationPayload) {
	// 	let serviceName: string;
	// 	let projectName: string;
	// 	let environmentName: string;
	// 	const source = "source" in payload.monitor ? payload.monitor.source : null;
	// 	const environmentId = source?.environmentId ?? env.RAILWAY_ENVIRONMENT_ID;
	// 	const serviceId = source?.serviceId;
	// 	railway.getEnvironmentById({ id: environmentId });
	// }

	switch (opt.type) {
		case "webhook":
			return {
				async send(payload) {
					console.log("Notifying via webhook: ", payload);
					const res = await fetch(opt.url, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});

					if (!res.ok) {
						throw new Error(`Webhook notification failed: ${res.status}`);
					}
				},
			};

		case "discord":
			return {
				async send(payload) {
					console.log("Notifying via Discord: ", payload);
					let color = payload.triggered ? 0xff0000 : 0x00ff00;
					const message: DiscordMessage = {
						content: payload.triggered
							? `🚨 Monitor triggered`
							: `✅ Monitor resolved`,
						username: "monirail",
						avatar_url:
							"https://github.com/jaredLunde/monirail/blob/main/assets/monirail.png?raw=true",
						embeds: [],
					};

					// Green: 0x00ff00,
					switch (payload.type) {
						case "match":
							message.embeds!.push({
								title: payload.monitor.name,
								description: `Found a match`,
								color,
								timestamp: payload.timestamp.toJSON(),
								// fields: [
								// 	{
								// 		name: "Matches",
								// 		value: JSON.stringify(payload.matches, null, 2),
								// 	},
								// ],
							});
							break;

						case "threshold":
							message.embeds!.push({
								title: payload.monitor.name,
								description: payload.triggered
									? `Value ${payload.value} crossed threshold ${payload.threshold}`
									: `Value ${payload.value} is back to normal`,
								color,
								timestamp: payload.timestamp.toJSON(),
								fields: [
									{
										name: "Value",
										value: `${payload.value}`,
									},
									{
										name: "Threshold",
										value: `${payload.threshold}`,
									},
								],
							});
							break;

						case "liveliness":
							const status = payload.triggered ? "down" : "up";
							message.embeds!.push({
								title: payload.monitor.name,
								description: `Service is ${status}`,
								color,
								timestamp: payload.timestamp.toJSON(),
								fields: [
									{
										name: "Status",
										value: `${status}`,
									},
								],
							});
							break;

						case "custom":
							message.embeds!.push({
								title: payload.monitor.name,
								description: `Custom monitor ${payload.triggered ? "triggered" : "resolved"}`,
								color,
								timestamp: payload.timestamp.toJSON(),
								fields: [
									{
										name: "Data",
										value: JSON.stringify(payload.data, null, 2),
									},
								],
							});
							break;
					}

					const res = await retryWithBackoff(() =>
						fetch(opt.webhookUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(message),
						}),
					);

					if (!res.ok) {
						throw new Error(`Discord notification failed: ${res.status}`);
					}
				},
			};

		case "slack":
			return {
				async send(payload) {
					console.log("Notifying via Slack: ", payload);
					const message: SlackMessage = {
						channel: opt.channel,
						blocks: [
							{
								type: "section",
								text: {
									type: "plain_text",
									text: payload.triggered
										? "🚨 Monitor triggered"
										: "✅ Monitor resolved",
								},
							},
						],
						username: "monirail",
						icon_url:
							"https://github.com/jaredLunde/monirail/blob/main/assets/monirail.png?raw=true",
					};

					switch (payload.type) {
						case "match":
							message.blocks!.push({
								type: "section",
								text: {
									type: "mrkdwn",
									text: `*${payload.monitor.name}* found a match`,
								},
							});
							break;

						case "threshold":
							message.blocks!.push({
								type: "section",
								text: {
									type: "mrkdwn",
									text: `*${payload.monitor.name}* ${payload.triggered ? "crossed" : "is back to"} threshold`,
								},
							});
							break;

						case "liveliness":
							const status = payload.triggered ? "down" : "up";
							message.blocks!.push({
								type: "section",
								text: {
									type: "mrkdwn",
									text: `*${payload.monitor.name}* is ${status}`,
								},
							});
							break;

						case "custom":
							message.blocks!.push({
								type: "section",
								text: {
									type: "mrkdwn",
									text: `*${payload.monitor.name}* triggered`,
								},
							});
							break;
					}

					const res = await retryWithBackoff(() =>
						fetch(opt.webhookUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(message),
						}),
					);

					if (!res.ok) {
						throw new Error(`Slack notification failed: ${res.status}`);
					}
				},
			};

		case "pagerduty":
			return {
				async send(payload) {
					console.log("Notifying via PagerDuty: ", payload);
					let summary: string;
					let customDetails: Record<string, unknown> | undefined;
					const triggeredText = payload.triggered ? "triggered" : "resolved";
					switch (payload.type) {
						case "match":
							summary = `${payload.monitor.name} ${triggeredText}. Found ${payload.matches.length} matches.`;
							customDetails = {};
							break;

						case "threshold":
							summary = `${payload.monitor.name} ${triggeredText}. ${payload.value} ${payload.triggered ? "crossed" : "is back to"} threshold ${payload.threshold}.`;
							customDetails = {
								value: payload.value,
								threshold: payload.threshold,
							};
							break;

						case "liveliness":
							const status = payload.triggered ? "down" : "up";
							summary = `${payload.monitor.name} ${triggeredText}. Service is ${status}.`;
							customDetails = { status };
							break;

						case "custom":
							summary = `${payload.monitor.name} triggered.`;
							customDetails = { data: payload.data };
							break;
					}

					const message: PagerDutyEvent = {
						client: opt.client ?? env.RAILWAY_SERVICE_NAME,
						client_url: opt.clientUrl ?? monitorUrl,
						routing_key: opt.routingKey,
						event_action: payload.triggered ? "trigger" : "resolve",
						payload: {
							summary,
							source: "monirail",
							severity: opt.severity,
							timestamp: payload.timestamp.toJSON(),
							component: opt.component,
							group: opt.group ?? env.RAILWAY_PROJECT_NAME,
						},
						custom_details: customDetails,
					};

					if (!opt.component && "source" in payload.monitor) {
						if ("services" in payload.monitor.source) {
							message.payload.component =
								payload.monitor.source.services[0] + "";
							message.links = [
								{
									href: `https://railway.com/project/${env.RAILWAY_PROJECT_ID}/service/${payload.monitor.source.services[0]}?environmentId=${payload.monitor.source.environment}`,
									text: "View Service",
								},
							];
						}
					}

					const res = await retryWithBackoff(() =>
						fetch("https://events.pagerduty.com/v2/enqueue", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(message),
						}),
					);

					if (!res.ok) {
						throw new Error(`PagerDuty notification failed: ${res.status}`);
					}
				},
			};

		case "custom":
			return {
				async send(payload) {
					return retryWithBackoff(() => opt.send(payload));
				},
			};
	}
}

export type NotifyOptions =
	| {
			type: "pagerduty";
			/**
			 * PagerDuty integration key
			 */
			routingKey: string;
			/**
			 * Page severity
			 */
			severity: PagerDutySeverity;
			/**
			 * The component of the incident
			 * @default The service name or volume name of the service that triggered the monitor (if there is one)
			 */
			component?: string;
			/**
			 * The group of the incident.
			 * @default env.RAILWAY_PROJECT_NAME
			 */
			group?: string;
			/**
			 * The name of the client that is triggering the event.
			 * @default env.RAILWAY_SERVICE_NAME
			 */
			client?: string;
			/**
			 * The URL of the client that is triggering the event.
			 * @default https://railway.com/project/${env.RAILWAY_PROJECT_ID}/service/${env.RAILWAY_SERVICE_ID}?environmentId=${env.RAILWAY_ENVIRONMENT_ID}
			 */
			clientUrl?: string;
	  }
	| {
			type: "slack";
			/**
			 * Slack webhook URL
			 */
			webhookUrl: string;
			/**
			 * The channel to send the notification to
			 */
			channel: string;
	  }
	| {
			type: "discord";
			/**
			 * Discord webhook URL
			 */
			webhookUrl: string;
	  }
	| {
			type: "webhook";
			/**
			 * The webhook URL
			 */
			url: string;
	  }
	| {
			type: "custom";
			/**
			 * A function to send your notification
			 * @param payload - The notification payload
			 */
			send: (payload: NotificationPayload) => Promise<void>;
	  };

export type NotificationPayload =
	| {
			type: "match";
			monitor: Pick<MonitorMatch, "name" | "description" | "timeWindow"> & {
				source:
					| Pick<SourceEnvironmentLogs, "type" | "environment" | "services">
					| Pick<SourceHttpLogs, "type" | "environment" | "services">;
			};
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "threshold";
			monitor: Pick<
				MonitorThreshold,
				| "name"
				| "description"
				| "value"
				| "timeWindow"
				| "notifyOn"
				| "notifyOnNoData"
			> & {
				source:
					| Pick<SourceEnvironmentLogs, "type" | "environment" | "services">
					| Pick<SourceHttpLogs, "type" | "environment" | "services">
					| Pick<SourceMetrics, "type" | "environment" | "services">;
			};
			value: number;
			threshold: number;
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "liveliness";
			monitor: Pick<MonitorLiveliness, "name" | "description" | "path"> & {
				source: Pick<SourceService, "type" | "environment" | "services">;
			};
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "custom";
			monitor: Pick<MonitorCustom, "name" | "description"> & {
				source:
					| Pick<SourceEnvironmentLogs, "type" | "environment" | "services">
					| Pick<SourceHttpLogs, "type" | "environment" | "services">
					| Pick<SourceService, "type" | "environment" | "services">
					| Pick<SourceMetrics, "type" | "environment" | "services">;
			};
			triggered: boolean;
			data: Record<string, unknown>;
			timestamp: Date;
	  };

export type Notifier = {
	send(payload: NotificationPayload): Promise<void>;
};

type DiscordMessage = {
	content?: string;
	username?: string;
	avatar_url?: string;
	embeds?: DiscordEmbed[];
};

type DiscordEmbed = {
	title?: string;
	description?: string;
	color?: number;
	fields?: {
		name: string;
		value: string;
		inline?: boolean;
	}[];
	timestamp?: string;
};

type SlackBlock = {
	type: string;
	text?: {
		type: string;
		text: string;
	};
	fields?: Array<{
		type: string;
		text: string;
	}>;
};

type SlackMessage = {
	text?: string;
	blocks?: SlackBlock[];
	username?: string;
	icon_emoji?: string;
	icon_url?: string;
	channel?: string;
};

export type PagerDutySeverity = "critical" | "error" | "warning" | "info";

type PagerDutyEvent = {
	routing_key: string;
	event_action: "trigger" | "resolve";
	payload: {
		summary: string;
		source: string;
		severity: PagerDutySeverity;
		timestamp: string;
		component?: string;
		group?: string;
		class?: string;
	};
	client?: string;
	client_url?: string;
	links?: Array<{
		href: string;
		text: string;
	}>;
	custom_details?: Record<string, unknown>;
};

/**
 * Check the monitors in parallel and log any failures.
 * @param monitors - The monitors to check
 * @returns A promise that resolves when all monitors have been checked
 */
export async function check(monitors: Monitor[]) {
	const results = await Promise.allSettled(monitors.map((m) => m.check()));
	results.forEach((result_1, index) => {
		if (result_1.status === "rejected") {
			console.error(`Monitor ${monitors[index].name} failed:`, result_1.reason);
		}
	});
}

/**
 * Watch the monitors and check them at the given interval.
 * @warn **DO NOT USE THIS IN A CRON**
 * @param interval - The interval in minutes to check the monitors
 * @param monitors - The monitors to check
 * @returns A function to stop watching, for example when you receive a SIGINT
 */
export function watch(
	intervalMinutes: number,
	monitors: Monitor[],
): () => void {
	let running = true;

	(async () => {
		while (running) {
			await check(monitors);
			await new Promise((resolve) =>
				setTimeout(resolve, intervalMinutes * 60 * 1000),
			);
		}
	})();

	return () => {
		running = false;
	};
}

async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: RetryWithBackoffOptions = {},
): Promise<T> {
	const {
		maxRetries = 10,
		initialDelay = 1000,
		maxDelay = 30000,
		jitterFactor = 0.25,
	} = options;

	let retries = 0;

	while (true) {
		try {
			return await fn();
		} catch (error) {
			if (retries >= maxRetries) {
				throw error;
			}

			// Calculate delay with exponential backoff
			const exponentialDelay = initialDelay * Math.pow(2, retries);
			const cappedDelay = Math.min(exponentialDelay, maxDelay);

			// Add random jitter
			const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);
			const finalDelay = cappedDelay + jitter;

			await new Promise((resolve) => setTimeout(resolve, finalDelay));
			retries++;
		}
	}
}

type RetryWithBackoffOptions = {
	maxRetries?: number;
	initialDelay?: number;
	maxDelay?: number;
	jitterFactor?: number;
};
