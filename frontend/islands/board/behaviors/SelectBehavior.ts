import { Color } from "../../../../client/settings.ts";
import { Line, Point } from "../../../../liaison/liaison.ts";
import { pointInLine } from "../webgl-utils/line_drawing.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";
import { getRectangle } from "./geometry_utils.ts";

export class SelectBehavior implements Behavior {
  private corner: Point = { x: 0, y: 0 };
  private moved: boolean = false;

  constructor(private ctx: BehaviorContext) {}

  setShift(_: boolean): void {}

  toolCancel(): void {
    this.ctx.client.socket.deselectAll();
  }

  toolStart(point: Point): void {
    this.corner = point;
    this.moved = false;
    this.ctx.canvas.setTmpLine(null);
  }

  toolMove(point: Point): void {
    this.moved = true;
    this.ctx.canvas.setTmpLine(this.getLine(point));
    const lines = this.ctx.client.ui.cache.getLinesInRect(this.corner, point);
    this.ctx.client.socket.select(lines);
  }

  toolEnd(): void {
    this.ctx.canvas.setTmpLine(null);
    if (!this.moved) {
      for (const line of this.ctx.client.ui.selection.peek().values()) {
        if (pointInLine(this.corner, line)) {
          this.ctx.client.socket.deselect([line]);
          return;
        }
      }
      const line = this.ctx.client.ui.cache.getLineAt(this.corner);
      if (line) {
        this.ctx.client.socket.select([line]);
      } else {
        this.toolCancel();
      }
    }
  }

  private getLine(point: Point) {
    return new Line(
      0,
      10,
      Color.BLACK,
      getRectangle(this.corner, point),
    );
  }
}
