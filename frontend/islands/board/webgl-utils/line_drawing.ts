import { Camera } from "../../../../client/camera.ts";
import { EraserColor } from "../../../../client/settings.ts";
import { Signal } from "../../../../deps_client.ts";
import { Line } from "../../../../liaison/liaison.ts";

export const getPointsFromLine = (line: Line):Float32Array => {
  const thickness = line.width*0.3; //TODO: thickness should probably be adjusted

  const positions: number[] = [];
  for (let i = 0; i < line.coordinates.length; i++) {
    const current = line.coordinates[i];
    const next = line.coordinates[i + 1] || current;

    const angle = Math.atan2(next.y - current.y, next.x - current.x) + Math.PI / 2;
    const dx = Math.cos(angle) * thickness;
    const dy = Math.sin(angle) * thickness;

    positions.push(
      current.x + dx, current.y + dy,
      current.x - dx, current.y - dy
    );
  }

  return new Float32Array(positions);
}

export const setUniforms = (gl: WebGLRenderingContext, program: WebGLProgram, camera: Signal<Camera>)=> {

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
  if ( colorUniformLocation === null || positionAttributeLocation === -1 ) {
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
 
}