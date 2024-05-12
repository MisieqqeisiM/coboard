import { useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // shader compiler function
  function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Failed to compile shader');
    }
    return shader;
  }

  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const gl = canvas.getContext("webgl");
      if (!gl) {
        console.log("no context")
        return;
      }

      const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

      // linking the shaders
      const program = gl.createProgram();
      if (!program) {
        throw new Error('Failed to create program');
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Failed to link program: ${error}`);
      }
      gl.useProgram(program);

      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Function to draw lines
      function drawLines(lines: any[]) {
        for (const line of lines) {
          if (line && line.coordinates && line.coordinates.length > 1) {
            const color = line.color === EraserColor.TRANSPARENT ? [0, 0, 0, 0] : [
              (line.color >> 16) / 255,
              ((line.color >> 8) & 0xff) / 255,
              (line.color & 0xff) / 255,
              1,
            ];

            const positions: number[] = [];
            for (const coord of line.coordinates) {
              positions.push(coord.x, coord.y);
            }

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
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

