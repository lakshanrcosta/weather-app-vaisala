const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules", "dist", ".serverless", ".build", "coverage", ".cache"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"], // Ensure ESLint recognizes TypeScript files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: "module",
        ecmaVersion: "latest",
      }
  
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
  {
    files: ["*.test.ts"],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        jest: true
      }
    },
  },
  prettierConfig, // Apply Prettier configuration
];