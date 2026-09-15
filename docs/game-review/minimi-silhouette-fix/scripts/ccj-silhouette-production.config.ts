import {reviewConfig} from "/Users/user/wedding/ccj/game/playwright.review.config.ts";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/minimi-silhouette-fix";
process.env.REVIEW_RUN="production-01";
const config=reviewConfig(true);
config.testDir="/Users/user/wedding/ccj/game/e2e";
config.webServer={...config.webServer,cwd:"/Users/user/wedding/ccj/game"};
export default config;
