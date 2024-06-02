import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class MoveBehavior implements Behavior {
  private movedLine: Line | null = null;
  private lastPoint: Point = { x: 0, y: 0 };

  constructor(private ctx: BehaviorContext) {}

  toolCancel(): void {
    this.movedLine = null;
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    this.movedLine = this.ctx.client.ui.cache.getLineAt(point);
    this.lastPoint = point;
    if (!this.movedLine) return;
    this.ctx.client.socket.remove(this.movedLine.id);
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  toolMove(point: Point): void {
    if (!this.movedLine) return;
    this.movedLine = Line.move(this.movedLine, {
      x: point.x - this.lastPoint.x,
      y: point.y - this.lastPoint.y,
    });
    this.lastPoint = point;
    this.ctx.canvas.setTmpLine(this.movedLine);
  }

  setShift(value:boolean): void { }
  toolEnd(): void {
    if (!this.movedLine) return;
    this.ctx.client.socket.draw(this.movedLine);
    this.movedLine = null;
    this.ctx.canvas.setTmpLine(null);
  }
}
