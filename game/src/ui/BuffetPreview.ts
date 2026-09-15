import type Phaser from "phaser";

/** A manual album of the existing six authored food images; no dish/menu choices. */
export function buffetPreview(scene: Phaser.Scene): HTMLElement {
  const album = document.createElement("div"); album.className = "buffet-preview";
  const cards = document.createElement("div"); cards.className = "buffet-cards";
  const navigation = document.createElement("div"); navigation.className = "buffet-navigation";
  const previous = document.createElement("button"), next = document.createElement("button");
  for (const button of [previous, next]) { button.type = "button"; button.className = "story-choice"; }
  previous.textContent = "이전"; previous.setAttribute("aria-label", "이전 음식 사진");
  next.textContent = "다음"; next.setAttribute("aria-label", "다음 음식 사진");
  const count = document.createElement("span"); count.setAttribute("aria-live", "polite");
  navigation.append(previous, count, next); album.append(cards, navigation);
  let index = 0;
  const render = () => {
    cards.replaceChildren();
    for (let item = index * 3; item < index * 3 + 3; item++) {
    const figure = document.createElement("figure");
    const image = document.createElement("canvas"); image.setAttribute("role", "img");
    const column = item % 2, row = Math.floor(item / 2);
    const source = scene.textures.get(column ? "buffet-right" : "buffet-left").getSourceImage() as HTMLImageElement;
    const edges = column ? [0, .33, .628, 1] : [0, .378, .683, 1];
    const top = Math.round(edges[row]! * source.height), bottom = Math.round(edges[row + 1]! * source.height);
    image.width = source.width; image.height = bottom - top;
    image.getContext("2d")!.drawImage(source, 0, top, source.width, bottom - top, 0, 0, image.width, image.height);
    image.setAttribute("aria-label", `뷔페 음식 사진 ${item + 1}`);
    figure.append(image); cards.append(figure);
    }
    count.textContent = `${index * 3 + 1}–${index * 3 + 3} / 6`;
    previous.disabled = index === 0; next.disabled = index === 1;
    scene.game.canvas.dataset.buffetPhotoIndex = String(index);
  };
  previous.onclick = () => { if (index > 0) { index--; render(); } };
  next.onclick = () => { if (index < 1) { index++; render(); } };
  render(); return album;
}
