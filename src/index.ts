import Database from "bun:sqlite";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "./sdk";
import { env } from "./env";

const db = new Database(env.SQLITE_DB_PATH);
const graphqlClient = new GraphQLClient(env.RAILWAY_API_URL, {
	headers: {
		"Project-Access-Token:": env.RAILWAY_PROJECT_TOKEN,
	},
});

export const railway = getSdk(graphqlClient);

export function monitor(opt: MonitorOptions) {}

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
	// TODO: be fancy. need to store event history for this.
	// | {
	// 		type: "anomaly";
	//   }
);

export function source(opt: SourceOptions) {}

type SourceOptions =
	| {
			type: "deployment_logs";
	  }
	| {
			type: "http_logs";
	  }
	| {
			type: "metrics";
	  };
type SourceDeploymentLogs = {};
type SourceHttpLogs = {};
type SourceMetrics = {};

export function notify(opt: NotifyOptions) {}

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
