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
  idMap = new Map<number, number>();

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
    let result: Line[] = [];
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

  public addLocalLine(line: Line): Line {
    this.id -= 1;
    this.localIds.push(this.id);
    const newLine = Line.changeId(line, this.id);
    this.lines.set(this.id, newLine);
    this.canvas.addLines([newLine]);
    return newLine;
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

  public globalId(id: number) {
    while (this.idMap.has(id)) {
      id = this.idMap.get(id)!;
    }
    return id;
  }

  public removeLines(ids: number[]): Line[] {
    const removedLines: Line[] = [];
    const newIds = [];
    for (const id of ids) {
      const line = this.lines.get(this.globalId(id));
      if (!line) continue;
      this.lines.delete(this.globalId(id));
      removedLines.push(line);
      newIds.push(this.globalId(id));
    }
    this.canvas.removeLines(newIds);
    return removedLines;
  }

  private removeLinesByLocalId(ids: number[]) {
    const removedLines: Line[] = [];
    for (const id of ids) {
      const line = this.lines.get(id);
      if (!line) continue;
      this.lines.delete(id);
      removedLines.push(line);
    }
    this.canvas.removeLines(ids);
    return removedLines;
  }

  public getLine(id: number): Line | null {
    return this.lines.get(id) ?? null;
  }

  public reset() {
    this.lines.clear();
    this.canvas.reset();
  }

  public getUniqueId(): number {
    return --this.id;
  }

  public confirmLines(ids: number[]) {
    const toRemove: number[] = [];
    for (const id of ids) {
      const oldId = this.localIds.shift()!;
      const line = this.lines.get(oldId);
      if (!line) return;
      toRemove.push(oldId);
      this.idMap.set(oldId, id);
    }
    this.removeLinesByLocalId(toRemove);
  }
}
