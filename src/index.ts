import { GraphQLClient } from "graphql-request";
import { Database } from "bun:sqlite";
import {
	getSdk,
	GetServiceByIdQuery,
	GetServiceByIdQueryVariables,
	ListDeploymentLogsQuery,
	ListDeploymentLogsQueryVariables,
	ListHttpLogsQuery,
	ListHttpLogsQueryVariables,
	ListMetricsQuery,
	ListMetricsQueryVariables,
} from "./sdk";
import { env } from "./env";

const graphqlClient = new GraphQLClient(env.RAILWAY_API_URL, {
	headers: {
		"Project-Access-Token:": env.RAILWAY_PROJECT_TOKEN,
	},
});

const db = new Database(env.SQLITE_DB_FILE);

db.run(`
  CREATE TABLE IF NOT EXISTS monitor_states (
    name TEXT PRIMARY KEY,
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at INTEGER NOT NULL
  );
`);

export const railway = getSdk(graphqlClient);

function shouldNotify(name: string, triggered: boolean): boolean {
	const row = db
		.prepare("SELECT triggered FROM monitor_states WHERE name = ?")
		.get(name) as { triggered: boolean } | undefined;

	if (!row) {
		return triggered;
	}

	if (row.triggered !== triggered) {
		return true;
	}

	return false;
}

function upsertMonitorState(name: string, triggered: boolean) {
	const now = Date.now();
	return db
		.prepare(`
              INSERT INTO monitor_states (name, triggered, updated_at)
              VALUES (?, ?, ?)
              ON CONFLICT(name) DO UPDATE SET
                triggered = ?,
                updated_at = ?
            `)
		.run(name, true, now, true, now);
}

export function monitor(opt: MonitorOptions): Monitor {
	switch (opt.type) {
		case "match":
			return {
				type: "match",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				threshold: opt.threshold,
				async check() {
					const now = new Date();
					const past = new Date(now.getTime() - 5 * 60 * 1000); // last 5 min

					const matches = await opt.source.fetch(past, now);

					if (matches.length >= (opt.threshold ?? 1)) {
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "match",
									monitor: this,
									matches,
									triggered: true,
									timestamp: now,
								}),
							),
						);
					}
				},
			};

		case "threshold":
			return {
				type: "threshold",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				value: opt.value,
				notifyOn: opt.notifyOn,
				notifyOnNoData: opt.notifyOnNoData,
				windowMinutes: opt.windowMinutes,
				async check() {
					const now = new Date();
					const past = new Date(now.getTime() - 5 * 60 * 1000);

					const values = await opt.source.fetch(past, now);
					const avg =
						values.reduce((sum, v) => sum + v.value, 0) / values.length;

					let shouldNotify = false;
					switch (opt.notifyOn) {
						case "above":
							shouldNotify = avg > opt.value;
							break;
						case "above_or_equal":
							shouldNotify = avg >= opt.value;
							break;
						case "below":
							shouldNotify = avg < opt.value;
							break;
						case "below_or_equal":
							shouldNotify = avg <= opt.value;
							break;
					}

					if (shouldNotify || (opt.notifyOnNoData && values.length === 0)) {
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "threshold",
									monitor: this,
									value: avg,
									threshold: opt.value,
									triggered: true,
									timestamp: now,
								}),
							),
						);
					}
				},
			};

		case "liveliness":
			return {
				type: "liveliness",
				name: opt.name,
				description: opt.description,
				source: opt.source,
				async check() {
					const now = new Date();
					const res = await fetch("");

					if (!res.ok) {
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "liveliness",
									monitor: this,
									triggered: true,
									timestamp: now,
								}),
							),
						);
					}
				},
			};

		case "custom":
			return {
				type: "custom",
				name: opt.name,
				description: opt.description,
				async check() {
					const now = new Date();
					const { triggered, ...data } = await opt.check();

					if (triggered) {
						await Promise.allSettled(
							opt.notify.map((n) =>
								n.send({
									type: "custom",
									monitor: this,
									triggered: true,
									data,
									timestamp: now,
								}),
							),
						);
					}
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
			source: SourceDeploymentLogs;
			/**
			 * @default 1
			 */
			threshold?: number;
	  }
	/**
	 * Aggregate event data over time. When the results of the aggregation cross a threshold,
	 * send alert.
	 */
	| {
			type: "threshold";
			source: SourceMetrics | SourceHttpLogs;
			value: number;
			notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
			notifyOnNoData: boolean;
			/**
			 * The window of time to aggregate over in minutes
			 * @default 5
			 */
			windowMinutes: number;
	  }
	| {
			type: "liveliness";
			source: SourceService;
			check<Response>(): Promise<Response>;
	  }
	| {
			type: "custom";
			check<Data extends Record<string, unknown>>(): Promise<
				Data & { triggered: boolean }
			>;
	  }
	// TODO: need to store event history for this and I don't want to do the whole sqlite thing yet
	// | {
	// 		type: "anomaly";
	//   }
);

export type Monitor =
	| MonitorMatch
	| MonitorThreshold
	| MonitorLiveliness
	| MonitorCustom;

