import { cloudEnabled, CloudSaveError } from "../cloud/client";
import { validOutfit } from "../data/guestOutfits";
import { shuttleDecoration } from "./shuttleDecoration";
import type Phaser from "phaser";
import source from "../data/invitationSource.json";
import { GAME_STATE_REGISTRY_KEYS, readGuestName, readGuestSide, readGuestGender, readGuestOutfit, readGuestHair, readGuestFace } from "../state/gameState";
import { readGuestMessages, refreshGuestMessages, saveGuestMessage, type GuestMessage } from "../state/guestMessages";
import { MinimiPicker } from "./MinimiPicker";
import { drawMinimi, type MinimiProfile } from "./minimi";
import { WeddingCountdown } from "./WeddingCountdown";
import { scrollingWeddingAmbience } from "./weddingAmbience";
import { invitationInformation } from "./InvitationInformation";
import { GUEST_PHOTO_PAGE_SIZE, GUEST_PHOTO_POSITIONS } from "./guestPhotoLayout";
import { WEDDING_METADATA } from "../data/weddingMetadata";
import { weddingMonogramElement } from "./weddingMonogram";
import { invitationPhoto, invitationPhotoUrl, prepareInvitationPhotos } from "./invitationPhotos";
import { invitationShareUrl, kakaoConfigured, prepareKakaoShare, sendKakaoInvitation } from "./invitationShare";

const SOURCE_URL = "https://www.heumcard.com/cards/now-2026-11-21";
const NAVER_MAP_URL = "https://naver.me/xAFClJVG";
const WEDDING_TIME = new Date("2026-11-21T14:00:00+09:00").getTime();

export class InvitationView {
  private readonly root = element("main", "invitation-page");
  private readonly scene: Phaser.Scene;
  private readonly wall = element("div", "minimi-wall");
  private readonly messages = element("div", "invitation-messages");
  private readonly guestPages = element("div", "minimi-pagination");
  private guestPage = 0;
  private arrivingGuestId: string | undefined;
  private readonly toast = element("p", "invitation-toast");
  private readonly dialogs = new Set<HTMLDialogElement>();
  private toastTimer: number | undefined;
  private picker: MinimiPicker | undefined;
  private countdown: WeddingCountdown | undefined;
  private stopPhotoPreparation: (() => void) | undefined;
  private stopAmbience: (() => void) | undefined;
  private readonly app = document.querySelector<HTMLElement>("#app");

  constructor(scene: Phaser.Scene, onReturn?: () => void) {
    this.scene = scene;
    this.root.setAttribute("aria-label", "재준과 현서의 청첩장");
    this.root.tabIndex = -1;
    this.toast.setAttribute("role", "status");
    this.toast.hidden = true;
    const paper = element("article", "invitation-paper");
    const navigation = element("nav", "invitation-nav");
    navigation.setAttribute("aria-label", "청첩장 바로가기");
    navigation.append(weddingMonogramElement("span"));
    if (onReturn) navigation.append(button("게임으로", onReturn));
    for (const [label, id] of [["예식 안내", "invitation-location"], ["사진", "invitation-gallery"], ["방명록", "invitation-guests"]]) {
      navigation.append(button(label!, () => this.root.querySelector(`#${id}`)?.scrollIntoView({ behavior: "auto", block: "start" })));
    }
    paper.append(navigation, this.hero(), this.letter(), this.calendar(), this.gallery(), this.location(), this.information(), this.accounts(), this.guestBook(), this.footer());
    this.root.append(paper, this.toast);
    document.body.append(this.root);
    this.stopAmbience = scrollingWeddingAmbience(paper, this.root);
    if (this.app) { this.app.inert = true; this.app.style.visibility = "hidden"; }
    this.root.focus({ preventScroll: true });
    this.renderGuests();
    if (cloudEnabled) void refreshGuestMessages().then(() => {
      if (this.root.isConnected) this.renderGuests();
    }).catch(() => {
      if (this.root.isConnected) this.notify("이전 메시지를 불러오지 못했어요. 잠시 후 청첩장을 다시 열어 주세요.");
    });
    window.addEventListener("storage", this.onStorage);
    this.stopPhotoPreparation = prepareInvitationPhotos(this.root, paper);
  }

