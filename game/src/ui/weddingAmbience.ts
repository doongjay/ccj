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
