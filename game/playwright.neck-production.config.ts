import { reviewConfig } from "./playwright.review.config";
process.env.REVIEW_EVIDENCE = "../docs/game-review/neck-loading-fix/regressions";
process.env.REVIEW_RUN ??= `production-${Date.now()}`;
export default reviewConfig(true);
