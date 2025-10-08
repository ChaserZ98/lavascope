import { defineConfig } from "@lingui/cli";

export default defineConfig({
    sourceLocale: "en",
    locales: ["en", "zh", "zh-Hant"],
    rootDir: "../../../",
    catalogs: [
        {
            path: "<rootDir>/frontend/libs/i18n/locales/{locale}",
            include: ["<rootDir>/frontend/apps/**", "<rootDir>/frontend/libs/**"],
            exclude: ["**/node_modules/**", "**/build/**", "**/dist/**"]
        }
    ],
    orderBy: "origin",
    compileNamespace: "ts"
});
