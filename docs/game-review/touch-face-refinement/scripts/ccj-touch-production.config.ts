import {reviewConfig} from "/Users/user/wedding/ccj/game/playwright.review.config.ts";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/touch-face-refinement/production";
process.env.REVIEW_RUN="production-01";
const config=reviewConfig(true);config.workers=2;config.testMatch=["review-batch-b-performance.spec.ts","review-batch-b-access.spec.ts","current-journey.spec.ts"];config.testDir="/Users/user/wedding/ccj/game/e2e";config.webServer={...config.webServer,cwd:"/Users/user/wedding/ccj/game"};export default config;
