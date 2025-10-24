import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import { defineConfig } from "eslint/config";
import pluginLingui from "eslint-plugin-lingui";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: globals.browser
        },
    },
    pluginJs.configs.recommended,
    tseslint.configs.recommended,
    ...(pluginReact.configs.flat?.["recommended"] ? [pluginReact.configs.flat["recommended"]] : []),
    ...(pluginReact.configs.flat?.["jsx-runtime"] ? [pluginReact.configs.flat["jsx-runtime"]] : []),
    pluginLingui.configs["flat/recommended"],
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    ...pluginQuery.configs["flat/recommended"],
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        jsx: true,
        commaDangle: "only-multiline",
        braceStyle: "1tbs",
        arrowParens: true,
    }),
    {
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/indent": ["error", 4, {
                ObjectExpression: "first",
                SwitchCase: 1,
            }],
            "@stylistic/operator-linebreak": ["error", "after"],
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/quote-props": ["off"],
            "@stylistic/jsx-one-expression-per-line": ["off"],
        }
    },
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "backend/**",
            "**/.venv/**"
        ],
    }
]);
