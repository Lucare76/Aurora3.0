import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        navigator: "readonly",
        performance: "readonly",
        URL: "readonly",
        Blob: "readonly",
        MessageChannel: "readonly",
        queueMicrotask: "readonly",
        reportError: "readonly",
        MSApp: "readonly",
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "readonly",
        IS_REACT_ACT_ENVIRONMENT: "readonly",
        checkDCE: "readonly"
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "warn",
      "no-constant-condition": "off",
      "no-undef": "off",
      "no-prototype-builtins": "off",
      "no-useless-escape": "off",
      "no-empty": "off",
      "no-unreachable": "off",
      "no-fallthrough": "off",
      "no-self-assign": "off",
      "no-cond-assign": "off",
      "no-control-regex": "off",
      "no-misleading-character-class": "off",
      "getter-return": "off",
      "valid-typeof": "off",
      "react/no-unescaped-entities": "off",
      "no-shadow-restricted-names": "off",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      ".vite/**",
      "dist/**",
      "node_modules/**",
      "**/*.min.js"
    ]
  }
];