import { reviewConfig } from "./playwright.review.config";
process.env.REVIEW_EVIDENCE = "../docs/game-review/minimi-fix/regressions";
process.env.REVIEW_RUN = "regression-final-02";
const config = reviewConfig(false);
config.testIgnore = ["review-batch-d-production.spec.ts", "review-minimi-*.spec.ts"];
export default config;
