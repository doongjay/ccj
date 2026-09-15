type Notice = { title: string; paragraphs: string[] };

const NOTICE_PHOTOS: Record<string, { label: string; src: string; position?: string }> = {
  "웰컴드링크": { label: "웰컴 드링크", src: "/assets/invitation/notice-welcome.jpg", position: "center bottom" },
  "포토부스": { label: "포토부스", src: "/assets/invitation/notice-photo-booth.jpg" },
  "ATM": { label: "ATM", src: "/assets/invitation/notice-atm.jpg" },
  "연회장": { label: "연회장", src: "/assets/invitation/notice-banquet.jpg" },
  "신부대기실": { label: "신부대기실", src: "/assets/lacitta/photos/bridal-room.jpeg" },
};

/** Keep the invitation's copy together while showing one notice at a time. */
export function invitationInformation(html: string): HTMLDivElement {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const notices: Notice[] = [];
  for (const paragraph of parsed.querySelectorAll("p")) {
    const copy = paragraph.textContent?.trim();
    if (!copy) continue;
    if (copy.startsWith("[")) notices.push({ title: copy.replace(/^\[\s*|\s*\]$/g, ""), paragraphs: [] });
    else {
      if (!notices.length) notices.push({ title: "이용 안내", paragraphs: [] });
      notices.at(-1)!.paragraphs.push(copy);
    }
  }
  const root = document.createElement("div");
  root.className = "invitation-notices";
  if (!notices.length) return root;
  const menu = document.createElement("div");
  menu.className = "invitation-notice-menu";
  menu.setAttribute("role", "tablist");
  menu.setAttribute("aria-label", "안내사항 메뉴");
  const content = document.createElement("div");
  content.className = "invitation-notice-content";
  const tabs: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];
  for (const [index, notice] of notices.entries()) {
    const photo = NOTICE_PHOTOS[notice.title.replace(/\s/g, "")];
    const title = photo?.label ?? notice.title;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = `invitation-notice-tab-${index}`;
    tab.className = "invitation-notice-tab";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `invitation-notice-panel-${index}`);
    tab.textContent = title;
    const panel = document.createElement("div");
    panel.id = `invitation-notice-panel-${index}`;
    panel.className = "invitation-notice-panel";
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
    const image = document.createElement("img");
    image.src = photo?.src ?? "/assets/invitation/information.png";
    image.alt = `라시따시어터 ${title} 안내 사진`;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    if (photo?.position) image.style.objectPosition = photo.position;
    const text = document.createElement("div");
    text.className = "invitation-notice-copy";
    for (const copy of notice.paragraphs) {
      const line = document.createElement("p");
      line.textContent = copy;
      text.append(line);
    }
    panel.append(image, text);
    menu.append(tab); content.append(panel);
    tabs.push(tab); panels.push(panel);
  }
  const controls = document.createElement("div");
  controls.className = "invitation-notice-controls";
  const previous = document.createElement("button");
  const next = document.createElement("button");
  previous.type = next.type = "button";
  previous.textContent = "←"; next.textContent = "→";
  previous.setAttribute("aria-label", "이전 안내");
  next.setAttribute("aria-label", "다음 안내");
  const count = document.createElement("span");
  count.setAttribute("aria-live", "polite");
  controls.append(previous, count, next);
  root.append(menu, content, controls);
  let active = 0;
  const select = (index: number, focus = false, reveal = true) => {
    active = Math.max(0, Math.min(notices.length - 1, index));
    for (const [index, tab] of tabs.entries()) {
      const selected = index === active;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].setAttribute("aria-hidden", String(!selected));
      panels[index].inert = !selected;
    }
    previous.disabled = active === 0;
    next.disabled = active === notices.length - 1;
    count.textContent = `${active + 1} / ${notices.length}`;
    count.setAttribute("aria-label", `${tabs[active].textContent} 안내, ${active + 1} / ${notices.length}`);
    if (focus) tabs[active].focus({ preventScroll: true });
    if (reveal) {
      // Move only the menu strip; choosing a tab must not jump the page vertically.
      const tab = tabs[active];
      const left = tab.getBoundingClientRect().left - menu.getBoundingClientRect().left + menu.scrollLeft;
      menu.scrollTo({ left: left - (menu.clientWidth - tab.offsetWidth) / 2, behavior: "auto" });
    }
  };
  tabs.forEach((tab, index) => {
    tab.onclick = () => select(index);
    tab.onkeydown = event => {
      let target: number;
      if (event.key === "ArrowRight") target = (active + 1) % tabs.length;
      else if (event.key === "ArrowLeft") target = (active + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      else return;
      event.preventDefault();
      select(target, true);
    };
  });
  previous.onclick = () => select(active - 1);
  next.onclick = () => select(active + 1);
  let touch: { id: number; x: number; y: number } | undefined;
  content.onpointerdown = event => {
    if (event.pointerType === "mouse" || !event.isPrimary) return;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY };
    content.setPointerCapture(event.pointerId);
  };
  content.onpointercancel = () => { touch = undefined; };
  content.onpointerup = event => {
    if (!touch || event.pointerId !== touch.id) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    touch = undefined;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.4) select(active + (dx < 0 ? 1 : -1));
  };
  select(0, false, false);
  return root;
}
