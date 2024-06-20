import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class DrawBehavior implements Behavior {
  private points: Point[] = [];
  constructor(private ctx: BehaviorContext) {
    for (const line of this.ctx.canvas.getSelected().values()) {
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
    this.ctx.canvas.setTmpLine(this.getLine());
  }

  toolEnd(): void {
    this.ctx.client.socket.draw(this.getLine());
    this.points = [];
    this.ctx.canvas.setTmpLine(null);
  }

  setShift(value: boolean): void {}
  private getLine() {
    return new Line(
      0,
      this.ctx.settings.size.peek(),
      this.ctx.settings.color.peek(),
      this.points,
    );
  }
}
