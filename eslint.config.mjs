import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{js,ts,tsx}"],
    ignores: ["src/lib/db/migrate.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "fs",
              message: "Do not write files on Hostinger. Persist user data in Postgres.",
            },
            {
              name: "node:fs",
              message: "Do not write files on Hostinger. Persist user data in Postgres.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