  private hero(): HTMLElement {
    const hero = element("header", "invitation-hero");
    const frame = element("div", "invitation-photo-window");
    frame.append(element("div", "invitation-window-bar", "♥  WEDDING INVITATION  ♥"));
    const photo = picture("intro.jpg", "재준과 현서의 웨딩 사진", false);
    photo.fetchPriority = "high";
    const title = element("div", "invitation-hero-title");
    title.append(element("p", "invitation-eyebrow", "OUR NOW BEGINS"), element("h1", "", "재준 그리고 현서"), element("p", "", "2026. 11. 21. SAT 14:00"));
    frame.append(photo);
    const welcome = element("div", "invitation-welcome");
    welcome.append(this.couple(), element("p", "invitation-speech", "우리, 결혼해요!"));
    const cover = element("div", "invitation-cover-frame");
    cover.append(title, frame);
    hero.append(welcome, cover);
    return hero;
  }

  private letter(): HTMLElement {
    const section = this.section("INVITATION", "소중한 당신을 초대합니다");
    appendParagraphs(section, source.invitationLetterContent);
    const family = element("div", "invitation-family");
    for (const person of [
      { father: `${source.groomFatherLastName}${source.groomFatherFirstName}`, mother: `${source.groomMotherLastName}${source.groomMotherFirstName}`, relation: "의 아들", name: source.groomFirstName, memorial: source.isDeadGroomFather },
      { father: `${source.bridgeFatherLastName}${source.bridgeFatherFirstName}`, mother: `${source.bridgeMotherLastName}${source.bridgeMotherFirstName}`, relation: "의 딸", name: source.bridgeFirstName, memorial: source.isDeadBridgeFather },
    ]) {
      const row = element("p", "invitation-family-row");
      const parents = element("span", "invitation-family-parents", `${person.father} · ${person.mother}`);
      if (person.memorial) {
        const flower = picture("chrysanthemum.png", "고인을 기리는 국화");
        flower.className = "invitation-memorial-flower";
        parents.prepend(flower);
      }
      row.append(parents, element("span", "", person.relation), element("span", "", person.name));
      family.append(row);
    }
    section.append(family);
    return section;
  }

  private calendar(): HTMLElement {
    const section = this.section("OUR DAY", "2026년 11월 21일 (토)");
    section.classList.add("invitation-date-section");
    section.append(element("p", "invitation-lead", "오후 2시 라시따시어터"), picture("calendar.jpg", "두 사람의 웨딩 사진"));
    const calendar = element("table", "invitation-calendar");
    calendar.setAttribute("aria-label", "2026년 11월 달력, 21일 결혼식");
    const heading = document.createElement("thead");
    const week = document.createElement("tr");
    for (const day of ["일", "월", "화", "수", "목", "금", "토"]) {
      const cell = element("th", "", day); cell.scope = "col"; week.append(cell);
    }
    heading.append(week); calendar.append(heading);
    const body = document.createElement("tbody");
    for (let row = 0; row < 5; row += 1) {
      const weekRow = document.createElement("tr");
      for (let column = 0; column < 7; column += 1) {
        const day = row * 7 + column + 1;
        const cell = element("td", day === 21 ? "wedding-day" : "", day <= 30 ? String(day) : "");
        if (day === 21) cell.setAttribute("aria-label", "21일, 결혼식");
        weekRow.append(cell);
      }
      body.append(weekRow);
    }
    calendar.append(body); section.append(calendar);
    this.countdown = new WeddingCountdown(WEDDING_TIME, this.root);
    section.append(this.countdown.element);
    return section;
  }

