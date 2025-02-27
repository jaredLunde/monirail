import {
	ListDeployments,
	ListEnvironments,
	ListEnvironmentLogs,
	ListMetrics,
	ListHttpLogs,
	ListTcpProxies,
	GetEnvironmentById,
	GetProjectById,
	GetServiceById,
	TypedDocumentString,
} from "./documents";
import type {
	ListDeploymentsQuery,
	ListDeploymentsQueryVariables,
	ListEnvironmentsQuery,
	ListEnvironmentsQueryVariables,
	ListEnvironmentLogsQuery,
	ListEnvironmentLogsQueryVariables,
	ListMetricsQuery,
	ListMetricsQueryVariables,
	ListHttpLogsQuery,
	ListHttpLogsQueryVariables,
	ListTcpProxiesQuery,
	ListTcpProxiesQueryVariables,
	GetProjectByIdQuery,
	GetProjectByIdQueryVariables,
	GetEnvironmentByIdQuery,
	GetEnvironmentByIdQueryVariables,
	GetServiceByIdQuery,
	GetServiceByIdQueryVariables,
} from "./types";

export type GraphQLResponse<T> = {
	data?: T;
	errors?: Array<{
		message: string;
		locations?: any[];
		path?: any[];
		extensions?: any;
	}>;
};

export function createClient(url: string | URL, init: RequestInit = {}) {
	return async function query<TResult = any, TVariables = Record<string, any>>(
		query: TypedDocumentString<any, any>,
		variables: TVariables = {} as TVariables,
	): Promise<TResult> {
		const res = await fetch(url, {
			...init,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...init.headers,
			},
			body: JSON.stringify({ query, variables }),
		});
		const data = await (res.json() as Promise<GraphQLResponse<TResult>>);
		if (data.errors) throw new Error(data.errors[0].message);
		if (!data.data) throw new Error("No data returned from GraphQL request");
		return data.data;
	};
}

export function createSdk(client: ReturnType<typeof createClient>) {
	return {
		listDeployments(variables: ListDeploymentsQueryVariables) {
			return client<ListDeploymentsQuery>(ListDeployments, variables);
		},
		listEnvironments(variables: ListEnvironmentsQueryVariables) {
			return client<ListEnvironmentsQuery>(ListEnvironments, variables);
		},
		listMetrics(variables: ListMetricsQueryVariables) {
			return client<ListMetricsQuery>(ListMetrics, variables);
		},
		listEnvironmentLogs(variables: ListEnvironmentLogsQueryVariables) {
			return client<ListEnvironmentLogsQuery>(ListEnvironmentLogs, variables);
		},
		listHttpLogs(variables: ListHttpLogsQueryVariables) {
			return client<ListHttpLogsQuery>(ListHttpLogs, variables);
		},
		listTcpProxies(variables: ListTcpProxiesQueryVariables) {
			return client<ListTcpProxiesQuery>(ListTcpProxies, variables);
		},
		getProjectById(variables: GetProjectByIdQueryVariables) {
			return client<GetProjectByIdQuery>(GetProjectById, variables);
		},
		getEnvironmentById(variables: GetEnvironmentByIdQueryVariables) {
			return client<GetEnvironmentByIdQuery>(GetEnvironmentById, variables);
		},
		getServiceById(variables: GetServiceByIdQueryVariables) {
			return client<GetServiceByIdQuery>(GetServiceById, variables);
		},
	};
}
