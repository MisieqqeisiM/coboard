import { Line } from "../liaison/liaison.ts";

export interface DrawableCanvas {
  setTmpLine(line: Line | null): void;
  setSelected(lines: Line[]): void;
  getSelected(): Line[];
  stopDrawing(): void;
  redraw(): void;
}

export interface ObservableCanvas {
  addLine(line: Line): void;
  removeLine(id: number): void;
  reset(): void;
}
