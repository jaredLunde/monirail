export class TypedDocumentString<TResult, TVariables> extends String {
	__result!: TResult;
	__variables!: TVariables;
	constructor(private value: string) {
		super(value);
	}
	toString(): string {
		return this.value;
	}
}

export const ListDeploymentLogs = new TypedDocumentString(`
    query listDeploymentLogs($deploymentId: String!, $startDate: DateTime!, $endDate: DateTime!, $filter: String!, $limit: Int) {
  deploymentLogs(
    deploymentId: $deploymentId
    endDate: $endDate
    filter: $filter
    limit: $limit
    startDate: $startDate
  ) {
    timestamp
  }
}
    `);
export const ListEnvironments = new TypedDocumentString(`
    query listEnvironments($projectId: String!, $after: String, $last: Int) {
  environments(projectId: $projectId, after: $after, last: $last) {
    edges {
      node {
        id
        name
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `);
export const ListEnvironmentLogs = new TypedDocumentString(`
    query listEnvironmentLogs($environmentId: String!, $startDate: String!, $endDate: String!, $filter: String!, $limit: Int) {
  environmentLogs(
    environmentId: $environmentId
    filter: $filter
    anchorDate: $endDate
    afterDate: $endDate
    beforeDate: $startDate
    beforeLimit: $limit
    afterLimit: 0
  ) {
    timestamp
  }
}
    `);
export const ListHttpLogs = new TypedDocumentString(`
    query listHTTPLogs($deploymentId: String!, $startDate: String!, $endDate: String!, $filter: String!, $limit: Int) {
  httpLogs(
    deploymentId: $deploymentId
    filter: $filter
    anchorDate: $endDate
    afterDate: $endDate
    beforeDate: $startDate
    beforeLimit: $limit
    startDate: $startDate
    endDate: $endDate
    afterLimit: 0
    limit: $limit
  ) {
    totalDuration
    timestamp
  }
}
    `);
export const ListMetrics = new TypedDocumentString(`
    query listMetrics($environmentId: String!, $serviceId: String, $volumeId: String, $measurements: [MetricMeasurement!]!, $startDate: DateTime!, $endDate: DateTime!, $groupBy: [MetricTag!]) {
  metrics(
    environmentId: $environmentId
    serviceId: $serviceId
    volumeId: $volumeId
    measurements: $measurements
    startDate: $startDate
    endDate: $endDate
    groupBy: $groupBy
    includeDeleted: false
    sampleRateSeconds: 10
  ) {
    measurement
    values {
      value
      ts
    }
  }
}
    `);
export const ListDeployments = new TypedDocumentString(`
    query listDeployments($projectId: String, $environmentId: String, $serviceId: String, $status: DeploymentStatusInput, $first: Int) {
  deployments(
    input: {projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId, status: $status}
    first: $first
  ) {
    edges {
      node {
        id
        environment {
          id
          name
        }
        service {
          id
          name
        }
        projectId
        staticUrl
        status
        updatedAt
      }
    }
  }
}
    `);
export const GetDeploymentById = new TypedDocumentString(`
    query getDeploymentById($deploymentId: String!) {
  deployment(id: $deploymentId) {
    id
    environment {
      id
      name
    }
    service {
      id
      name
    }
    projectId
    staticUrl
  }
}
    `);
export const GetServiceById = new TypedDocumentString(`
    query getServiceById($id: String!) {
  service(id: $id) {
    id
    name
    project {
      id
      name
    }
  }
}
    `);
export const GetEnvironmentById = new TypedDocumentString(`
    query getEnvironmentById($id: String!) {
  environment(id: $id) {
    id
    name
    projectId
    serviceInstances {
      edges {
        node {
          serviceId
          serviceName
        }
      }
    }
  }
}
    `);
export const GetProjectById = new TypedDocumentString(`
    query getProjectById($id: String!) {
  project(id: $id) {
    id
    name
  }
}
    `);
export const ListTcpProxies = new TypedDocumentString(`
    query listTcpProxies($environmentId: String!, $serviceId: String!) {
  tcpProxies(environmentId: $environmentId, serviceId: $serviceId) {
    id
    domain
    proxyPort
    deletedAt
  }
}
    `);
