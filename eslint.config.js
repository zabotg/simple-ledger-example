import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    {
        ignores: ["dist/**", "node_modules/**"]
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            },
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            import: importPlugin
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
            ],
            "@typescript-eslint/consistent-type-imports": "warn",
            "import/order": [
                "warn",
                {
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                    groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]]
                }
            ],
            "no-console": "off"
        }
    },
    prettierConfig
];
