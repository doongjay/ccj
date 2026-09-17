/** CSS-only decorations never receive taps or enter the accessibility tree. */
export function weddingAmbience(): HTMLDivElement {
  const layer = document.createElement("div");
  layer.className = "wedding-ambience";
  layer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement("span");
    particle.className = index % 4 === 0 ? "wedding-sparkle" : "wedding-heart";
    particle.style.setProperty("--float-top", `${5 + index * 7.5}%`);
    particle.style.setProperty("--float-duration", `${7 + index % 5}s`);
    particle.style.setProperty("--float-delay", `${-index * 1.7}s`);
    particle.style.setProperty("--float-side", index % 2 ? "1" : "-1");
    const row = Math.floor(index / 3), column = index % 3;
    particle.style.setProperty("--float-invitation-x", String(-32 + column * 32 + (row % 2 ? 3 : -3)));
    particle.style.setProperty("--float-invitation-y", `${10 + row * 24 + (column === 1 ? 5 : 0)}%`);
    layer.append(particle);
  }
  return layer;
}

/** Keep the former twelve-per-screen density, anchored to the scrolling paper. */
export function scrollingWeddingAmbience(paper: HTMLElement, viewport: HTMLElement): () => void {
  const layer = document.createElement("div");
  layer.className = "wedding-ambience";
  layer.setAttribute("aria-hidden", "true");
  paper.append(layer);
  const arrange = () => {
    const height = Math.max(1, viewport.clientHeight);
    const count = Math.ceil(paper.offsetHeight / height);
    while (layer.children.length < count) {
      const band = weddingAmbience();
      band.className = "wedding-ambience-band";
      layer.append(band);
    }
    while (layer.children.length > count) layer.lastElementChild?.remove();
    [...layer.children].forEach((band, index) => Object.assign((band as HTMLElement).style, { top: `${index * height}px`, height: `${height}px` }));
  };
  const observer = new ResizeObserver(arrange);
  observer.observe(paper); observer.observe(viewport);
  arrange();
  return () => { observer.disconnect(); layer.remove(); };
}
