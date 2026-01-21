import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.lint.json",
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // Conflicts with no-non-null-assertion - prefer as T over !
      "@typescript-eslint/non-nullable-type-assertion-style": "off"
    }
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off"
    }
  },
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "*.config.ts",
      "*.config.js",
      "packages/*/dist/**",
      "packages/*/node_modules/**",
      "docs/**"
    ]
  }
)
