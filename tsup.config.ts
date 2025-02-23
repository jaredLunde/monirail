import { defineConfig } from "tsup";

import tsconfig from "./tsconfig.json";

export default defineConfig({
	name: "monirail",
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	minify: true,
	external: ["bun:sqlite", "bun"],
	target: tsconfig.compilerOptions.target,
});
