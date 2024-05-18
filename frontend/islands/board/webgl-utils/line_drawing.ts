import { Camera } from "../../../../client/camera.ts";
import { EraserColor } from "../../../../client/settings.ts";
import { Signal } from "../../../../deps_client.ts";
import { Line } from "../../../../liaison/liaison.ts";
interface Point {
  x: number;
  y: number;
}
function addSegmentWithThickness(positions: number[], current: Point, next: Point, thickness: number) {
  // Calculate angle of the line segment
  const angle = Math.atan2(next.y - current.y, next.x - current.x);

  // Calculate the perpendicular vector (normal) for thickness
  const dx = Math.cos(angle + Math.PI / 2) * thickness / 2;
  const dy = Math.sin(angle + Math.PI / 2) * thickness / 2;

  // Add the vertices for the current segment with thickness
  positions.push(
    current.x + dx, current.y + dy,
    current.x - dx, current.y - dy,
    next.x + dx, next.y + dy,
    next.x - dx, next.y - dy
  );
}

function addRoundCap(positions: number[], point: Point, angle: number, thickness: number, isStart: boolean) {
  const segments = 10; // Number of segments to approximate the round cap
  const radius = thickness / 2;
  const step = Math.PI / segments;

  for (let i = 0; i <= segments; i++) {
    const theta = isStart ? (Math.PI + i * step) : (i * step);
    const dx = Math.cos(angle + theta) * radius;
    const dy = Math.sin(angle + theta) * radius;

    positions.push(point.x + dx, point.y + dy);
    positions.push(point.x - dx, point.y - dy);
  }
}

function calculatePolylineWithThickness(line: Line, thickness: number): number[] {
  const positions: number[] = [];
  const n = line.coordinates.length;

  if (n < 2) {
    // If there's only one point, draw it as a round point
    const singlePoint = line.coordinates[0];
    addRoundCap(positions, singlePoint, 0, thickness, true);
    return positions;
  }

  for (let i = 0; i < n - 1; i++) {
    const current = line.coordinates[i];
    const next = line.coordinates[i + 1];

    if (i == 0) {
      // Add start cap
      const startAngle = Math.atan2(next.y - current.y, next.x - current.x);
      addRoundCap(positions, current, startAngle, thickness, true);

      // Add a degenerate triangle to transition to the next segment
      const dx = Math.cos(startAngle + Math.PI / 2) * thickness / 2;
      const dy = Math.sin(startAngle + Math.PI / 2) * thickness / 2;
      positions.push(current.x + dx, current.y + dy);
      positions.push(current.x - dx, current.y - dy);
    }

    addSegmentWithThickness(positions, current, next, thickness);

    if (i == n - 2) {
      // Add end cap
      const endAngle = Math.atan2(next.y - current.y, next.x - current.x);
      addRoundCap(positions, next, endAngle, thickness, false);
    }
  }

  return positions;
}
export const getPointsFromLine = (line: Line): Float32Array => {
  const thickness = line.width * 0.3; //TODO: thickness should probably be adjusted

  let positions: number[] = [];

  positions = calculatePolylineWithThickness(line, thickness);

  return new Float32Array(positions);
}

export const setUniforms = (gl: WebGLRenderingContext, program: WebGLProgram, camera: Signal<Camera>) => {

  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const scaleUniformLocation = gl.getUniformLocation(program, 'u_scale');
  const translationUniformLocation = gl.getUniformLocation(program, 'u_translation');

  if (resolutionUniformLocation === null || scaleUniformLocation == null || translationUniformLocation == null) {
    console.warn("Failed to get necessary WebGL locations");
    return;
  }

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2fv(scaleUniformLocation, [camera.peek().scale, camera.peek().scale]);
  gl.uniform2fv(translationUniformLocation, [camera.peek().dx, camera.peek().dy]);

}
function hexToRgb(hex: string): number[] | null {
  hex = hex.replace(/^#/, '');

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return [r / 255, g / 255, b / 255, 1];
}


export const setColorAndPoints = (gl: WebGLRenderingContext, program: WebGLProgram, line: Line) => {
  //get variables
  const color = line.color === EraserColor.TRANSPARENT ? [1, 1, 1, 1] : hexToRgb(line.color);
  const vertices = getPointsFromLine(line);

  //get locations
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  if (colorUniformLocation === null || positionAttributeLocation === -1) {
    console.warn("Failed to get necessary WebGL locations");
    return;
  }

  //create the buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  //set color
  gl.uniform4fv(colorUniformLocation, color!);
  return vertices.length / 2;
}