type BaseMonitor = {
	name: string;
	description?: string;
	check: () => Promise<void>;
};
export type MonitorMatch = BaseMonitor & {
	type: "match";
	source: SourceDeploymentLogs;
	threshold?: number;
};
export type MonitorThreshold = BaseMonitor & {
	type: "threshold";
	source: SourceMetrics | SourceHttpLogs;
	value: number;
	notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
	notifyOnNoData: boolean;
	/**
	 * The window of time to aggregate over in minutes
	 * @default 5
	 */
	windowMinutes: number;
};
export type MonitorLiveliness = BaseMonitor & {
	type: "liveliness";
	source: SourceService;
};
export type MonitorCustom = BaseMonitor & {
	type: "custom";
};

export function source(opt: SourceOptions) {
	return {} as SourceDeploymentLogs;
}

export type SourceOptions = {
	/**
	 * The ID of the Railway environment to check. Defaults to the environment you
	 * deployed monirail to.
	 */
	environmentId?: string;
	/**
	 * The ID of the Railway service to check.
	 */
	serviceId?: string;
} & (
	| {
			from: "deployment_logs";
	  }
	| {
			from: "http_logs";
	  }
	| {
			from: "metrics";
	  }
	| {
			from: "service";
	  }
);

type BaseSource = {
	environmentId?: string;
	serviceId?: string;
};
export type SourceDeploymentLogs = BaseSource & {
	fetch(
		input: ListDeploymentLogsQueryVariables,
	): Promise<ListDeploymentLogsQuery>;
};
export type SourceHttpLogs = BaseSource & {
	fetch(input: ListHttpLogsQueryVariables): Promise<ListHttpLogsQuery>;
};
export type SourceMetrics = BaseSource & {
	fetch(input: ListMetricsQueryVariables): Promise<ListMetricsQuery>;
};
export type SourceService = BaseSource & {
	fetch(input: GetServiceByIdQueryVariables): Promise<GetServiceByIdQuery>;
};

export function notify(opt: NotifyOptions): Notifier {
	const monitorUrl = `https://railway.com/project/${env.RAILWAY_PROJECT_ID}/service/${env.RAILWAY_SERVICE_ID}?environmentId=${env.RAILWAY_ENVIRONMENT_ID}`;
	function getEnv(payload: NotificationPayload) {
		let serviceName: string;
		let projectName: string;
		let environmentName: string;
		const source = "source" in payload.monitor ? payload.monitor.source : null;
		const environmentId = source?.environmentId ?? env.RAILWAY_ENVIRONMENT_ID;
		const serviceId = source?.serviceId;
		railway.getEnvironmentById({ id: environmentId });
	}
	switch (opt.type) {
		case "webhook":
			return {
				async send(payload) {
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
								description: `Found ${payload.matches.length} matches`,
								color,
								timestamp: payload.timestamp.toISOString(),
								fields: [
									{
										name: "Matches",
										value: JSON.stringify(payload.matches, null, 2),
									},
								],
							});
							break;

						case "threshold":
							message.embeds!.push({
								title: payload.monitor.name,
								description: payload.triggered
									? `Value ${payload.value} crossed threshold ${payload.threshold}`
									: `Value ${payload.value} is back to normal`,
								color,
								timestamp: payload.timestamp.toISOString(),
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
								timestamp: payload.timestamp.toISOString(),
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
								timestamp: payload.timestamp.toISOString(),
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
									text: `*${payload.monitor.name}* found ${payload.matches.length} matches`,
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
					let summary: string;
					let customDetails: Record<string, unknown> | undefined;
					const triggeredText = payload.triggered ? "triggered" : "resolved";
					switch (payload.type) {
						case "match":
							summary = `${payload.monitor.name} ${triggeredText}. Found ${payload.matches.length} matches.`;
							customDetails = {
								matches: payload.matches,
							};
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
							timestamp: payload.timestamp.toISOString(),
							component: opt.component,
							group: opt.group ?? env.RAILWAY_PROJECT_NAME,
						},
						custom_details: customDetails,
					};

					if (!opt.component && "source" in payload.monitor) {
						if ("serviceId" in payload.monitor.source) {
							message.payload.component = payload.monitor.source.serviceId + "";
							message.links = [
								{
									href: `https://railway.com/project/${env.RAILWAY_PROJECT_ID}/service/${payload.monitor.source.serviceId}?environmentId=${payload.monitor.source.environmentId ?? env.RAILWAY_ENVIRONMENT_ID}`,
									text: "View Service",
								},
							];
						}
					}

					const res = await retryWithBackoff(() =>
						fetch("https://events.pagerduty.com/v2/enqueue", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								routing_key: opt.routingKey,
								event_action: "trigger",
								payload: message,
							}),
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
			webhookUrl: string;
			channel: string;
	  }
	| {
			type: "discord";
			webhookUrl: string;
	  }
	| {
			type: "webhook";
			url: string;
	  }
	| {
			type: "custom";
			send: (payload: NotificationPayload) => Promise<void>;
	  };

export type NotificationPayload =
	| {
			type: "match";
			monitor: MonitorMatch;
			matches: unknown[];
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "threshold";
			monitor: MonitorThreshold;
			value: number;
			threshold: number;
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "liveliness";
			monitor: MonitorLiveliness;
			triggered: boolean;
			timestamp: Date;
	  }
	| {
			type: "custom";
			monitor: MonitorCustom;
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
			const results = await Promise.allSettled(monitors.map((m) => m.check()));

			// Log any failures
			results.forEach((result, i) => {
				if (result.status === "rejected") {
					console.error(`Monitor ${i} check failed:`, result.reason);
				}
			});

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
