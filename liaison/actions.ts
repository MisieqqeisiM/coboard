import { Line, Point } from "./liaison.ts";

export interface BoardActionVisitor {
  move(action: MoveAction): void;
  draw(action: DrawAction): void;
  remove(action: RemoveAction): void;
  reset(action: ResetAction): void;

  select(action: SelectAction): void;
  deselect(action: DeselectAction): void;
  removeSelection(action: RemoveSelectionAction): void;
  moveSelection(action: MoveSelectionAction): void;
}

export interface BoardAction {
  accept(visitor: BoardActionVisitor): void;
}

export interface Undoable {
  undo(): BoardAction;
}

export class SelectAction implements BoardAction {
  constructor(readonly ids: number[]) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.select(this);
  }
}

export class DeselectAction implements BoardAction {
  constructor(readonly ids: number[]) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.deselect(this);
  }
}

export class RemoveSelectionAction implements BoardAction {
  accept(visitor: BoardActionVisitor): void {
    visitor.removeSelection(this);
  }
}

export class MoveSelectionAction implements BoardAction {
  constructor(readonly vec: Point) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.moveSelection(this);
  }
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