  private gallery(): HTMLElement {
    const section = this.section("OUR MOMENTS", "우리의 순간들", "invitation-gallery");
    section.querySelector("h2")!.classList.add("invitation-ribbon");
    const grid = element("div", "invitation-gallery");
    for (let index = 1; index <= source.galleryFiles.length; index += 1) {
      const open = button(`${index}번째 사진 크게 보기`, () => this.openGallery(index));
      open.className = "invitation-photo-button";
      open.replaceChildren(picture(galleryFile(index), `재준과 현서의 웨딩 사진 ${index}`));
      grid.append(open);
    }
    section.append(grid);
    return section;
  }

  private openGallery(initial: number): void {
    let index = initial;
    const dialog = this.dialog("웨딩 사진 크게 보기");
    dialog.classList.add("invitation-lightbox");
    const stage = element("div", "invitation-gallery-stage");
    const previous = button("앞 사진 미리보기", () => move(-1));
    previous.className = "invitation-gallery-slide is-previous";
    const next = button("뒷 사진 미리보기", () => move(1));
    next.className = "invitation-gallery-slide is-next";
    const beforeImage = picture(galleryFile(index), "", false);
    const afterImage = picture(galleryFile(index), "", false);
    beforeImage.setAttribute("aria-hidden", "true"); afterImage.setAttribute("aria-hidden", "true");
    previous.replaceChildren(beforeImage); next.replaceChildren(afterImage);
    const active = element("figure", "invitation-gallery-slide is-current");
    const image = picture(galleryFile(index), `웨딩 사진 ${index}`, false);
    image.draggable = false; active.append(image);
    const count = element("p", "invitation-gallery-count", "");
    count.setAttribute("aria-live", "polite");
    const adjacent = (offset: number) => (index - 1 + offset + source.galleryFiles.length) % source.galleryFiles.length + 1;
    const move = (offset: number) => {
      index = adjacent(offset);
      image.src = invitationPhotoUrl(galleryFile(index));
      image.alt = `재준과 현서의 웨딩 사진 ${index}`;
      beforeImage.src = invitationPhotoUrl(galleryFile(adjacent(-1)));
      afterImage.src = invitationPhotoUrl(galleryFile(adjacent(1)));
      count.textContent = `${index} / ${source.galleryFiles.length}`;
    };
    stage.append(previous, next, active, arrowButton("이전 사진", -1, () => move(-1)), arrowButton("다음 사진", 1, () => move(1)));
    dialog.append(stage, count);
    horizontalNavigation(dialog, move, stage);
    move(0); dialog.showModal();
  }

