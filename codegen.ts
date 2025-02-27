import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "https://backboard.railway.app/graphql/v2",
	documents: ["./src/*.graphql"],
	generates: {
		"./src/types.ts": {
			plugins: ["typescript", "typescript-operations"],
			config: {
				onlyOperationTypes: true,
				skipTypename: true,
				preResolveTypes: true,
				dedupeFragments: true,
				inlineFragmentTypes: "inline",
				enumsAsTypes: false,
				enumsAsConst: true,
			},
		},
		"./src/documents.ts": {
			plugins: ["add", "typescript-document-nodes"],
			config: {
				importTypes: true,
				noExport: false,
				documentMode: "string",
				addDocumentNodeToTypes: false,
				content: `export class TypedDocumentString<TResult, TVariables> extends String {
  __result!: TResult;
  __variables!: TVariables;
  constructor(private value: string) {
    super(value);
  }
  toString(): string {
    return this.value;
  }
}`,
			},
		},
	},
};

export default config;
