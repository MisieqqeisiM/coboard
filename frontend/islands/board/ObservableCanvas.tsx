import { useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";
import { createProgram, loadShader } from "./webgl-utils/index.ts"

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let resolutionUniformLocation: WebGLUniformLocation | null = null;
  let colorUniformLocation: WebGLUniformLocation | null = null;

  const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
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
      const program = createProgram(gl, [vertexShader, fragmentShader]);
      gl.useProgram(program);
      
      resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      colorUniformLocation = gl.getUniformLocation(program, 'u_color');
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

      if (resolutionUniformLocation === null || colorUniformLocation === null || positionAttributeLocation === -1) {
        console.warn("Failed to get necessary WebGL locations");
        return;
      }

      // buffer setup
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // canvas resolution setup
      canvas.width = props.width;
      canvas.height = props.height;
      gl.viewport(0, 0, canvas.width, canvas.height);

      return() => {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(positionBuffer);
      };

  },[]);

  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {

      //TODO: i think the codes should be stored in hex form directly, this is just for now
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

      function drawLines(lines: any[]) {
        const canvas = canvasRef.current;
        const gl = glRef.current;

        for (const line of lines) {
          if (line && line.coordinates && line.coordinates.length > 1) {
             const color = line.color === EraserColor.TRANSPARENT ? [1, 1, 1, 1] : hexToRgb(line.color);


            const positions: number[] = [];
            for (const coord of line.coordinates) {
              positions.push(coord.x, coord.y);
            }

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            //this assumes that resolution can change. For now it kinda does not
            gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
            console.log('line color:', line.color);
            console.log('color:', color);
            gl.uniform4fv(colorUniformLocation, color);
            gl.drawArrays(gl.LINE_STRIP, 0, line.coordinates.length);
          }
        }
      }

      // Draw lines
      drawLines(strokes);
    });

    return () => {
      // TODO: Unsubscribe
    };
  }, []);

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
      }
    });
    return () => {
      // TODO: Unsubscribe
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0 }}
      width={`${props.width}px`}
      height={`${props.height}px`}
    />
  );
}

