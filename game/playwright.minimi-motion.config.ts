import { minimiConfig } from "./playwright.minimi.config";
process.env.MINIMI_RUN = "motion-03";
const config = minimiConfig(); config.testMatch = "review-minimi-motion.spec.ts";
export default config;
