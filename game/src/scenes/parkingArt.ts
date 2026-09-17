import Phaser from "phaser";
import { parkingCarTexture } from "../ui/parkingCar";

export const TOWER_PARKING_BAY = { x: 260, y: 636, width: 200, height: 240, carY: 760 } as const;

/** A mechanical parking tower with one entry platform, rather than a through aisle. */
function towerParkingArt(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const art = scene.add.graphics();
  art.fillStyle(0xa5aca0).fillRect(0, 0, 720, 1280);
  art.fillStyle(0x7e8a7d).fillRect(0, 910, 720, 370);
  for (let y = 930; y < 1280; y += 44) {
    for (let x = 12; x < 720; x += 48) art.fillStyle(0xc2c6b2, .2).fillRect(x + y % 19, y, 5, 4);
  }
  // Stacked storage bays and steel cross-members read as a tower at mobile scale.
  art.fillStyle(0x263d35).fillRect(104, 124, 512, 786);
  art.fillStyle(0xd3d1bb).fillRect(116, 136, 488, 756);
  for (const y of [266, 434]) {
    for (const x of [148, 378]) {
      art.fillStyle(0x43584b).fillRect(x, y, 194, 138);
      art.fillStyle(0x263d35).fillRect(x + 8, y + 8, 178, 104);
      art.fillStyle(0x6f8170).fillRect(x + 14, y + 24, 166, 8).fillRect(x + 14, y + 76, 166, 8);
      art.fillStyle(0x9aab92).fillRect(x + 4, y + 112, 186, 12);
      art.fillStyle(0x263d35).fillRect(x + 4, y + 124, 186, 10);
    }
    art.fillStyle(0x879681).fillRect(130, y + 142, 460, 12);
  }
  art.fillStyle(0x3d5646).fillRect(136, 590, 448, 302);
  const { x, y, width, height } = TOWER_PARKING_BAY;
  art.fillStyle(0x1e342c).fillRect(x - 12, y - 12, width + 24, height + 24);
  art.fillStyle(0x53665a).fillRect(x, y, width, height);
  art.fillStyle(0x718276).fillRect(x + 16, y + 10, width - 32, height - 10);
  art.fillStyle(0xe9deaf).fillRect(x + 20, y + 28, 4, height - 40).fillRect(x + width - 24, y + 28, 4, height - 40);
  art.fillStyle(0xc5b88a).fillRect(x, y + height, width, 10);
  for (const side of [x - 28, x + width + 12]) {
    art.fillStyle(0x24392e).fillRect(side, y, 16, height);
    for (let stripe = 0; stripe < 6; stripe++) art.fillStyle(0xd9bf65).fillRect(side, y + stripe * 40, 16, 18);
  }
  art.fillStyle(0xde8fad).fillRect(350, 894, 20, 386);
  for (const arrowY of [948, 1148]) {
    art.fillStyle(0xde8fad).fillRect(330, arrowY, 60, 10).fillRect(340, arrowY - 10, 40, 10).fillRect(350, arrowY - 20, 20, 10);
  }
  art.fillStyle(0x263d35).fillRect(188, 166, 344, 68);
  art.lineStyle(4, 0xde8fad).strokeRect(188, 166, 344, 68);
  const title = scene.add.text(360, 200, "타워주차장", { fontFamily: "Galmuri11, monospace", fontSize: "32px", color: "#fff7df", resolution: 3 }).setOrigin(.5);
  const entry = scene.add.text(360, 608, "입고", { fontFamily: "Galmuri11, monospace", fontSize: "20px", color: "#fff7df", resolution: 3 }).setOrigin(.5);
  // Separate foreground shutter closes only after the player's car is inside.
  const gate = scene.add.graphics({ x, y }).setName("tower-parking-gate").setDepth(4).setScale(1, 0);
  gate.fillStyle(0x718276).fillRect(0, 0, width, height);
  for (let row = 0; row < height; row += 20) {
    gate.fillStyle(0xa3af96).fillRect(0, row, width, 4);
    gate.fillStyle(0x405548).fillRect(0, row + 16, width, 4);
  }
  gate.fillStyle(0xde8fad).fillRect(0, height - 10, width, 10);
  return scene.add.container(0, 0, [art, title, entry]).setDepth(2).setName("parking-floor");
}

