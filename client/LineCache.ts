import {
  lineIntersectsRect,
  linesIntersect,
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

  public getLinesIntersecting(line: Line): Line[] {
    const result: Line[] = [];
    for (const other of this.lines.values()) {
      if (
        linesIntersect(line.coordinates, other.coordinates, line.width)
      ) {
        result.push(other);
      }
    }
    return result;
  }

  public getLinesInRect(r1: Point, r2: Point): Line[] {
    const result: Line[] = [];
    for (const line of this.lines.values()) {
      if (lineIntersectsRect(line, r1, r2)) {
        result.push(line);
      }
    }
    return result;
  }

  public addLocalLines(lines: Line[]): Line[] {
    const newLines: Line[] = [];
    for (const line of lines) {
      this.id -= 1;
      this.localIds.push(this.id);
      const newLine = Line.changeId(line, this.id);
      this.lines.set(this.id, newLine);
      newLines.push(newLine);
    }
    this.canvas.addLines(newLines);
    return newLines;
  }

  public addRemoteLines(lines: Line[]) {
    for (const line of lines) {
      this.lines.set(line.id, line);
    }
    this.canvas.addLines(lines);
  }

  public removeLines(ids: number[]): Line[] {
    const result: Line[] = [];
    for (const id of ids) {
      const line = this.lines.get(id);
      if (!line) continue;
      this.lines.delete(id);
      result.push(line);
    }
    this.canvas.removeLines(ids);
    return result;
  }

  public reset() {
    this.lines.clear();
    this.canvas.reset();
  }

  public confirmLine(_id: number) {
    const oldId = this.localIds.shift()!;
    const line = this.lines.get(oldId);
    if (!line) return;
    this.removeLines([oldId]);
    // this.addRemoteLine(Line.changeId(line, id));
  }
}
