import { WEDDING_METADATA } from "../data/weddingMetadata";

type KakaoFeed = {
  objectType: "feed";
  content: { title: string; description: string; imageUrl: string; imageWidth: number; imageHeight: number; link: { mobileWebUrl: string; webUrl: string } };
  buttons: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
};
type KakaoSdk = { init(key: string): void; isInitialized(): boolean; Share: { sendDefault(feed: KakaoFeed): void } };
declare global { interface Window { Kakao?: KakaoSdk } }

const javascriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim() ?? "";
export const kakaoConfigured = Boolean(javascriptKey);
let ready: Promise<void> | undefined;

export function invitationShareUrl(): string {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? location.href;
  const url = new URL(canonical); url.hash = "invitation"; url.search = "";
  return url.href;
}

export function prepareKakaoShare(): Promise<void> {
  if (!kakaoConfigured) return Promise.reject(new Error("Kakao JavaScript key is not configured."));
  if (window.Kakao?.isInitialized()) return Promise.resolve();
  if (ready) return ready;
  ready = new Promise<void>((resolve, reject) => {
    const initialize = () => {
      try {
        if (!window.Kakao) throw new Error("Kakao SDK did not load.");
        if (!window.Kakao.isInitialized()) window.Kakao.init(javascriptKey);
        resolve();
      } catch (error) { reject(error); }
    };
    if (window.Kakao) { initialize(); return; }
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js";
    script.integrity = "sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy";
    script.crossOrigin = "anonymous"; script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error("Kakao SDK timed out.")); }, 15000);
    script.onload = () => { window.clearTimeout(timeout); initialize(); };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error("Kakao SDK could not load.")); };
    document.head.append(script);
  }).catch(error => { ready = undefined; throw error; });
  return ready;
}

export function sendKakaoInvitation(): void {
  if (!window.Kakao?.isInitialized()) throw new Error("Kakao SDK is not ready.");
  const url = invitationShareUrl();
  const link = { mobileWebUrl: url, webUrl: url };
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: WEDDING_METADATA.shareTitle,
      description: WEDDING_METADATA.description,
      imageUrl: new URL("/assets/invitation/share-pixel-square-v3.png", url).href,
      imageWidth: 1254, imageHeight: 1254,
      link,
    },
    buttons: [{ title: "청첩장 보기", link }],
  });
}
