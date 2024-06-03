import { Line, Point } from "../../../../liaison/liaison.ts";
import { pointInLine } from "../webgl-utils/line_drawing.ts";
import { lineIntersectsRect } from "../webgl-utils/line_drawing.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class SelectBehavior implements Behavior {
  private corner: Point = { x: 0, y: 0 };
  private moved: boolean = false;

  constructor(private ctx: BehaviorContext) {}

  toolCancel(): void {
    for (const line of this.ctx.canvas.getSelected()) {
      this.ctx.client.socket.draw(line);
    }
    this.ctx.canvas.setSelected([]);
  }

  toolStart(point: Point): void {
    this.corner = point;
    this.moved = false;
  }

  toolMove(point: Point): void {
    this.moved = true;
    const lines = this.ctx.client.ui.cache.getLinesInRect(this.corner, point);
    for (const line of lines) this.ctx.client.socket.remove(line.id);
    const selected = this.ctx.canvas.getSelected().concat(lines);
    this.ctx.canvas.setSelected(selected);
  }

  toolEnd(): void {
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
}
