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
  private selectionEdited = false;

  constructor(private ctx: BehaviorContext) {
    this.ctx.canvas.setTmpLine(null);
    this.ctx.onEnter.value = null;
    this.ctx.onEnter.value = () => this.delete();
    this.ctx.enterText.value = "Delete";
  }
  delete() {
    this.ctx.client.socket.deleteSelection();
  }

  toolCancel(): void {
    this.movedLine = null;
    this.moveSelection = false;
    this.ctx.canvas.setTmpLine(null);
    this.ctx.client.socket.deselectAll();
    this.selectionEdited = false;
  }

  getUnselectedLineAt(point: Point) {
    for (const line of this.ctx.client.ui.cache.getLines()) {
      if (
        pointInLine(point, line) &&
        !this.ctx.client.ui.selection.peek().has(line.id)
      ) {
        return line;
      }
    }
    return null;
  }

  toolStart(point: Point): void {
    this.lastPoint = point;
    this.corner = point;
    this.moved = false;
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
    this.movedLine = this.getUnselectedLineAt(point);
    this.ctx.canvas.setTmpLine(null);
    if (!this.movedLine) {
      this.ctx.client.socket.deselectAll();
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
      this.selectionEdited = true;
      this.ctx.client.ui.selection.value = newSelection;
      return;
    } else if (this.movedLine) {
      this.movedLine = Line.move(this.movedLine, diff);
      this.ctx.client.ui.canvas.removeLines([this.movedLine.id]);
      this.ctx.client.socket.deselectAll();
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
    const line = this.getUnselectedLineAt(this.corner);
    if (line) {
      this.ctx.client.socket.select([line]);
    } else {
      this.toolCancel();
    }
  }

  toolEnd(): void {
    this.moveSelection = false;
    this.ctx.canvas.setTmpLine(null);
    if (!this.moved) {
      this.selectionClick();
      this.movedLine = null;
      return;
    }
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
