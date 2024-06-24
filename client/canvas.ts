import { Line } from "../liaison/liaison.ts";

export interface DrawableCanvas {
  setTmpLine(line: Line | null): void;
  stopDrawing(): void;
  redraw(): void;
}

export interface ObservableCanvas {
  addLines(line: Line[]): void;
  removeLines(ids: number[]): void;
  reset(): void;
}
