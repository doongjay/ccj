import { expect, test } from "@playwright/test";
import { crossesObstacle, findWalkPath } from "../src/systems/walkPath";

test("walk path follows open floor instead of crossing the escalator", () => {
  const start = { x: 360, y: 1060 };
  const end = { x: 360, y: 460 };
  const bounds = { x: 50, y: 50, width: 620, height: 1180 };
  const obstacles = [{ x: 275, y: 470, width: 166, height: 245 }];
  const path = findWalkPath(start, end, bounds, obstacles);
  expect(path.length).toBeGreaterThan(1);
  expect(path.at(-1)).toEqual(end);
  let previous = start;
  for (const point of path) {
    expect(crossesObstacle(previous, point, obstacles)).toBe(false);
    previous = point;
  }
});

test("unreachable destinations do not produce a route through walls", () => {
  expect(findWalkPath({ x: 100, y: 100 }, { x: 300, y: 300 }, { x: 0, y: 0, width: 500, height: 500 }, [{ x: 250, y: 250, width: 100, height: 100 }])).toEqual([]);
});
