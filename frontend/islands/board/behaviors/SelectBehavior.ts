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
    for (const line of this.ctx.canvas.getSelected()) {
      this.ctx.client.socket.draw(line);
    }
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
    for (const line of lines) this.ctx.client.socket.remove(line.id);
    const selected = this.ctx.canvas.getSelected().concat(lines);
    this.ctx.canvas.setSelected(selected);
  }

  toolEnd(): void {
    this.ctx.canvas.setTmpLine(null);
    if (!this.moved) {
      for (const line of this.ctx.canvas.getSelected()) {
        if (pointInLine(this.corner, line)) {
          this.ctx.canvas.setSelected(
            this.ctx.canvas.getSelected().filter((l) => l.id !== line.id),
          );
          this.ctx.client.socket.draw(line);
          return;
        }
      }
      const line = this.ctx.client.ui.cache.getLineAt(this.corner);
      if (line) {
        this.ctx.canvas.setSelected(
          this.ctx.canvas.getSelected().concat([line]),
        );
        this.ctx.client.socket.remove(line.id);
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
