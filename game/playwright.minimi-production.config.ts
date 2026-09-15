import { reviewConfig } from "./playwright.review.config";
process.env.REVIEW_EVIDENCE = "../docs/game-review/minimi-fix/regressions";
process.env.REVIEW_RUN = "production-final-02";
export default reviewConfig(true);
