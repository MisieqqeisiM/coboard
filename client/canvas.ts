import { Line, Point } from "../liaison/liaison.ts";

export interface DrawableCanvas {
  delta: Point;
  setTmpLine(line: Line | null): void;
  setSelected(lines: Line[]): void;
  getSelected(): Map<number, Line>;
  stopDrawing(): void;
  redraw(): void;
}

export interface ObservableCanvas {
  addLines(lines: Line[]): void;
  removeLines(ids: number[]): void;
  reset(): void;
}
