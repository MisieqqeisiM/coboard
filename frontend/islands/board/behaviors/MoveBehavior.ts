import { Line, Point } from "../../../../liaison/liaison.ts";
import { pointInLine } from "../webgl-utils/line_drawing.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";
import { Color } from "../../../../client/settings.ts";
import { getRectangle } from "./geometry_utils.ts";

export class MoveBehavior implements Behavior {
  private movedLine: Line | null = null;
  private lastPoint: Point = { x: 0, y: 0 };
  private moveSelection: boolean = false;
  private moved: boolean = false;
  private corner: Point = { x: 0, y: 0 };
  private shift = false;

  constructor(private ctx: BehaviorContext) {
    this.ctx.canvas.setTmpLine(null);
  }

  toolCancel(): void {
    this.movedLine = null;
    this.moveSelection = false;
    this.ctx.canvas.setTmpLine(null);
    this.ctx.client.socket.deselectAll();
  }

  toolStart(point: Point): void {
    this.lastPoint = point;
    if (this.shift) {
      this.moveSelection = false;
      this.movedLine = null;
      this.corner = point;
      this.moved = false;
      this.ctx.canvas.setTmpLine(null);
      return;
    }

    for (const line of this.ctx.client.ui.selection.peek().values()) {
      if (pointInLine(point, line)) {
        this.moveSelection = true;
        return;
      }
    }
    this.ctx.client.socket.deselectAll();
    this.movedLine = this.ctx.client.ui.cache.getLineAt(point);
    if (this.movedLine) {
      this.ctx.client.ui.canvas.removeLines([this.movedLine.id]);
      this.ctx.canvas.setTmpLine(this.movedLine);
    } else {
      this.corner = point;
      this.moved = false;
      this.ctx.canvas.setTmpLine(null);
    }
  }

  toolMove(point: Point): void {
    this.moved = true;
    const diff = {
      x: point.x - this.lastPoint.x,
      y: point.y - this.lastPoint.y,
    };
    this.lastPoint = point;
    if (this.moveSelection) {
      const newSelection: Map<number, Line> = new Map();
      for (const line of this.ctx.client.ui.selection.peek().values()) {
        newSelection.set(line.id, Line.move(line, diff));
      }
      this.ctx.client.ui.selection.value = newSelection;
      return;
    } else if (this.movedLine) {
      this.movedLine = Line.move(this.movedLine, diff);
      this.ctx.canvas.setTmpLine(this.movedLine);
    } else {
      this.ctx.canvas.setTmpLine(this.getLine(point));
      const lines = this.ctx.client.ui.cache.getLinesInRect(this.corner, point);
      this.ctx.client.socket.select(lines);
    }
  }

  setShift(value: boolean): void {
    this.shift = value;
  }

  private selectionClick() {
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

  toolEnd(): void {
    this.moveSelection = false;
    if (!this.moved) this.selectionClick();
    this.ctx.canvas.setTmpLine(null);
    if (this.movedLine) {
      this.ctx.client.socket.update([this.movedLine.id], [this.movedLine]);
      this.movedLine = null;
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
