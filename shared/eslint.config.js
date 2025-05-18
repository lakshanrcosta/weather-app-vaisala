const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"], // Ensure ESLint recognizes TypeScript files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules, // TypeScript ESLint rules
      "prettier/prettier": "error", // Run Prettier through ESLint
      "no-unused-vars": "off", // Disable ESLint's built-in rule
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Use TypeScript-specific rule
    },
  },
  prettierConfig, // Apply Prettier configuration
];