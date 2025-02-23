import { GraphQLClient } from "graphql-request";
import { getSdk } from "./sdk";
import { env } from "./env";

const graphqlClient = new GraphQLClient(env.RAILWAY_API_URL, {
	headers: {
		"Project-Access-Token:": env.RAILWAY_PROJECT_TOKEN,
	},
});

export const railway = getSdk(graphqlClient);

export function monitor(opt: MonitorOptions): Monitor {
	switch (opt.type) {
		case "match":
			if (opt.type === "match") {
				return {
					async check() {
						const now = new Date();
						const past = new Date(now.getTime() - 5 * 60 * 1000); // last 5 min

						// TODO: implement source.fetch() to get the data
						const matches = await opt.source.fetch(past, now);

						if (matches.length >= (opt.threshold ?? 1)) {
							await Promise.all(
								opt.notify.map((n) =>
									n.send({
										name: opt.name,
										description: opt.description,
										matches,
									}),
								),
							);
						}
					},
				};
			}

		case "threshold":
			return {
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
						await Promise.all(
							opt.notify.map((n) =>
								n.send({
									name: opt.name,
									description: opt.description,
									value: avg,
									threshold: opt.value,
								}),
							),
						);
					}
				},
			};
	}
}

export type MonitorOptions = {
	name: string;
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
	 * aggregate event data over time. When the results of the aggregation cross a threshold,
	 * send alert
	 */
	| {
			type: "threshold";
			source: SourceMetrics | SourceHttpLogs;
			value: number;
			notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
			notifyOnNoData: boolean;
	  }
	| {
			type: "custom";
			check<Data>(): Promise<Data>;
	  }
	// TODO: need to store event history for this and I don't want to do the whole sqlite thing yet
	// | {
	// 		type: "anomaly";
	//   }
);

export type Monitor = MonitorMatch | MonitorThreshold;
type BaseMonitor = {
	name: string;
	description?: string;
	check: () => Promise<void>;
	notify: Notifier[];
};
export type MonitorMatch = BaseMonitor & {
	type: "match";
	source: SourceDeploymentLogs;
};
export type MonitorThreshold = BaseMonitor & {
	type: "threshold";
	source: SourceMetrics | SourceHttpLogs;
};
export type MonitorCustom = BaseMonitor & {
	type: "custom";
};

export function source(opt: SourceOptions) {
	return {} as SourceDeploymentLogs;
}

export type SourceOptions =
	| {
			serviceId?: string;
			from: "deployment_logs";
	  }
	| {
			serviceId?: string;
			from: "http_logs";
	  }
	| (({ volumeId?: string } | { serviceId?: string }) & {
			from: "metrics";
	  });
export type SourceDeploymentLogs = {};
export type SourceHttpLogs = {};
export type SourceMetrics = {};

export function notify(opt: NotifyOptions): Notifier {
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

		case "slack":
			return {
				async send(payload) {
					// Could use @slack/webhook package but let's keep it simple
					const text =
						payload.type === "match"
							? `🚨 *${payload.name}*\n${payload.description || ""}\nFound ${payload.matches.length} matches`
							: `🚨 *${payload.name}*\n${payload.description || ""}\nValue ${payload.value} crossed threshold ${payload.threshold}`;

					const res = await retryWithBackoff(() =>
						fetch(opt.webhookUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ text }),
						}),
					);

					if (!res.ok) {
						throw new Error(`Slack notification failed: ${res.status}`);
					}
				},
			};

		case "discord":
			return {
				async send(payload) {
					const message: DiscordMessage = {
						content: `🚨 Monitor triggered!`,
						username: "monirail",
						avatar_url: "https://railway.app/favicon.png",
						embeds: [
							// {
							// 	title: "Important Update",
							// 	description: "Something interesting happened!",
							// 	color: 0x00ff00, // Green color
							// 	timestamp: new Date().toISOString(),
							// 	fields: [
							// 		{
							// 			name: "Status",
							// 			value: "Success",
							// 			inline: true,
							// 		},
							// 		{
							// 			name: "Environment",
							// 			value: "Production",
							// 			inline: true,
							// 		},
							// 	],
							// },
						],
					};

					switch (payload.type) {
						case "match":
							message.embeds!.push({
								title: payload.monitor.name,
								description: payload.monitor.description,
								color: 0xff0000, // Red color
								timestamp: payload.timestamp.toISOString(),
								fields: [
									{
										name: "Matches",
										value: JSON.stringify(payload.matches, null, 2),
									},
								],
							});
							break;
					}
					const content =
						payload.type === "match"
							? `🚨 **${payload.name}**\n${payload.description || ""}\nFound ${payload.matches.length} matches`
							: `🚨 **${payload.name}**\n${payload.description || ""}\nValue ${payload.value} crossed threshold ${payload.threshold}`;

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

		case "pagerduty":
			return {
				async send(payload) {
					const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							routing_key: opt.routingKey,
							event_action: "trigger",
							payload: {
								summary: payload.name,
								source: "railway-monitor",
								severity: "critical",
								custom_details:
									payload.type === "match"
										? { matches: payload.matches }
										: { value: payload.value, threshold: payload.threshold },
							},
						}),
					});

					if (!res.ok) {
						throw new Error(`PagerDuty notification failed: ${res.status}`);
					}
				},
			};

		case "custom":
			return opt;
	}
}

export type NotifyOptions =
	| {
			type: "pagerduty";
			routingKey: string;
	  }
	| {
			type: "slack";
			webhookUrl: string;
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
			timestamp: Date;
	  }
	| {
			type: "threshold";
			monitor: MonitorThreshold;
			value: number;
			threshold: number;
			timestamp: Date;
	  }
	| { type: "custom"; monitor: MonitorCustom; data: unknown; timestamp: Date };

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

export function watch(interval: number, monitors: Monitor[]) {}

export async function retryWithBackoff<T>(
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

export type RetryWithBackoffOptions = {
	maxRetries?: number;
	initialDelay?: number;
	maxDelay?: number;
	jitterFactor?: number;
};
