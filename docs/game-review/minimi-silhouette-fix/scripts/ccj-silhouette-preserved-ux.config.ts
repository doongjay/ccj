import {reviewConfig} from "/Users/user/wedding/ccj/game/playwright.review.config.ts";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/minimi-silhouette-fix";
process.env.REVIEW_RUN="preserved-ux-rerun-01";
const config=reviewConfig(false);
config.testDir="/Users/user/wedding/ccj/game/e2e";
config.testMatch=["review-neck-loading.spec.ts"];
config.grepInvert=/isolated art audit/;
config.webServer={...config.webServer,cwd:"/Users/user/wedding/ccj/game"};
export default config;
