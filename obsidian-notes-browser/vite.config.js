import { defineConfig } from "vite";
import builtins from "builtin-modules";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import fs from "fs/promises";
import path from "path";
import postcss from "postcss";

const prod = process.env.NODE_ENV === "production";

async function processCSS() {
	const css = await fs.readFile("src/index.css", "utf8");
	const result = await postcss([tailwindcss, autoprefixer]).process(css, {
		from: "src/index.css",
		to: "styles.css",
	});
	await fs.writeFile("styles.css", result.css);
	if (result.map) {
		await fs.writeFile("styles.css.map", result.map.toString());
	}
}

export default defineConfig({
	build: {
		outDir: path.resolve(__dirname),
		lib: {
			entry: path.resolve(__dirname, "main.ts"),
			formats: ["cjs"],
			fileName: "main",
		},
		rollupOptions: {
			external: [
				"obsidian",
				"electron",
				"@codemirror/autocomplete",
				"@codemirror/collab",
				"@codemirror/commands",
				"@codemirror/language",
				"@codemirror/lint",
				"@codemirror/search",
				"@codemirror/state",
				"@codemirror/view",
				"@lezer/common",
				"@lezer/highlight",
				"@lezer/lr",
				...builtins,
			],

			output: {
				entryFileNames: "main.js",
				sourcemap: prod ? false : "inline",
			},
		},
		target: "es2018",
		sourcemap: prod ? false : "inline",
		minify: false,
	},
	plugins: [
		{
			name: "process-css",
			apply: "build",
			async buildStart() {
				await processCSS();
			},
		},
	],

	resolve: {
		alias: {
			"components": path.resolve(__dirname, "./src/components"),
			"hooks": path.resolve(__dirname, "./src/hooks"),
			"utils": path.resolve(__dirname, "./src/utils"),
			"store": path.resolve(__dirname, "./src/store"),
		}
	}
});
