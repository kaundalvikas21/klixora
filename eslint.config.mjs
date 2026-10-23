import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // next/error.js attaches catchError to the shared dist/pages/_error
      // exports object with configurable:false, so the second time Turbopack
      // evaluates it in dev the module throws "Cannot redefine property:
      // catchError". Use a plain React error boundary instead.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/error",
              message:
                "next/error throws 'Cannot redefine property: catchError' on re-evaluation in dev. Use a React error boundary class, as in components/sections/contact-form-boundary.tsx.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Written by `npm run db:types`.
    "src/lib/database.types.ts",
  ]),
]);

export default eslintConfig;
