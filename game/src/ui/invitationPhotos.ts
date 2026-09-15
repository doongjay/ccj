import display from "../data/invitationPhotoDisplay.json";

const photos: Record<string, { url: string; width: number; height: number }> = display;
export function invitationPhoto(file: string) { return photos[file]; }
export function invitationPhotoUrl(file: string): string { return photos[file]?.url ?? `/assets/invitation/${file}`; }

let warming = false;
/** Start only after the player leaves the opening screen. Never delay game boot. */
export function warmInvitationPhotos(): void {
  if (warming) return;
  warming = true;
  window.setTimeout(() => void (async () => {
    for (const { url } of Object.values(photos)) {
      // Give current scene assets and a hidden browser tab priority over speculation.
      while (document.hidden || document.querySelector<HTMLCanvasElement>("#app canvas")?.dataset.assetLoadState === "loading") {
        await new Promise(resolve => window.setTimeout(resolve, 500));
      }
      const image = new Image();
      image.fetchPriority = "low";
      image.decoding = "async";
      image.src = url;
      try { await image.decode(); } catch { /* Foreground opening offers an explicit retry. */ }
      // One photo at a time; do not retain all decoded full-size bitmaps in JS.
    }
  })(), 1500);
}

/** Reveal the invitation together, after its images have decoded, including the gallery. */
export function prepareInvitationPhotos(root: HTMLElement, paper: HTMLElement): () => void {
  let destroyed = false;
  let running = false;
  const ready = new Set<HTMLImageElement>();
  const images = [...paper.querySelectorAll("img")];
  const loading = document.createElement("div");
  loading.className = "invitation-photo-loading";
  loading.hidden = true;
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const progress = document.createElement("progress");
  progress.max = images.length;
  progress.setAttribute("aria-label", "청첩장 사진 준비");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "다시 불러오기";
  retry.hidden = true;
  loading.append(status, progress, retry);
  root.append(loading);
  paper.style.visibility = "hidden";
  paper.inert = true;
  root.dataset.photosState = "loading";
  root.setAttribute("aria-busy", "true");
  const delay = window.setTimeout(() => { loading.hidden = false; }, 250);
  const update = () => {
    progress.value = ready.size;
    status.textContent = `청첩장을 준비하고 있어요 · ${ready.size}/${images.length}`;
  };
  const run = async (retryFailed = false) => {
    if (running || destroyed) return;
    running = true;
    const restoreFocus = loading.contains(document.activeElement);
    retry.hidden = true;
    root.dataset.photosState = "loading";
    update();
    const remaining = images.filter(image => !ready.has(image));
    // Two foreground decoders keep memory/network bursts bounded on mobile.
    await Promise.all([0, 1].map(async () => {
      while (remaining.length && !destroyed) {
        const image = remaining.shift()!;
        image.loading = "eager";
        if (retryFailed) { const src = image.src; image.removeAttribute("src"); image.src = src; }
        try { await image.decode(); ready.add(image); update(); } catch { /* Keep the failed image for retry. */ }
      }
    }));
    running = false;
    if (destroyed) return;
    window.clearTimeout(delay);
    if (ready.size !== images.length) {
      root.dataset.photosState = "error";
      loading.hidden = false;
      status.textContent = "사진을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.";
      retry.hidden = false;
      retry.focus({ preventScroll: true });
      return;
    }
    loading.remove();
    paper.style.visibility = "";
    paper.inert = false;
    root.dataset.photosState = "ready";
    root.setAttribute("aria-busy", "false");
    if (restoreFocus) root.focus({ preventScroll: true });
  };
  retry.onclick = () => void run(true);
  void run();
  return () => { destroyed = true; window.clearTimeout(delay); loading.remove(); };
}
