import { Line, Point } from "../../../../liaison/liaison.ts";
import { pointInLine } from "../webgl-utils/line_drawing.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class MoveBehavior implements Behavior {
  private movedLine: Line | null = null;
  private lastPoint: Point = { x: 0, y: 0 };
  private moveSelection: boolean = false;

  constructor(private ctx: BehaviorContext) {}

  toolCancel(): void {
    this.movedLine = null;
    this.moveSelection = false;
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    this.lastPoint = point;
    for (const line of this.ctx.canvas.getSelected()) {
      if (pointInLine(point, line)) {
        this.moveSelection = true;
        return;
      }
    }
    this.movedLine = this.ctx.client.ui.cache.getLineAt(point);
    if (!this.movedLine) {
      for (const line of this.ctx.canvas.getSelected()) {
        this.ctx.client.socket.draw(line);
      }
      this.ctx.canvas.setSelected([]);
      return;
    }
    this.ctx.client.socket.remove(this.movedLine.id);
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  toolMove(point: Point): void {
    const diff = {
      x: point.x - this.lastPoint.x,
      y: point.y - this.lastPoint.y,
    };
    this.lastPoint = point;
    if (this.moveSelection) {
      this.ctx.canvas.setSelected(
        this.ctx.canvas.getSelected().map((l) => Line.move(l, diff)),
      );
      return;
    }
    if (!this.movedLine) return;
    this.movedLine = Line.move(this.movedLine, diff);
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  toolEnd(): void {
    this.moveSelection = false;
    if (!this.movedLine) return;
    this.ctx.client.socket.draw(this.movedLine);
    this.movedLine = null;
    this.ctx.canvas.setTmpLine(null);
  }
}
