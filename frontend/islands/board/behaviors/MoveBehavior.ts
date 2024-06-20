import { Line, Point } from "../../../../liaison/liaison.ts";
import { pointInLine } from "../webgl-utils/line_drawing.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class MoveBehavior implements Behavior {
  private movedLine: Line | null = null;
  private lastPoint: Point = { x: 0, y: 0 };
  private moveSelection: boolean = false;

  constructor(private ctx: BehaviorContext) {
    this.ctx.canvas.setTmpLine(null);
  }

  toolCancel(): void {
    this.movedLine = null;
    this.moveSelection = false;
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    this.lastPoint = point;
    for (const line of this.ctx.client.ui.selection.peek().values()) {
      if (pointInLine(point, line)) {
        this.moveSelection = true;
        return;
      }
    }
    this.ctx.client.socket.deselectAll();
    this.movedLine = this.ctx.client.ui.cache.getLineAt(point);
    if (!this.movedLine) return;
    this.ctx.client.ui.canvas.removeLines([this.movedLine.id]);
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  toolMove(point: Point): void {
    const diff = {
      x: point.x - this.lastPoint.x,
      y: point.y - this.lastPoint.y,
    };
    this.lastPoint = point;
    if (this.moveSelection) {
      const newSelection: Map<number, Line> = new Map();
      for (const line of this.ctx.client.ui.selection.peek().values()) {
        newSelection.set(line.id, Line.move(line, diff));
      }
      this.ctx.client.ui.selection.value = newSelection;
      return;
    }
    if (!this.movedLine) return;
    this.movedLine = Line.move(this.movedLine, diff);
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  setShift(_value: boolean): void {}

  toolEnd(): void {
    this.moveSelection = false;
    if (!this.movedLine) return;
    this.ctx.client.socket.update([this.movedLine.id], [this.movedLine]);
    this.movedLine = null;
    this.ctx.canvas.setTmpLine(null);
  }
}
