import { reviewConfig } from "./playwright.review.config";
process.env.REVIEW_EVIDENCE = "../docs/game-review/neck-loading-fix/regressions";
process.env.REVIEW_RUN ??= `regression-${Date.now()}`;
const config = reviewConfig();
config.testIgnore = ["review-batch-d-production.spec.ts", "review-minimi-fix.spec.ts", "review-minimi-flow.spec.ts", "review-minimi-motion.spec.ts", "review-neck-loading.spec.ts"];
export default config;
