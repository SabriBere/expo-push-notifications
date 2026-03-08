// https://docs.expo.dev/guides/using-eslint/
// configurar según nuevo eslint 9
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    plugins: ["react", "@typescript-eslint", "prettier"],
    rules: {
      "no-var": 2,
      eqeqeq: 2,
      "no-console": 0,
      "require-await": 1,
      "no-unused-vars": 1,
      "no-inline-comments": 0,
      "no-duplicate-imports": 1,
      "array-callback-return": 0,
      "react/no-children-prop": 0,
      "react-hooks/exhaustive-deps": 0,
      "react/prop-types": [0, { ignore: ["children"] }],
    },
  },
]);
