import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    rules: {
      // Keep config minimal; rely on Next.js defaults.
    },
  },
];

export default config;
