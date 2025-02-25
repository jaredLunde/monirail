import { defineConfig } from "tsup";

import tsconfig from "./tsconfig.json";

export default defineConfig({
	name: "monirail",
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	minify: false,
	target: tsconfig.compilerOptions.target,
	external: ["bun:sqlite"],
});
