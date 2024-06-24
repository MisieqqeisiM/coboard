import { MaxKey } from "$mongo";
import { Camera } from "../../../../client/camera.ts";
import { EraserColor } from "../../../../client/settings.ts";
import { Signal } from "../../../../deps_client.ts";
import { Line } from "../../../../liaison/liaison.ts";
interface Point {
  x: number;
  y: number;
}
function addSegmentWithThickness(
  positions: number[],
  current: Point,
  next: Point,
  thickness: number,
) {
  // Calculate angle of the line segment
  const angle = Math.atan2(next.y - current.y, next.x - current.x);

  // Calculate the perpendicular vector (normal) for thickness
  const dx = Math.cos(angle + Math.PI / 2) * thickness / 2;
  const dy = Math.sin(angle + Math.PI / 2) * thickness / 2;

  // Add the vertices for the current segment with thickness
  positions.push(
    current.x + dx,
    current.y + dy,
    current.x - dx,
    current.y - dy,
    next.x + dx,
    next.y + dy,
    next.x - dx,
    next.y - dy,
  );
}

function addRoundCap(
  positions: number[],
  point: Point,
  angle: number,
  thickness: number,
  isStart: boolean,
) {
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

function calculatePolylineWithThickness(
  line: Line,
  thickness: number,
): number[] {
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
  const thickness = line.width; //TODO: thickness should probably be adjusted

  let positions: number[] = [];

  positions = calculatePolylineWithThickness(line, thickness);

  return new Float32Array(positions);
};

export const setUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  camera: Signal<Camera>,
  theme: boolean,
  selected: boolean,
) => {
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution",
  );
  const scaleUniformLocation = gl.getUniformLocation(program, "u_scale");
  const translationUniformLocation = gl.getUniformLocation(
    program,
    "u_translation",
  );
  const themeUniformLocation = gl.getUniformLocation(program, "u_theme");
  const selectedUniformLocation = gl.getUniformLocation(program, "u_selected");

  if (
    resolutionUniformLocation === null || scaleUniformLocation == null ||
    translationUniformLocation == null
  ) {
    console.warn("Failed to get necessary WebGL locations");
    return;
  }

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2fv(scaleUniformLocation, [
    camera.peek().scale,
    camera.peek().scale,
  ]);
  gl.uniform2fv(translationUniformLocation, [
    camera.peek().dx,
    camera.peek().dy,
  ]);
  gl.uniform1i(themeUniformLocation, theme ? 1 : 0);
  gl.uniform1i(selectedUniformLocation, selected ? 1 : 0);
};
export function hexToRgb(hex: string): number[] | null {
  hex = hex.replace(/^#/, "");

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return [r / 255, g / 255, b / 255, 1];
}

export const setColorAndPoints = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  line: Line,
) => {
  //get variables
  const color = line.color === EraserColor.TRANSPARENT
    ? [1, 1, 1, 1]
    : hexToRgb(line.color);
  const vertices = getPointsFromLine(line);

  //get locations
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
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
};

// Function to calculate the squared distance between two points
function squaredDistance(p: Point, q: Point): number {
  return Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2);
}

// Function to calculate the squared distance between a point and a line segment
function squaredDistanceToSegment(p: Point, s1: Point, s2: Point): number {
  const dot = (p.x - s1.x) * (s2.x - s1.x) + (p.y - s1.y) * (s2.y - s1.y);
  if (dot <= 0) return squaredDistance(p, s1);
  if (dot > squaredDistance(s2, s1)) return squaredDistance(p, s2);
  return Math.pow(
    (p.x - s1.x) * (s2.y - s1.y) - (p.y - s1.y) * (s2.x - s1.x),
    2,
  ) / squaredDistance(s2, s1);
}

export function squaredDistanceToLine(p: Point, line: Point[]): number {
  let dist = squaredDistance(p, line[0]);
  for (let i = 0; i < line.length - 1; i++) {
    dist = Math.min(dist, squaredDistanceToSegment(p, line[i], line[i + 1]));
  }
  return dist;
}

//check if two lines intersect, helpfully written by chatgpt
//this code runs in n^2; should be changed
function doIntersect(
  p1: Point,
  q1: Point,
  p2: Point,
  q2: Point,
  width: number,
): boolean {
  // Check if the distance between the segments is less than or equal to the width
  return squaredDistanceToSegment(p1, p2, q2) <= width * width ||
    squaredDistanceToSegment(q1, p2, q2) <= width * width ||
    squaredDistanceToSegment(p2, p1, q1) <= width * width ||
    squaredDistanceToSegment(q2, p1, q1) <= width * width;
}

function segmentsIntersect(s1: Point[], s2: Point[], width: number): boolean {
  if (s1.length === 1) {
    // If s1 is a single point, check if it lies within any segment of s2
    for (let i = 0; i < s2.length - 1; i++) {
      if (doIntersect(s1[0], s1[0], s2[i], s2[i + 1], width)) {
        return true;
      }
    }
    return false;
  } else if (s2.length === 1) {
    // If s2 is a single point, check if it lies within any segment of s1
    for (let i = 0; i < s1.length - 1; i++) {
      if (doIntersect(s2[0], s2[0], s1[i], s1[i + 1], width)) {
        return true;
      }
    }
    return false;
  } else {
    // If both are segments, proceed with standard intersection check
    for (let i = 0; i < s1.length - 1; i++) {
      for (let j = 0; j < s2.length - 1; j++) {
        if (doIntersect(s1[i], s1[i + 1], s2[j], s2[j + 1], width)) {
          return true;
        }
      }
    }
    return false;
  }
}

export const linesIntersect = (
  l1: Point[],
  l2: Point[],
  width: number,
): boolean => {
  return segmentsIntersect(l1, l2, width);
};

export function pointInLine(p: Point, line: Line) {
  return squaredDistanceToLine(p, line.coordinates) < line.width * line.width;
}

function pointInRect(p: Point, r1: Point, r2: Point, width: number) {
  if (p.x > Math.max(r1.x, r2.x) + width) return false;
  if (p.y > Math.max(r1.y, r2.y) + width) return false;
  if (p.x < Math.min(r1.x, r2.x) - width) return false;
  if (p.y < Math.min(r1.y, r2.y) - width) return false;
  return true;
}

function segmentIntersectsRect(
  l1: Point,
  l2: Point,
  r1: Point,
  r2: Point,
  width: number,
) {
  if (pointInRect(l1, r1, r2, width)) return true;
  if (pointInRect(l2, r1, r2, width)) return true;
  const edges = [
    [{ x: r1.x, y: r1.y }, { x: r2.x, y: r1.y }],
    [{ x: r1.x, y: r1.y }, { x: r1.x, y: r2.y }],
    [{ x: r2.x, y: r2.y }, { x: r2.x, y: r1.y }],
    [{ x: r2.x, y: r2.y }, { x: r1.x, y: r2.y }],
  ];
  for (const [a, b] of edges) {
    if (doIntersect(l1, l2, a, b, width)) {
      return true;
    }
  }
  return false;
}

export function lineIntersectsRect(line: Line, r1: Point, r2: Point) {
  if (line.coordinates.length == 1) {
    return pointInRect(line.coordinates[0], r1, r2, line.width);
  }
  for (let i = 1; i < line.coordinates.length; i++) {
    if (
      segmentIntersectsRect(
        line.coordinates[i - 1],
        line.coordinates[i],
        r1,
        r2,
        line.width,
      )
    ) {
      return true;
    }
  }
  return false;
}
