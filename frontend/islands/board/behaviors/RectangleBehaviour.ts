import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";
import { getRectangle, getSquare } from "./geometry_utils.ts";

export class RectangleBehavior implements Behavior {
  private shift = false;
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

  setShift(value: boolean): void {
    this.shift = value;
  }

  private getLine() {
    return new Line(
      0,
      this.ctx.settings.size.peek(),
      this.ctx.settings.color.peek(),
      this.shift
        ? getSquare(this.startPoint, this.endPoint)
        : getRectangle(this.startPoint, this.endPoint),
    );
  }
}
