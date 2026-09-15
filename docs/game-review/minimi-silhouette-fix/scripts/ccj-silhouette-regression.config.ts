import {reviewConfig} from "/Users/user/wedding/ccj/game/playwright.review.config.ts";
process.env.REVIEW_EVIDENCE="/Users/user/wedding/ccj/docs/game-review/minimi-silhouette-fix";
process.env.REVIEW_RUN="dev-regression-01";
const config=reviewConfig(false);
config.testDir="/Users/user/wedding/ccj/game/e2e";
config.testMatch=["avatar-alpha.spec.ts","minimi-jaw.spec.ts","minimi-neck.spec.ts","minimi-visual.spec.ts","minimi-customization.spec.ts","review-batch-a.spec.ts","review-batch-a1.spec.ts","review-batch-d-input-motion.spec.ts","review-batch-d-animation.spec.ts","review-neck-loading.spec.ts"];
config.grepInvert=/isolated art audit/;
config.webServer={...config.webServer,cwd:"/Users/user/wedding/ccj/game"};
export default config;
