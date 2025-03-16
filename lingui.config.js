import { defineConfig } from "@lingui/cli";

export default defineConfig({
    sourceLocale: "en",
    locales: ["en", "zh", "zh-Hant"],
    catalogs: [
        {
            path: "<rootDir>/src/locales/{locale}",
            include: ["src"],
        },
    ],
    orderBy: "origin",
    compileNamespace: "ts",
});
