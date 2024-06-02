import { Line, Point } from "../../../../liaison/liaison.ts";
import { Behavior, BehaviorContext } from "./Behavior.ts";

export class PolygonBehavior implements Behavior {
  private points: Point[]=[];
  private endPoint: Point | null = null;
  private shift = false;
  constructor(private ctx: BehaviorContext) {}
   toolCancel(): void {
    this.points = [];
    this.endPoint=null;
    this.ctx.canvas.setTmpLine(null);
  }

  toolStart(point: Point): void {
    if(this.points.length==0) {
      this.points=[point];
      this.endPoint=point;
      this.ctx.canvas.setTmpLine(this.getLine());
    }
  }

  toolMove(point: Point): void {
    if(this.points.length!=0) {
      this.endPoint=point;
      this.ctx.canvas.setTmpLine(this.getLine());
    }
  }

  toolEnd(): void {
    if(this.points.length==0)
      return;

    if(this.shift) {
      this.points.push(this.points[0]);
      this.endPoint=null;
      this.ctx.client.socket.draw(this.getLine());
      this.toolCancel();
    }

    else if(this.endPoint!=null)
      this.points.push(this.endPoint!);
  }

  setShift(value: boolean): void { this.shift=value; }
  private getLine() {
    return new Line(
      0,
      this.ctx.settings.size.peek(),
      this.ctx.settings.color.peek(),
      this.endPoint == null
      ? this.points
      : [...this.points, this.endPoint!],
    );
  }
}

