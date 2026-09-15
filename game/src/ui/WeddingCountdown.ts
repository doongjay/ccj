import { reducedMotion, subscribeMotion } from "./motionPreference";
import { invitationPhotoUrl } from "./invitationPhotos";
const DAY = 86400000;
const KST = 9 * 3600000;

/** The original photo-backed countdown, with the invitation's pixel typography. */
export class WeddingCountdown {
  readonly element = document.createElement("div");
  private readonly heading = document.createElement("p");
  private readonly units: HTMLSpanElement[] = [];
  private readonly interval: number;
  private readonly observer: IntersectionObserver;
  private readonly stopMotion: () => void;
  private visible = false;
  private readonly weddingTime: number;

  constructor(weddingTime: number, scrollRoot: HTMLElement) {
    this.weddingTime = weddingTime;
    this.element.className = "invitation-countdown";
    const photo = document.createElement("img");
    photo.src = invitationPhotoUrl("timer.jpg");
    photo.alt = "나란히 앉아 함께하는 재준과 현서";
    photo.loading = "lazy";
    const content = document.createElement("div");
    content.className = "invitation-countdown-content";
    this.heading.className = "invitation-countdown-heading";
    const timer = document.createElement("div");
    timer.className = "invitation-countdown-units";
    timer.setAttribute("role", "timer");
    timer.setAttribute("aria-live", "off");
    timer.setAttribute("aria-label", "결혼식까지 남은 시간");
    for (const label of ["DAYS", "HOURS", "MINUTES", "SECONDS"]) {
      const unit = document.createElement("div");
      unit.className = "invitation-countdown-unit";
      const number = document.createElement("span");
      number.className = "invitation-countdown-number";
      number.dataset.unit = label.toLowerCase();
      const caption = document.createElement("span");
      caption.className = "invitation-countdown-label";
      caption.textContent = label;
      unit.append(number, caption);
      timer.append(unit);
      this.units.push(number);
    }
    content.append(this.heading, timer);
    this.element.append(photo, content);
    this.update();
    this.interval = window.setInterval(() => this.update(), 1000);
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries.some(entry => entry.isIntersecting);
      if (this.visible) this.element.classList.add("is-visible");
    }, { root: scrollRoot, threshold: 0.15 });
    this.observer.observe(this.element);
    this.stopMotion = subscribeMotion(() => {
      if (reducedMotion()) this.units.forEach(number => number.getAnimations().forEach(animation => animation.cancel()));
    });
  }

  private update(): void {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.weddingTime - now) / 1000));
    const days = Math.floor((this.weddingTime + KST) / DAY) - Math.floor((now + KST) / DAY);
    this.heading.textContent = days > 0 ? `재준 ♥ 현서 결혼식이 ${days}일 남았습니다`
      : days === 0 ? "오늘, 재준 ♥ 현서 결혼합니다" : "함께해 주셔서 감사합니다";
    const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
    for (const [index, number] of this.units.entries()) {
      const value = String(values[index]).padStart(2, "0");
      if (number.textContent === value) continue;
      number.textContent = value;
      if (this.visible && !reducedMotion()) {
        number.getAnimations().forEach(animation => animation.cancel());
        number.animate([{ transform: "translateY(0.28em)", opacity: 0.4 }, { transform: "translateY(0)", opacity: 1 }], { duration: 380, easing: "ease-out" });
      }
    }
  }

  destroy(): void {
    this.stopMotion();
    window.clearInterval(this.interval);
    this.observer.disconnect();
    this.units.forEach(number => number.getAnimations().forEach(animation => animation.cancel()));
  }
}
