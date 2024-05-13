import { Context, createContext, Signal, signal } from "../deps_client.ts";

export class Camera {
  constructor(public dx: number, public dy: number, public scale: number) {}
  public toBoardCoords(x: number, y: number): [number, number] {
    return [x / this.scale - this.dx, y / this.scale - this.dy];
  }
  public toScreenCoords(x: number, y: number): [number, number] {
    return [(x+this.dx)*this.scale, (y+this.dy)*this.scale];
  }

  public zoom(sx: number, sy: number, amount: number): Camera {
    const [x, y] = this.toBoardCoords(sx, sy);
    return new Camera(
      (this.dx + x) / amount - x,
      (this.dy + y) / amount - y,
      this.scale * amount,
    );
  }

  public move(sdx: number, sdy: number) {
    return new Camera(
      this.dx + sdx / this.scale,
      this.dy + sdy / this.scale,
      this.scale,
    );
  }
}

export const CameraContext: Context<Signal<Camera>> = createContext(
  signal(new Camera(0, 0, 0)),
);
