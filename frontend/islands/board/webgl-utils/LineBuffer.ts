import { Line } from "../../../../liaison/liaison.ts";
import { getPointsFromLine, hexToRgb } from "./line_drawing.ts";

interface Location {
  position: number;
  size: number;
  color: number[];
}

export class LineBuffer {
  private buffer: WebGLBuffer;
  private copyBuffer: WebGLBuffer;
  private locations: Map<number, Location> = new Map();
  private capacity: number = 1024;
  private size: number = 0;

  public constructor(private gl: WebGL2RenderingContext) {
    this.buffer = gl.createBuffer()!;
    this.copyBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.capacity, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.copyBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.capacity, gl.DYNAMIC_COPY);
  }

  public realloc() {
    const newCapacity = this.capacity * 2;
    const newBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.buffer);
    this.gl.bindBuffer(this.gl.COPY_WRITE_BUFFER, newBuffer);
    this.gl.bufferData(
      this.gl.COPY_WRITE_BUFFER,
      newCapacity,
      this.gl.DYNAMIC_DRAW,
    );
    this.gl.copyBufferSubData(
      this.gl.COPY_READ_BUFFER,
      this.gl.COPY_WRITE_BUFFER,
      0,
      0,
      this.size,
    );
    this.gl.deleteBuffer(this.buffer);
    this.buffer = newBuffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.copyBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, newCapacity, this.gl.DYNAMIC_COPY);
    this.capacity = newCapacity;
  }

  public addLine(line: Line) {
    const data = getPointsFromLine(line);
    const location = {
      position: this.size,
      size: data.byteLength,
      color: hexToRgb(line.color)!,
    };
    this.locations.set(line.id!, location);
    const newSize = this.size + data.byteLength;
    while (this.capacity < newSize) {
      this.realloc();
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, location.position, data);
    this.size = newSize;
  }

  public removeLine(id: number) {
    const location = this.locations.get(id);
    if (!location) return;
    this.gl.bindBuffer(this.gl.COPY_WRITE_BUFFER, this.copyBuffer);
    this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.buffer);
    this.gl.copyBufferSubData(
      this.gl.COPY_READ_BUFFER,
      this.gl.COPY_WRITE_BUFFER,
      location.position + location.size,
      0,
      this.size - location.position - location.size,
    );
    this.gl.copyBufferSubData(
      this.gl.COPY_WRITE_BUFFER,
      this.gl.COPY_READ_BUFFER,
      0,
      location.position,
      this.size - location.position - location.size,
    );
    this.locations.delete(id);
    for (const other of this.locations.values()) {
      if (other.position > location.position) {
        other.position -= location.size;
      }
    }
    this.size -= location.size;
  }

  public changeId(oldId: number, newId: number) {
    const location = this.locations.get(oldId);
    if (!location) return;
    this.locations.delete(oldId);
    this.locations.set(newId, location);
  }

  public draw(program: WebGLProgram) {
    const postition = this.gl.getAttribLocation(
      program,
      "a_position",
    );
    const color = this.gl.getUniformLocation(
      program,
      "u_color",
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.enableVertexAttribArray(postition);
    this.gl.vertexAttribPointer(postition, 2, this.gl.FLOAT, false, 0, 0);
    for (const [_, location] of this.locations) {
      this.gl.uniform4fv(color, location.color);
      this.gl.drawArrays(
        this.gl.TRIANGLE_STRIP,
        location.position / 8,
        location.size / 8,
      );
    }
  }

  public clear() {
    this.size = 0;
    this.locations = new Map();
  }
}
