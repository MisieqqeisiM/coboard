import { DrawableCanvas } from "../../../../client/canvas.ts";
import { Client } from "../../../../client/client.ts";
import { Settings } from "../../../../client/settings.ts";
import { Signal } from "../../../../deps_client.ts";
import { Point } from "../../../../liaison/liaison.ts";

export interface Behavior {
  toolStart(point: Point): void;
  toolMove(point: Point): void;
  toolEnd(): void;
  toolCancel(): void;
  setShift(value: boolean): void;
}
export class BehaviorContext {
  constructor(
    readonly settings: Settings,
    readonly canvas: DrawableCanvas,
    readonly client: Client,
    readonly onEnter: Signal<(() => void) | null>,
  ) {}
}
