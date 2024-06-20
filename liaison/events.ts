import { BoardUser, Line } from "./liaison.ts";

export interface BoardEventVisitor {
  userList(event: UserListEvent): void;
  confirmLine(event: ConfirmLineEvent): void;
  onMove(event: OnMoveEvent): void;
  onDraw(event: OnDrawEvent): void;
  onRemove(event: OnRemoveEvent): void;
  onReset(event: OnResetEvent): void;
  onUpdate(event: OnUpdateEvent): void;
  confirmLines(event: ConfirmLinesEvent): void;
}

export class ConfirmLinesEvent implements BoardEvent {
  constructor(readonly lineIds: number[]) {}
  accept(visitor: BoardEventVisitor) {
    visitor.confirmLines(this);
  }
}

export class OnUpdateEvent implements BoardEvent {
  constructor(
    readonly user: string,
    readonly remove: number[],
    readonly create: Line[],
  ) {}
  accept(visitor: BoardEventVisitor) {
    visitor.onUpdate(this);
  }
}

export interface BoardEvent {
  accept(visitor: BoardEventVisitor): void;
}

export class UserListEvent implements BoardEvent {
  constructor(readonly users: Array<BoardUser>) {}
  accept(visitor: BoardEventVisitor) {
    visitor.userList(this);
  }
}

export class OnMoveEvent implements BoardEvent {
  constructor(readonly user: string, readonly x: number, readonly y: number) {}
  accept(visitor: BoardEventVisitor) {
    visitor.onMove(this);
  }
}

export class OnDrawEvent implements BoardEvent {
  constructor(readonly user: string, readonly line: Line) {}
  accept(visitor: BoardEventVisitor) {
    visitor.onDraw(this);
  }
}

export class OnRemoveEvent implements BoardEvent {
  constructor(readonly lineId: number) {}
  accept(visitor: BoardEventVisitor) {
    visitor.onRemove(this);
  }
}

export class OnResetEvent implements BoardEvent {
  accept(visitor: BoardEventVisitor) {
    visitor.onReset(this);
  }
}

export class ConfirmLineEvent implements BoardEvent {
  constructor(readonly lineId: number) {}
  accept(visitor: BoardEventVisitor) {
    visitor.confirmLine(this);
  }
}
