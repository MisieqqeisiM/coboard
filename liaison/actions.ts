import { Line } from "./liaison.ts";

export interface BoardActionVisitor {
  move(action: MoveAction): void;
  draw(action: DrawAction): void;
  remove(action: RemoveAction): void;
  reset(action: ResetAction): void;
}

export interface BoardAction {
  accept(visitor: BoardActionVisitor): void;
}

export interface Undoable {
  undo(): BoardAction;
}

export class MoveAction implements BoardAction {
  constructor(readonly x: number, readonly y: number) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.move(this);
  }
}

export class DrawAction implements BoardAction, Undoable {
  constructor(readonly line: Line) {}

  undo(): BoardAction {
    return new RemoveAction(this.line);
  }

  accept(visitor: BoardActionVisitor): void {
    visitor.draw(this);
  }
}

export class RemoveAction implements BoardAction, Undoable {
  constructor(readonly line: Line) {}

  undo(): BoardAction {
    return new DrawAction(this.line);
  }

  accept(visitor: BoardActionVisitor): void {
    visitor.remove(this);
  }
}

export class ResetAction implements BoardAction {
  accept(visitor: BoardActionVisitor): void {
    visitor.reset(this);
  }
}