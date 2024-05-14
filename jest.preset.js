const nxPreset = require("@nx/jest/preset").default;

module.exports = {
  ...nxPreset,
  reporters: ["default", "github-actions"],
  coverageProvider: "v8",
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.types.{ts,tsx}",
    "!**/*.template.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",
    "!**/*.e2e-spec.{ts,tsx}",
    "!**/tests/e2e/**",
    "!**/node_modules/**",
    "!**/amplication_modules/**",
    "!**/prisma/generated-prisma-client/**",
    "!**/migration-scripts/**",
    "!**/scripts/**",
    "!**/jest.config.ts",
    "!**/jest.**.config.ts",
    "!**/index.ts",
    "!**/*.mock.ts",
    "!**/*.module.ts",
    "!**/*.interface.ts",
    "!**/((*.)?)enum.ts",
    "!**/((*.)?)constants.ts",
    "!**/((*.)?)types.ts",
    "!**/dto/**",
    "!**/*.dto.ts",
    "!**/main.ts",
    "!**/models.ts", // autogenerated by nx graphql:models:generate amplication-server
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      lines: 90,
    },
  },
};