/** Flat pixel parking floor; the original 180 × 140 bays and driving aisle stay in place. */
export function parkingArt(scene: Phaser.Scene, lane: number): Phaser.GameObjects.Container {
  if (lane === 1) return towerParkingArt(scene);
  const floor = scene.add.graphics();
  const warm = lane === 1;
  const paint = [0xe5c34e, 0xde8fad, 0x5793d7][lane] ?? 0x5793d7;
  floor.fillStyle(warm ? 0x98988c : 0x76817b).fillRect(0, 0, 720, 1280);
  // Small broken aggregate marks give the concrete a pixel texture without a heavy grid.
  for (let y = 290; y < 1280; y += 24) {
    for (let x = 8; x < 720; x += 28) {
      const seed = (x * 17 + y * 31) % 97;
      floor.fillStyle(seed % 2 ? 0xc5cbbd : 0x465b53, 0.12);
      floor.fillRect(x + seed % 13, y + seed % 9, 3 + seed % 5, 3);
    }
  }
  floor.fillStyle(0x65726a, 0.45).fillRect(252, 280, 216, 1000);
  // Back wall, shallow curb, and two long fluorescent fixtures.
  floor.fillStyle(0x344b43).fillRect(0, 0, 720, 276);
  floor.fillStyle(0x4c6559).fillRect(0, 66, 720, 16).fillRect(0, 246, 720, 22);
  floor.fillStyle(0x293e36).fillRect(0, 276, 720, 16);
  floor.fillStyle(0xb5bcac).fillRect(0, 292, 720, 12);
  for (const x of [42, 510]) {
    floor.fillStyle(0x20382f).fillRect(x - 5, 102, 178, 20);
    floor.fillStyle(0xe2e9d6).fillRect(x, 104, 168, 8);
    floor.fillStyle(0xf8f6dc).fillRect(x + 4, 104, 160, 4);
  }
  // Wheel stops and restrained bay numbers sit inside the unchanged parking rectangles.
  const labels: Phaser.GameObjects.Text[] = [];
  for (let row = 450, index = 1; row < 1200; row += 180, index += 1) {
    for (const left of [32, 508]) {
      floor.fillStyle(0x9ba598, 0.16).fillRect(left + 4, row + 4, 172, 132);
      floor.lineStyle(5, 0xeee9d6).strokeRect(left, row, 180, 140);
      const stopX = left === 32 ? left + 15 : left + 149;
      floor.fillStyle(0x40534b).fillRect(stopX + 4, row + 35, 16, 78);
      floor.fillStyle(0x283c34).fillRect(stopX, row + 30, 16, 78);
      for (let stripe = 0; stripe < 3; stripe += 1) {
        floor.fillStyle(0xdfc45e).fillRect(stopX, row + 34 + stripe * 26, 16, 12);
      }
      labels.push(scene.add.text(left + 90, row + 119, `${left === 32 ? "A" : "B"}${String(index).padStart(2, "0")}`, {
        fontFamily: "Galmuri11, monospace", fontSize: "14px", color: "#dce1d1",
      }).setOrigin(0.5));
    }
  }
  // Edge columns and drains repeat between bays, outside the car's route.
  for (const y of [372, 604, 964]) {
    for (const x of [10, 682]) {
      floor.fillStyle(0x40544a).fillRect(x + 4, y + 6, 28, 46);
      floor.fillStyle(0xb9c1af).fillRect(x, y, 28, 42);
      floor.fillStyle(0xdddcc4).fillRect(x, y, 28, 8);
      floor.fillStyle(0x354b3e).fillRect(x, y + 24, 28, 12);
      floor.fillStyle(0xe1c566).fillRect(x, y + 24, 10, 12).fillRect(x + 20, y + 24, 8, 12);
    }
  }
  for (const x of [232, 476]) {
    floor.fillStyle(0x4c6055).fillRect(x, 330, 8, 930);
    for (let y = 334; y < 1260; y += 12) floor.fillStyle(0x97a292).fillRect(x, y, 8, 3);
  }
  floor.fillStyle(paint).fillRect(345, 320, 30, 960);
  floor.fillStyle(0xf1eeda, 0.65).fillRect(345, 320, 4, 960);
  for (const y of [420, 820, 1160]) {
    floor.fillStyle(paint).fillRect(321, y, 78, 12).fillRect(329, y - 10, 62, 10).fillRect(339, y - 20, 42, 10).fillRect(350, y - 30, 20, 10);
  }
  const cars = [{ x: 602, y: 512, tint: 0xffffff }, { x: 126, y: 872, tint: 0x91a6ab }].map(car =>
    scene.add.image(car.x, car.y, parkingCarTexture(scene)).setScale(2).setAngle(-90).setTint(car.tint));
  const heading = scene.add.text(360, 54, "주차 안내도", {
    fontFamily: "Galmuri11, monospace", fontSize: "34px", color: "#fffaf2", resolution: 3,
  }).setOrigin(0.5);
  floor.fillStyle(0x1f3a30).fillRect(250, 126, 220, 112);
  floor.lineStyle(4, paint).strokeRect(250, 126, 220, 112);
  const sign = scene.add.text(360, 180, ["이마트", "타워주차장", "B3"][lane] ?? "B3", {
    fontFamily: "Galmuri11, monospace", fontSize: lane === 1 ? "32px" : "44px", color: "#fffaf2", resolution: 3,
  }).setOrigin(0.5);
  return scene.add.container(0, 0, [floor, ...labels, ...cars, sign, heading]).setDepth(2).setName("parking-floor");
}
