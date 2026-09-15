import { minimiConfig } from "./playwright.minimi.config";
process.env.MINIMI_RUN = "flows-final";
const config = minimiConfig();
config.testMatch = "review-minimi-flow.spec.ts";
export default config;
