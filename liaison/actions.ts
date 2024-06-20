import { Line } from "./liaison.ts";

export interface BoardActionVisitor {
  move(action: MoveAction): void;
  draw(action: DrawAction): void;
  remove(action: RemoveAction): void;
  update(action: UpdateAction): void;
  reset(action: ResetAction): void;
}

export interface BoardAction {
  accept(visitor: BoardActionVisitor): void;
}

export class UpdateAction implements BoardAction {
  constructor(readonly remove: Line[], readonly create: Line[]) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.update(this);
  }
}

export class MoveAction implements BoardAction {
  constructor(readonly x: number, readonly y: number) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.move(this);
  }
}

export class DrawAction implements BoardAction {
  constructor(readonly line: Line) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.draw(this);
  }
}

export class RemoveAction implements BoardAction {
  constructor(readonly line: Line) {}

  accept(visitor: BoardActionVisitor): void {
    visitor.remove(this);
  }
}

export class ResetAction implements BoardAction {
  accept(visitor: BoardActionVisitor): void {
    visitor.reset(this);
  }
}