  private location(): HTMLElement {
    const section = this.section("LOCATION", "오시는 길", "invitation-location");
    section.append(element("h3", "invitation-venue", source.venue.venueName.trim()), element("p", "", source.venue.venueDetail), element("p", "", source.venue.venueAddress));
    const links = element("div", "invitation-actions");
    links.append(link("카카오맵", `https://map.kakao.com/link/search/${encodeURIComponent("라시따시어터")}`), link("네이버 지도", NAVER_MAP_URL), button("주소 복사", () => void this.copy(source.venue.venueAddress, "주소를 복사했어요.")));
    section.append(links);
    const map = link("", NAVER_MAP_URL);
    map.className = "invitation-map";
    map.setAttribute("aria-label", "약도를 눌러 네이버 지도에서 라시따시어터 보기");
    map.append(picture("venue-directions.jpg", "라시따시어터 약도: 양재시민의숲역 5번 출구 셔틀버스와 주차장 입구"), element("span", "invitation-map-caption", "약도를 누르면 네이버 지도가 열려요 ↗"));
    section.append(map);
    for (const [title, html] of [["주차 안내", source.transportation.parkingContent], ["셔틀버스", source.transportation.shuttleBusContent]]) {
      const card = element("div", "invitation-info-card");
      card.append(element("h3", "", title)); appendParagraphs(card, html);
      if (title === "주차 안내") {
        for (const paragraph of card.querySelectorAll("p")) {
          const route = [
            { name: "파란색 유도선", tone: "blue", shape: "♥" },
            { name: "분홍색 유도선", tone: "pink", shape: "▲" },
            { name: "노란색 유도선", tone: "yellow", shape: "×" },
          ].find(route => paragraph.textContent?.includes(route.name));
          if (!route) continue;
          paragraph.className = `invitation-parking-route is-${route.tone}`;
          const marker = element("span", "invitation-route-marker", route.shape);
          marker.setAttribute("aria-hidden", "true");
          const detail = paragraph.textContent!.replace(/\[\s*[^\]]+\s*\]\s*/, "").replace("💙", "").trim();
          paragraph.replaceChildren(marker, element("span", "invitation-route-copy"));
          paragraph.lastElementChild!.append(element("strong", "", route.name), element("span", "", detail));
        }
      } else {
        card.classList.add("invitation-shuttle-card");
        card.append(shuttleDecoration());
      }
      section.append(card);
    }
    return section;
  }

  private information(): HTMLElement {
    const section = this.section("FOR OUR GUESTS", "하객 여러분께", "invitation-information");
    section.append(invitationInformation(source.information.content));
    return section;
  }

  private accounts(): HTMLElement {
    const section = this.section("WITH GRATITUDE", "마음 전하실 곳");
    section.append(element("p", "invitation-account-note", source.accountNumber.content));
    const groups = [
      { title: "신랑측", prefixes: ["groom", "groomFather", "groomMother"] },
      { title: "신부측", prefixes: ["bridge", "bridgeMother"] },
    ];
    const accounts = source.accountNumber as Record<string, string | boolean>;
    for (const group of groups) {
      const details = element("details", "invitation-accounts");
      details.dataset.side = group.prefixes[0] === "groom" ? "groom" : "bride";
      details.append(element("summary", "", group.title));
      for (const prefix of group.prefixes) {
        const holder = String(accounts[`${prefix}AccountHolder`]);
        const bank = String(accounts[`${prefix}BankName`]);
        const number = String(accounts[`${prefix}AccountNumber`]);
        const account = element("div", "invitation-account");
        const info = element("div");
        info.append(element("strong", "", holder), element("p", "", `${bank} ${number}`));
        const copy = button("복사", () => void this.copy(number, "계좌번호를 복사했어요."));
        copy.setAttribute("aria-label", `${holder} 계좌번호 복사`);
        account.append(info, copy); details.append(account);
      }
      section.append(details);
    }
    return section;
  }

  private guestBook(): HTMLElement {
    const section = this.section("TOGETHER IN THIS MOMENT", "함께 사진 찍기", "invitation-guests");
    section.querySelector("h2")!.classList.add("invitation-ribbon");
    const album = element("div", "minimi-album");
    album.tabIndex = 0; album.setAttribute("aria-label", "함께 찍은 원판 사진");
    album.append(this.wall, this.guestPages);
    horizontalNavigation(album, offset => this.moveGuestPage(offset), this.wall);
    section.append(element("p", "", "신랑신부와 함께 사진을 찍고\n축하 메시지를 남겨주세요."), album,
      element("p", "minimi-photo-hint", "미니미와 방명록 글을 누르면 메시지가 보여요."));
    section.append(element("p", "invitation-local-note", cloudEnabled ? "방명록에 남긴 이름, 미니미와 축하 메시지는 모든 하객에게 보여요." : "지금은 로컬 체험판입니다. 미니미와 메시지는 이 브라우저에만 저장되며, 다른 기기와 공유되지 않아요."));
    const selectedGender: unknown = this.scene.registry.get(GAME_STATE_REGISTRY_KEYS.guestGender);
    const gameAvatar: MinimiProfile | undefined = selectedGender === "male" || selectedGender === "female" ? {
      gender: readGuestGender(this.scene.registry), outfit: readGuestOutfit(this.scene.registry), hair: readGuestHair(this.scene.registry), face: readGuestFace(this.scene.registry),
    } : undefined;
    const form = element("form", "invitation-guest-form");
    form.noValidate = true;
    form.append(element("h3", "invitation-window-title", gameAvatar ? "나의 미니미로 메시지 남기기" : "나의 미니미 만들기"));
    const name = document.createElement("input");
    name.setAttribute("aria-required", "true"); name.maxLength = 20; name.autocomplete = "name";
    name.value = readGuestName(this.scene.registry);
    form.append(fieldLabel("이름", name));
    if (gameAvatar) {
      const saved = element("div", "invitation-saved-minimi");
      const preview = document.createElement("canvas");
      preview.setAttribute("aria-label", "게임에서 함께한 나의 미니미");
      drawMinimi(this.scene, preview, gameAvatar);
      saved.append(preview, element("p", "", "게임에서 함께한 미니미로 메시지를 남겨요."));
      form.append(saved);
    } else {
      this.picker = new MinimiPicker(this.scene, () => { error.textContent = ""; });
      form.append(this.picker.element);
    }
    const side = document.createElement("select");
    side.setAttribute("aria-label", "메시지 받을 사람");
    for (const [value, text] of [["groom", "재준에게"], ["bride", "현서에게"]]) {
      const option = element("option", "", text); option.value = value!; side.append(option);
    }
    side.value = readGuestSide(this.scene.registry) ?? "groom";
    form.append(fieldLabel("메시지 받는 사람", side));
    const message = document.createElement("textarea");
    message.rows = 4; message.maxLength = 1000; message.setAttribute("aria-required", "true");
    form.append(fieldLabel("축하 메시지", message));
    const error = element("p", "invitation-form-error"); error.setAttribute("role", "alert");
    error.id = "invitation-form-error";
    error.setAttribute("aria-live", "polite");
    for (const field of [name, message]) {
      field.setAttribute("aria-describedby", error.id);
      field.oninput = () => { field.removeAttribute("aria-invalid"); error.textContent = ""; };
    }
    const submit = element("button", "invitation-primary", "미니미와 메시지 남기기"); submit.type = "submit";
    form.append(error, submit);
    form.onsubmit = async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const avatar = gameAvatar ?? this.picker?.value;
      if (!name.value.trim() || !message.value.trim()) {
        const field = !name.value.trim() ? name : message;
        error.textContent = field === name ? "이름을 알려주세요!" : "축하 메시지를 입력해 주세요.";
        field.setAttribute("aria-invalid", "true");
        field.focus();
        return;
      }
      if (!avatar) { error.textContent = "성별과 의상을 골라 나만의 미니미를 만들어 주세요."; return; }
      submit.disabled = true;
      name.readOnly = true; message.readOnly = true; side.disabled = true;
      submit.textContent = "보내는 중…";
      form.setAttribute("aria-busy", "true");
      try {
        await saveGuestMessage(name.value, side.value === "bride" ? "bride" : "groom", message.value, avatar);
        this.arrivingGuestId = readGuestMessages().at(-1)?.id;
        this.guestPage = Math.floor((readGuestMessages().length - 1) / GUEST_PHOTO_PAGE_SIZE);
        message.value = "";
        error.textContent = "";
        this.renderGuests();
        this.notify(cloudEnabled ? "방명록에 미니미와 메시지를 남겼어요." : "미니미와 메시지를 이 브라우저에 남겼어요.");
        this.wall.scrollIntoView({ block: "center", behavior: "auto" });
      } catch (failure) {
        error.textContent = failure instanceof CloudSaveError ? failure.message : "저장하지 못했어요. 다시 시도해 주세요.";
      } finally {
        submit.disabled = false;
        name.readOnly = false; message.readOnly = false; side.disabled = false;
        submit.textContent = "미니미와 메시지 남기기";
        form.removeAttribute("aria-busy");
      }
    };
    section.append(form, element("h3", "invitation-guestbook-title", "메시지"), this.messages);
    return section;
  }

  private renderGuests(): void {
    this.wall.replaceChildren(); this.messages.replaceChildren();
    const guests = readGuestMessages();
    const ordered = guests;
    const pageCount = Math.max(1, Math.ceil(ordered.length / GUEST_PHOTO_PAGE_SIZE));
    this.guestPage = Math.min(this.guestPage, pageCount - 1);
    const crowd = element("div", "minimi-crowd");
    const greeting = element("p", "minimi-wall-greeting", guests.length ? "함께해 줘서 고마워요 ♥" : "우리 옆자리는 당신 자리 ♥");
    const count = element("span", "minimi-wall-count", `함께한 친구 ${guests.length}명`);
    this.wall.append(count, greeting, crowd, this.couple());
    this.wall.setAttribute("aria-label", `신랑신부와 함께한 미니미 ${guests.length}명`);
    if (!guests.length) this.messages.append(element("p", "invitation-empty", "첫 번째 메시지를 기다리고 있어요."));
    for (const [index, entry] of ordered.slice(this.guestPage * GUEST_PHOTO_PAGE_SIZE, (this.guestPage + 1) * GUEST_PHOTO_PAGE_SIZE).entries()) {
      const guest = button(`${entry.name}님의 메시지 보기`, () => this.showMessage(entry));
      guest.className = "minimi-guest";
      const position = GUEST_PHOTO_POSITIONS[index];
      guest.style.left = `${position.x}%`;
      guest.style.bottom = `${position.bottom}%`;
      guest.style.zIndex = String(position.depth);
      guest.dataset.guestId = entry.id;
      if (entry.id === this.arrivingGuestId) {
        guest.classList.add("minimi-guest-arriving");
        guest.dataset.newGuest = "true";
        guest.addEventListener("animationend", () => guest.classList.remove("minimi-guest-arriving"), { once: true });
      }
      guest.replaceChildren();
      const canvas = document.createElement("canvas");
      drawMinimi(this.scene, canvas, guestProfile(entry));
      guest.append(canvas); crowd.append(guest);
    }
    this.arrivingGuestId = undefined;
    this.guestPages.replaceChildren();
    this.guestPages.hidden = pageCount === 1;
    if (pageCount > 1) {
      const previous = arrowButton("이전 미니미", -1, () => this.moveGuestPage(-1));
      const next = arrowButton("다음 미니미", 1, () => this.moveGuestPage(1));
      const page = element("span", "", `${this.guestPage + 1} / ${pageCount}`);
      page.setAttribute("aria-live", "polite");
      this.guestPages.append(previous, page, next);
    }
    for (const entry of [...guests].reverse()) {
      const card = button(`${entry.name}님의 미니미와 메시지 보기`, () => this.showMessage(entry));
      card.className = "invitation-message";
      card.dataset.guestId = entry.id;
      const header = element("header");
      header.append(element("strong", "", entry.name), element("time", "", new Date(entry.createdAt).toLocaleDateString("ko-KR")));
      card.replaceChildren(header, element("p", "", entry.message), element("span", "invitation-message-open", "미니미와 함께 보기  ›")); this.messages.append(card);
    }
  }

  private moveGuestPage(offset: number): void {
    const count = Math.max(1, Math.ceil(readGuestMessages().length / GUEST_PHOTO_PAGE_SIZE));
    if (count === 1) return;
    this.guestPage = (this.guestPage + offset + count) % count;
    const focus = document.activeElement?.getAttribute("aria-label");
    this.renderGuests();
    if (focus === "이전 미니미" || focus === "다음 미니미") {
      [...this.guestPages.querySelectorAll("button")].find(button => button.getAttribute("aria-label") === focus)?.focus({ preventScroll: true });
    }
  }

  private couple(): HTMLDivElement {
    const couple = element("div", "minimi-couple");
    for (const [key, name] of [["npc-groom", "재준"], ["npc-bride", "현서"]]) {
      const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 192;
      canvas.setAttribute("aria-label", name!);
      const texture = this.scene.textures.get(key!);
      const frame = texture.get(0);
      const image = texture.getSourceImage() as HTMLCanvasElement;
      canvas.getContext("2d")!.imageSmoothingEnabled = false;
      canvas.getContext("2d")!.drawImage(image, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, 128, 192);
      couple.append(canvas);
    }
    return couple;
  }

  private showMessage(entry: GuestMessage): void {
    const dialog = this.dialog(`${entry.name}님의 메시지`);
    dialog.classList.add("invitation-message-dialog");
    const saved = readGuestMessages();
    const entries = saved.length ? saved : [entry];
    let index = Math.max(0, entries.findIndex(message => message.id === entry.id));
    const title = element("h2", "invitation-ribbon", "메시지");
    const card = element("div", "invitation-message-postcard");
    const portrait = element("div", "invitation-message-portrait");
    const avatar = document.createElement("canvas");
    const from = element("p", "invitation-message-from");
    portrait.append(avatar, from);
    const letter = element("div", "invitation-message-letter");
    const to = element("p", "invitation-message-to");
    const copy = element("p", "invitation-message-copy");
    const date = element("time", "invitation-message-date");
    letter.append(to, copy, date); card.append(portrait, letter);
    const count = element("span", ""); count.setAttribute("aria-live", "polite");
    const move = (offset: number) => {
      index = (index + offset + entries.length) % entries.length;
      const current = entries[index] ?? entry;
      dialog.setAttribute("aria-label", `${current.name}님의 메시지`);
      avatar.setAttribute("aria-label", `${current.name}님의 미니미`);
      avatar.dataset.guestId = current.id;
      drawMinimi(this.scene, avatar, guestProfile(current));
      from.replaceChildren(element("span", "", "FROM."), element("strong", "", current.name));
      to.replaceChildren(document.createTextNode("TO. "), element("strong", "", current.side === "bride" ? "현서" : "재준"));
      copy.textContent = current.message;
      date.textContent = new Date(current.createdAt).toLocaleDateString("ko-KR");
      count.textContent = `${index + 1} / ${Math.max(1, entries.length)}`;
    };
    const controls = element("div", "invitation-message-controls");
    const previous = arrowButton("이전 축하 메시지", -1, () => move(-1));
    const next = arrowButton("다음 축하 메시지", 1, () => move(1));
    previous.disabled = entries.length < 2; next.disabled = entries.length < 2;
    controls.append(previous, count, next);
    dialog.append(title, card, controls);
    horizontalNavigation(dialog, offset => { if (entries.length > 1) move(offset); }, card);
    move(0);
    dialog.showModal();
  }

  private footer(): HTMLElement {
    const footer = element("footer", "invitation-footer");
    footer.append(weddingMonogramElement("p"), element("p", "", "함께해 주시는 모든 마음, 감사히 간직하겠습니다."));
    const actions = element("div", "invitation-actions");
    actions.append(button("링크 복사", () => void this.copy(invitationShareUrl(), "청첩장 링크를 복사했어요.")),
      button("카카오톡으로 전달", () => void this.share()));
    // Load an owned Kakao integration in advance when configured. Keep a working
    // OS-share / copy fallback available while the SDK is unavailable.
    if (kakaoConfigured) void prepareKakaoShare().catch(() => {});
    footer.append(actions, link("원본 청첩장", SOURCE_URL));
    return footer;
  }

  private section(eyebrow: string, title: string, id?: string): HTMLElement {
    const section = element("section", "invitation-section");
    if (id) section.id = id;
    section.append(element("span", "invitation-pixel-heart", "♥"), element("p", "invitation-eyebrow", eyebrow), element("h2", "", title));
    return section;
  }

  private dialog(label: string): HTMLDialogElement {
    const dialog = element("dialog", "invitation-dialog");
    dialog.setAttribute("aria-label", label);
    const close = button("닫기", () => dialog.close()); close.className = "invitation-dialog-close";
    dialog.append(close);
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { this.dialogs.delete(dialog); dialog.remove(); });
    this.dialogs.add(dialog); this.root.append(dialog);
    return dialog;
  }

  private async copy(value: string, success: string): Promise<void> {
    try { await navigator.clipboard.writeText(value); this.notify(success); }
    catch {
      const dialog = this.dialog("복사할 내용을 길게 눌러 선택해 주세요");
      const field = document.createElement("textarea"); field.value = value; field.readOnly = true;
      dialog.append(element("p", "", "내용을 길게 눌러 복사해 주세요."), field); dialog.showModal(); field.select();
    }
  }

  private async share(): Promise<void> {
    const url = invitationShareUrl();
    try { sendKakaoInvitation(); return; } catch { /* Use the device's share sheet or copy. */ }
    if (navigator.share) {
      try { await navigator.share({ title: WEDDING_METADATA.shareTitle, text: WEDDING_METADATA.shareCopy, url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    await this.copy(`${WEDDING_METADATA.shareTitle}\n${url}`, "카카오톡 대화방에 붙여넣을 청첩장 링크를 복사했어요.");
  }

  private notify(copy: string): void {
    window.clearTimeout(this.toastTimer);
    this.toast.textContent = copy; this.toast.hidden = false;
    this.toastTimer = window.setTimeout(() => { this.toast.hidden = true; }, 3200);
  }

  private readonly onStorage = (): void => this.renderGuests();

  destroy(): void {
    this.stopAmbience?.();
    this.stopPhotoPreparation?.();
    this.countdown?.destroy();
    this.picker?.destroy();
    window.removeEventListener("storage", this.onStorage);
    window.clearTimeout(this.toastTimer);
    for (const dialog of this.dialogs) dialog.close();
    this.root.remove();
    if (this.app) { this.app.inert = false; this.app.style.visibility = ""; }
  }
}

function element<Tag extends keyof HTMLElementTagNameMap>(tag: Tag, className = "", text?: string): HTMLElementTagNameMap[Tag] {
  const node = document.createElement(tag); node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, action: () => void): HTMLButtonElement {
  const node = element("button", "", label); node.type = "button"; node.setAttribute("aria-label", label); node.addEventListener("click", action); return node;
}

function link(label: string, href: string): HTMLAnchorElement {
  const anchor = element("a", "", label); anchor.href = href; anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; return anchor;
}

function picture(file: string, alt: string, lazy = true): HTMLImageElement {
  const image = document.createElement("img"); image.src = invitationPhotoUrl(file); image.alt = alt;
  const display = invitationPhoto(file);
  if (display) { image.width = display.width; image.height = display.height; }
  image.loading = lazy ? "lazy" : "eager"; image.decoding = "async";
  return image;
}

function appendParagraphs(parent: HTMLElement, html: string): void {
  const document = new DOMParser().parseFromString(html, "text/html");
  for (const paragraph of document.querySelectorAll("p")) {
    const copy = paragraph.textContent?.trim(); if (copy) parent.append(element("p", "", copy));
  }
}

function fieldLabel(copy: string, input: HTMLElement): HTMLLabelElement {
  const label = element("label", "", copy); input.setAttribute("aria-label", copy); label.append(input); return label;
}

function galleryFile(index: number): string { return source.galleryFiles[index - 1]!.localFile; }
function validStyle(value?: number): number { return value === 1 || value === 2 ? value : 0; }

function guestProfile(entry: GuestMessage): MinimiProfile {
  return { gender: entry.gender === "female" ? "female" : "male", outfit: validOutfit(entry.outfit), hair: validStyle(entry.hair), face: validStyle(entry.face) };
}

function arrowButton(label: string, direction: -1 | 1, action: () => void): HTMLButtonElement {
  const arrow = button(label, action);
  arrow.className = `invitation-pixel-arrow ${direction === -1 ? "is-previous" : "is-next"}`;
  arrow.textContent = direction === -1 ? "◀" : "▶";
  return arrow;
}

function horizontalNavigation(keyboard: HTMLElement, move: (offset: number) => void, surface: HTMLElement): void {
  keyboard.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  let start: { x: number; y: number } | undefined;
  let suppressClickUntil = 0;
  surface.addEventListener("pointerdown", event => { start = { x: event.clientX, y: event.clientY }; });
  surface.addEventListener("pointercancel", () => { start = undefined; });
  surface.addEventListener("pointerup", event => {
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = undefined;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil = Date.now() + 350; move(dx < 0 ? 1 : -1);
    }
  });
  surface.addEventListener("click", event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, true);
}
