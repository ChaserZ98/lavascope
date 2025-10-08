import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
// import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import macrosPlugin from "vite-plugin-babel-macros";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        TanStackRouterVite({ autoCodeSplitting: true }),
        react({
            babel: {
                presets: ["jotai/babel/preset"],
                plugins: ["@lingui/babel-plugin-lingui-macro"],
            },
        }),
        tailwindcss(),
        // react(),
        tsconfigPaths(),
        lingui(),
        // macrosPlugin(),
        // legacy(),
    ],
    // resolve: {
    //     alias: {
    //         "@": "/src",
    //         "@css": "/src/assets/css",
    //         "@svg": "/src/assets/svg",
    //         "@img": "/src/assets/img",
    //         "@locales": "/src/locales",
    //         "@store": "/src/store",
    //     },
    // },

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
