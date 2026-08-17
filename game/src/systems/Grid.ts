export type GridCell = { row: number; col: number };

export type GridConfig = {
  cols: number;
  rows: number;
  cellSize: number;
  originX: number;
  originY: number;
  walkable: boolean[][]; // [row][col]
};

const cellKey = (row: number, col: number) => `${row},${col}`;

export class Grid {
  private readonly config: GridConfig;

  constructor(config: GridConfig) {
    this.config = config;
  }

  worldToCell(x: number, y: number): GridCell {
    const { originX, originY, cellSize } = this.config;
    return {
      row: Math.floor((y - originY) / cellSize),
      col: Math.floor((x - originX) / cellSize),
    };
  }

  cellToWorld(row: number, col: number): { x: number; y: number } {
    const { originX, originY, cellSize } = this.config;
    return {
      x: originX + col * cellSize + cellSize / 2,
      y: originY + row * cellSize + cellSize / 2,
    };
  }

  isWalkable(row: number, col: number): boolean {
    const { rows, cols, walkable } = this.config;
    return row >= 0 && row < rows && col >= 0 && col < cols && walkable[row][col];
  }

  /** BFS shortest path on the walkable grid. Returns cells including start and end, or [] if unreachable. */
  findPath(from: GridCell, to: GridCell): GridCell[] {
    if (!this.isWalkable(to.row, to.col)) return [];

    const visited = new Set<string>([cellKey(from.row, from.col)]);
    const cameFrom = new Map<string, GridCell>();
    const queue: GridCell[] = [from];
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.row === to.row && current.col === to.col) break;

      for (const { dr, dc } of directions) {
        const next = { row: current.row + dr, col: current.col + dc };
        const key = cellKey(next.row, next.col);
        if (!this.isWalkable(next.row, next.col) || visited.has(key)) continue;
        visited.add(key);
        cameFrom.set(key, current);
        queue.push(next);
      }
    }

    if (!visited.has(cellKey(to.row, to.col))) return [];

    const path: GridCell[] = [];
    let step: GridCell | undefined = to;
    while (step) {
      path.unshift(step);
      step = cameFrom.get(cellKey(step.row, step.col));
    }
    return path;
  }
}
