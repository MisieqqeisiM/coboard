import {
  lineIntersectsRect,
  squaredDistanceToLine,
} from "../frontend/islands/board/webgl-utils/line_drawing.ts";
import { Line, Point } from "../liaison/liaison.ts";
import { ObservableCanvas } from "./canvas.ts";

export class LineCache {
  localIds: number[] = [];
  id = 0;
  lines = new Map<number, Line>();

  public constructor(lines: Line[], private canvas: ObservableCanvas) {
    for (const line of lines) this.lines.set(line.id, line);
  }

  public getLines() {
    return this.lines.values();
  }

  public getLineAt(point: Point): Line | null {
    let bestLine: Line | null = null;
    for (const line of this.lines.values()) {
      if (
        squaredDistanceToLine(point, line.coordinates) < line.width * line.width
      ) {
        bestLine = line;
      }
    }
    return bestLine;
  }

  public getLinesInRect(r1: Point, r2: Point): Line[] {
    let result: Line[] = [];
    for (const line of this.lines.values()) {
      if (lineIntersectsRect(line, r1, r2)) {
        result.push(line);
      }
    }
    return result;
  }

  public addLocalLine(line: Line): Line {
    this.id -= 1;
    this.localIds.push(this.id);
    const newLine = Line.changeId(line, this.id);
    this.lines.set(this.id, newLine);
    this.canvas.addLine(newLine);
    return newLine;
  }

  public addRemoteLine(line: Line) {
    this.lines.set(line.id, line);
    this.canvas.addLine(line);
  }

  public removeLine(id: number): Line | null {
    const line = this.lines.get(id);
    if (!line) return null;
    this.lines.delete(id);
    this.canvas.removeLine(id);
    return line;
  }

  public reset() {
    this.lines.clear();
    this.canvas.reset();
  }

  public confirmLine(id: number) {
    const oldId = this.localIds.shift()!;
    const line = this.lines.get(oldId);
    if (!line) return;
    this.removeLine(oldId);
    this.addRemoteLine(Line.changeId(line, id));
  }
}
