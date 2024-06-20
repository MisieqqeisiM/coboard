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
    this.ctx.client.socket.beginAction();

    this.ctx.canvas.stopDrawing();
    this.ctx.client.socket.deselect(
      Array.from(this.ctx.canvas.getSelected().values()).map((l) => l.id),
    );
    this.ctx.canvas.setSelected([]);
    this.ctx.canvas.redraw();
    this.ctx.client.socket.endAction();
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
    this.ctx.client.socket.select(lines.map((l) => l.id));
    for (const line of lines) {
      this.ctx.canvas.getSelected().set(line.id, line);
    }
    this.ctx.canvas.setSelected(
      Array.from(this.ctx.canvas.getSelected().values()),
    );
  }

  toolEnd(): void {
    this.ctx.canvas.setTmpLine(null);
    if (!this.moved) {
      for (const line of this.ctx.canvas.getSelected().values()) {
        if (pointInLine(this.corner, line)) {
          this.ctx.canvas.getSelected().delete(line.id);
          this.ctx.canvas.setSelected(
            Array.from(this.ctx.canvas.getSelected().values()),
          );
          this.ctx.client.socket.deselect([line.id]);
          return;
        }
      }
      const line = this.ctx.client.ui.cache.getLineAt(this.corner);
      if (line) {
        this.ctx.canvas.getSelected().set(line.id, line),
          this.ctx.canvas.setSelected(
            Array.from(this.ctx.canvas.getSelected().values()),
          );
        this.ctx.client.socket.select([line.id]);
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
