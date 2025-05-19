import { defineConfig } from "vite";
import builtins from "builtin-modules";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import fs from "fs/promises";
import path from "path";
import postcss from "postcss";

async function processCSS(outDir) {
    const css = await fs.readFile("src/index.css", "utf8");
    const result = await postcss([tailwindcss, autoprefixer]).process(css, {
        from: "src/index.css",
        to: path.join(outDir, "styles.css"),
    });
    await fs.writeFile(path.join(outDir, "styles.css"), result.css);
}

async function copyManifest(outDir) {
    const source = path.resolve(__dirname, "manifest.json");
    const destination = path.resolve(outDir, "manifest.json");
    await fs.copyFile(source, destination);
}

export default defineConfig({
    build: {
        outDir: path.resolve(__dirname, "build"),
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
            },
        },
        target: "es2018",
        sourcemap: false,
        minify: true,
    },
    plugins: [
        {
            name: "process-css",
            apply: "build",
            async writeBundle() {
                const outDir = path.resolve(__dirname, "build");
                await processCSS(outDir);
            },
        },
        {
            name: "copy-manifest",
            apply: "build",
            async closeBundle() {
                const outDir = path.resolve(__dirname, "build");
                await copyManifest(outDir);
            },
        },
    ],
    resolve: {
        alias: {
            components: path.resolve(__dirname, "./src/components"),
            hooks: path.resolve(__dirname, "./src/hooks"),
            utils: path.resolve(__dirname, "./src/utils"),
            store: path.resolve(__dirname, "./src/store"),
        },
    },
});
