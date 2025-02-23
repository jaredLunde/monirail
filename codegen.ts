import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "https://backboard.railway.app/graphql/v2",
	documents: ["./src/**/*.graphql"],
	generates: {
		"./src/sdk.ts": {
			plugins: [
				"typescript",
				"typescript-operations",
				"typescript-graphql-request",
			],
			config: {
				documentMode: "string",
			},
		},
	},
};

export default config;
