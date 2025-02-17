import { lingui } from "@lingui/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import legacy from "@vitejs/plugin-legacy";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [
        TanStackRouterVite({ autoCodeSplitting: true }),
        viteReact({
            babel: {
                presets: ["jotai/babel/preset"],
                plugins: ["@lingui/babel-plugin-lingui-macro"],
            },
        }),
        lingui(),
        legacy(),
    ],
    resolve: {
        alias: {
            "@": "/src",
            "@css": "/src/assets/css",
            "@svg": "/src/assets/svg",
            "@img": "/src/assets/img",
            "@locales": "/src/locales",
        },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            // 3. tell vite to ignore watching `src-tauri`
            ignored: ["**/src-tauri/**"],
        },
    },
}));
