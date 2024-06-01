import { Line } from "../../../../liaison/liaison.ts";
import { getPointsFromLine, hexToRgb } from "./line_drawing.ts";

export class LineDrawer {
  private buffer: WebGLBuffer;

  public constructor(private gl: WebGL2RenderingContext) {
    this.buffer = gl.createBuffer()!;
  }

  public drawLine(program: WebGLProgram, line: Line) {
    const points = getPointsFromLine(line);
    const postition = this.gl.getAttribLocation(
      program,
      "a_position",
    );
    const color = this.gl.getUniformLocation(
      program,
      "u_color",
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, points, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(postition);
    this.gl.vertexAttribPointer(postition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.uniform4fv(color, hexToRgb(line.color)!);
    this.gl.drawArrays(
      this.gl.TRIANGLE_STRIP,
      0,
      points.length / 2,
    );
  }
}
