import { Color } from "../../../../client/settings.ts";
import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class EraseBehavior implements Behavior {
  private points: Point[] = [];
  constructor(private ctx: BehaviorContext) {
    for (const line of this.ctx.canvas.getSelected()) {
      this.ctx.client.socket.draw(line);
    }
    this.ctx.canvas.setSelected([]);
  }

  toolCancel(): void {
    this.points = [];
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    this.points = [point];
    this.ctx.canvas.setTmpLine(this.getLine());
  }

  toolMove(point: Point): void {
    this.points.push(point);
    const line = this.ctx.client.ui.cache.getLineAt(point);
    if (line) this.ctx.client.socket.remove(line.id);
    this.ctx.canvas.setTmpLine(this.getLine());
  }

  toolEnd(): void {
    this.points = [];
    this.ctx.canvas.setTmpLine(null);
  }

  setShift(value: boolean): void { }
  private getLine() {
    return new Line(
      0,
      this.ctx.settings.size.peek(),
      Color.BLACK,
      this.points,
    );
  }
}
