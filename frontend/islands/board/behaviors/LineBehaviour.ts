import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";
import { getLine } from "./geometry_utils.ts";

export class LineBehavior implements Behavior {
  private startPoint: Point | null = null;
  private endPoint: Point | null = null;
  constructor(private ctx: BehaviorContext) {
    this.ctx.client.socket.deselectAll();
  }
  toolCancel(): void {
    this.startPoint = null;
    this.endPoint = null;
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    this.startPoint = point;
    this.ctx.canvas.setTmpLine(this.getLine());
  }

  toolMove(point: Point): void {
    this.endPoint = point;
    this.ctx.canvas.setTmpLine(this.getLine());
  }

  toolEnd(): void {
    this.ctx.client.socket.draw(this.getLine());
    this.toolCancel();
  }

  setShift(value: boolean): void {}
  private getLine() {
    return new Line(
      0,
      this.ctx.settings.size.peek(),
      this.ctx.settings.color.peek(),
      getLine(this.startPoint, this.endPoint),
    );
  }
}
