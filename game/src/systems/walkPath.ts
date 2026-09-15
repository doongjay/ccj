export type WalkPoint = Readonly<{ x: number; y: number }>;
export type WalkRect = Readonly<{ x: number; y: number; width: number; height: number }>;

export function insideFloor(point: WalkPoint, polygon: readonly WalkPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j]!, b = polygon[i]!;
    const cross = (point.x - a.x) * (b.y - a.y) - (point.y - a.y) * (b.x - a.x);
    if (Math.abs(cross) < 0.001 && point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x)
      && point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y)) return true;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Check every interval between boundary crossings, including concave floor edges. */
function staysOnFloor(start: WalkPoint, end: WalkPoint, polygon?: readonly WalkPoint[]): boolean {
  if (!polygon) return true;
  if (!insideFloor(start, polygon) || !insideFloor(end, polygon)) return false;
  const dx = end.x - start.x, dy = end.y - start.y;
  const cuts = [0, 1];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!, b = polygon[(i + 1) % polygon.length]!;
    const ex = b.x - a.x, ey = b.y - a.y;
    const denominator = dx * ey - dy * ex;
    if (Math.abs(denominator) < 0.001) continue;
    const t = ((a.x - start.x) * ey - (a.y - start.y) * ex) / denominator;
    const u = ((a.x - start.x) * dy - (a.y - start.y) * dx) / denominator;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
  }
  cuts.sort((a, b) => a - b);
  return cuts.slice(1).every((t, i) => {
    const middle = (t + cuts[i]!) / 2;
    return insideFloor({ x: start.x + dx * middle, y: start.y + dy * middle }, polygon);
  });
}

export function crossesObstacle(start: WalkPoint, end: WalkPoint, obstacles: readonly WalkRect[]): boolean {
  return obstacles.some((area) => {
    let entry = 0;
    let exit = 1;
    for (const axis of ["x", "y"] as const) {
      const extent = axis === "x" ? area.width : area.height;
      const delta = end[axis] - start[axis];
      if (Math.abs(delta) < 0.001) {
        if (start[axis] < area[axis] || start[axis] > area[axis] + extent) return false;
      } else {
        const near = (area[axis] - start[axis]) / delta;
        const far = (area[axis] + extent - start[axis]) / delta;
        entry = Math.max(entry, Math.min(near, far));
        exit = Math.min(exit, Math.max(near, far));
        if (entry > exit) return false;
      }
    }
    return true;
  });
}

export function findWalkPath(start: WalkPoint, end: WalkPoint, bounds: WalkRect, obstacles: readonly WalkRect[], floor?: readonly WalkPoint[]): WalkPoint[] {
  const clear = (a: WalkPoint, b: WalkPoint) => !crossesObstacle(a, b, obstacles) && staysOnFloor(a, b, floor);
  if (floor && (!insideFloor(start, floor) || !insideFloor(end, floor))) return [];
  if (clear(start, end)) return [end];
  const nodes: WalkPoint[] = [start, end];
  for (const point of floor ?? []) if (!crossesObstacle(point, point, obstacles)) nodes.push(point);
  for (const area of obstacles) {
    for (const position of [
      { x: area.x - 2, y: area.y - 2 },
      { x: area.x + area.width + 2, y: area.y - 2 },
      { x: area.x - 2, y: area.y + area.height + 2 },
      { x: area.x + area.width + 2, y: area.y + area.height + 2 },
    ]) {
      if (position.x >= bounds.x && position.x <= bounds.x + bounds.width
        && position.y >= bounds.y && position.y <= bounds.y + bounds.height
        && (!floor || insideFloor(position, floor)) && !crossesObstacle(position, position, obstacles)) nodes.push(position);
    }
  }
  const distances = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const visited = new Set<number>();
  distances[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    for (let index = 0; index < nodes.length; index += 1) {
      if (!visited.has(index) && (current < 0 || distances[index]! < distances[current]!)) current = index;
    }
    if (current < 0 || !Number.isFinite(distances[current])) return [];
    if (current === 1) {
      const path: WalkPoint[] = [];
      for (let cursor = 1; cursor > 0; cursor = previous[cursor]!) path.unshift(nodes[cursor]!);
      return path;
    }
    visited.add(current);
    for (let next = 0; next < nodes.length; next += 1) {
      if (visited.has(next) || !clear(nodes[current]!, nodes[next]!)) continue;
      const distance = distances[current]! + Math.hypot(nodes[next]!.x - nodes[current]!.x, nodes[next]!.y - nodes[current]!.y);
      if (distance < distances[next]!) {
        distances[next] = distance;
        previous[next] = current;
      }
    }
  }
  return [];
}
