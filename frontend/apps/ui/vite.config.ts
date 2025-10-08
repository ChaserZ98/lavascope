import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
// import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
// import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
// import macrosPlugin from "vite-plugin-babel-macros";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({ autoCodeSplitting: true, target: "react" }),
        react({
            babel: {
                presets: ["jotai/babel/preset"],
                plugins: ["@lingui/babel-plugin-lingui-macro"],
            },
        }),
        visualizer(),
        tailwindcss(),
        tsconfigPaths(),
        lingui(),
        // legacy(),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            // 3. tell vite to ignore watching `backend`
            ignored: ["**/backend/**"],
        },
    },
});
