import { BoardUser, Line } from "./liaison.ts";

export interface BoardEventVisitor {
  userList(event: UserListEvent): void;
  confirmLine(event: ConfirmLineEvent): void
  onMove(event: OnMoveEvent): void;
  onDraw(event: OnDrawEvent): void;
  onReset(event: OnResetEvent): void;
}

export interface BoardEvent {
  accept(visitor: BoardEventVisitor): void;
}

export class UserListEvent implements BoardEvent {
  constructor(readonly users: Array<BoardUser>) { }
  accept(visitor: BoardEventVisitor) {
    visitor.userList(this);
  }
}

export class OnMoveEvent implements BoardEvent {
  constructor(readonly user: string, readonly x: number, readonly y: number) { }
  accept(visitor: BoardEventVisitor) {
    visitor.onMove(this);
  }
}

export class OnDrawEvent implements BoardEvent {
  constructor(readonly user: string, readonly line: Line) { }
  accept(visitor: BoardEventVisitor) {
    visitor.onDraw(this);
  }
}

export class OnResetEvent implements BoardEvent {
  accept(visitor: BoardEventVisitor) {
    visitor.onReset(this);
  }
}

export class ConfirmLineEvent implements BoardEvent {
  accept(visitor: BoardEventVisitor) {
    visitor.confirmLine(this);
  }
}