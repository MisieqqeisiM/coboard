import { Signal, useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";
import { createProgram, loadShader, resizeCanvasToDisplaySize } from "./webgl-utils/index.ts"
import { Camera, CameraContext } from "../../../client/camera.ts";
import { Line } from "../../../liaison/liaison.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const camera: Signal<Camera> = useContext(CameraContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let resolutionUniformLocation: WebGLUniformLocation | null = null;
  let colorUniformLocation: WebGLUniformLocation | null = null;
  let scaleUniformLocation: WebGLUniformLocation | null = null;
  let translationUniformLocation: WebGLUniformLocation | null = null;
  let program: WebGLProgram | null=null;

  const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_translation;
    uniform vec2 u_scale;
    uniform float u_thickness;

    void main() {
        vec2 translatedPosition = a_position + u_translation;
        vec2 position = translatedPosition * u_scale;

        // Calculate the direction of the line
        vec2 dir = normalize(vec2(u_scale.y, -u_scale.x));
        
        // Calculate the offset for thickness
        vec2 offset = u_thickness * 0.5 * dir;

        // Calculate vertices for the quad
        vec2 vertex1 = position + offset;
        vec2 vertex2 = position - offset;

        // Convert to clip space
        vec2 zeroToOne1 = vertex1 / u_resolution;
        vec2 zeroToTwo1 = zeroToOne1 * 2.0;
        vec2 clipSpace1 = zeroToTwo1 - 1.0;
        gl_Position = vec4(clipSpace1 * vec2(1, -1), 0, 1);

        vec2 zeroToOne2 = vertex2 / u_resolution;
        vec2 zeroToTwo2 = zeroToOne2 * 2.0;
        vec2 clipSpace2 = zeroToTwo2 - 1.0;
        gl_Position = vec4(clipSpace2 * vec2(1, -1), 0, 1);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
      gl_FragColor = u_color;
    }
  `;
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.log("no context")
      return;
    }
    glRef.current = gl;

    const vertexShader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    scaleUniformLocation = gl.getUniformLocation(program, 'u_scale');
    translationUniformLocation = gl.getUniformLocation(program, 'u_translation');

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    if (resolutionUniformLocation === null || colorUniformLocation === null || positionAttributeLocation === -1 || scaleUniformLocation == null || translationUniformLocation == null) {
      console.warn("Failed to get necessary WebGL locations");
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    return () => {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    };

  }, []);

  useEffect(() => {
    const subscription = camera.subscribe((camera: Camera) => {
      drawLines(props.client.ui.strokes.value);
    });
    return () => {
      // unsubscribe
    };
  }, []);

  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {
      drawLines(strokes);
    });

    return () => {
      // TODO: Unsubscribe
    };
  }, []);

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

  function drawLines(lines: Line[]) {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    gl.clear(gl.COLOR_BUFFER_BIT);
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    for (const line of lines) {
      if (line && line.coordinates && line.coordinates.length > 1) {
        const color = line.color === EraserColor.TRANSPARENT ? [1, 1, 1, 1] : hexToRgb(line.color);
        const thickness = line.width*0.3; // Adjust thickness as needed

        const positions: number[] = [];
        for (let i = 0; i < line.coordinates.length; i++) {
          const current = line.coordinates[i];
          const next = line.coordinates[i + 1] || current; // Last point duplicates previous
          const angle = Math.atan2(next.y - current.y, next.x - current.x) + Math.PI / 2;

          const dx = Math.cos(angle) * thickness;
          const dy = Math.sin(angle) * thickness;

          positions.push(
            current.x + dx, current.y + dy,
            current.x - dx, current.y - dy
          );
        }

        const vertices = new Float32Array(positions);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2fv(scaleUniformLocation, [camera.peek().scale, camera.peek().scale]);
        gl.uniform2fv(translationUniformLocation, [camera.peek().dx, camera.peek().dy]);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4fv(colorUniformLocation, color);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);

        gl.deleteBuffer(vertexBuffer);
      }
    }
  }

  useEffect(() => {
    const subscription = props.client.ui.clear.subscribe((newValue) => {
      if (newValue) {
        props.client.ui.clear.value = false;
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext("webgl");
        if (!context) {
          console.log("no webgl context")
          return;
        }
        context.clear(context.COLOR_BUFFER_BIT);
      }
    });
    return () => {
      // TODO: Unsubscribe
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
    />
  );
}

