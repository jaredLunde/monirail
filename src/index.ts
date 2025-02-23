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
	return {};
}

type MonitorOptions = {
	name: string;
	description?: string;
	notify: Notifier[];
} & (
	| {
			type: "match";
			source: SourceDeploymentLogs;
			/**
			 * @default 1
			 */
			threshold?: number;
	  }
	| {
			type: "threshold";
			value: number;
			source: SourceMetrics | SourceHttpLogs;
			notifyOn: "above" | "above_or_equal" | "below" | "below_or_equal";
			notifyOnNoData: boolean;
	  }
	// TODO: need to store event history for this and I don't want to do the whole sqlite thing yet
	// | {
	// 		type: "anomaly";
	//   }
);

type Monitor = {};

export function source(opt: SourceOptions) {
	return {} as SourceDeploymentLogs;
}

type SourceOptions =
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
type SourceDeploymentLogs = {};
type SourceHttpLogs = {};
type SourceMetrics = {};

export function notify(opt: NotifyOptions): Notifier {
	return {};
}

export type NotifyOptions =
	| {
			type: "pagerduty";
	  }
	| {
			type: "slack";
	  }
	| {
			type: "discord";
	  }
	| {
			type: "webhook";
	  };

export type Notifier = {};

export function watch(interval: number, monitors: Monitor[]) {}
