const attributionPattern = /^(co-authored-by:|generated (with|by)\b)|noreply@/im;

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-tool-attribution": ({ raw }) => [
          !attributionPattern.test(raw ?? ""),
          "commit messages must not contain tool attribution or co-author trailers",
        ],
      },
    },
  ],
  rules: {
    "no-tool-attribution": [2, "always"],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 72],
  },
};

export default config;
