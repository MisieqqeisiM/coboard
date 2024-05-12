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
    // Convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->+1 (clip space)
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
//shaders compiler
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
      else
        console.log("webgl working")

      const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

      //linking shaders
      const program = gl.createProgram();
      if (!program) {
        throw new Error('Failed to create program');
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if(!linked) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error('Failed to link program: ${error}');
      }
      gl.useProgram(program);

      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

      //rectangle positions buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      //canvas resolution
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Function to draw a rectangle
      function drawRect(x: number, y: number, width: number, height: number, color: number[]) {
        if(!resolutionUniformLocation) {
          console.warn("failed to get resolution uniform location");
          return;
        }
        const x1 = x;
        const y1 = y;
        const x2 = x + width;
        const y2 = y + height;
        const positions = [
          x1, y1,
          x2, y1,
          x1, y2,
          x1, y2,
          x2, y1,
          x2, y2,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorUniformLocation, color);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      function randomColor(): number[] {
        return [Math.random(), Math.random(), Math.random(), 1];
      }


      // Draw random rectangles
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const width = Math.random() * 100 + 50;
        const height = Math.random() * 100 + 50;
        const color = randomColor();
        drawRect(x, y, width, height, color);
      }









      for (const line of strokes) {
        //inefficient, should be a proper queue
        if (line && line.coordinates && line.coordinates.length > 1) {
          //temporary solution
          /*
          if (line.color == EraserColor.TRANSPARENT) {
            context.globalCompositeOperation = "destination-out";
          } else {
            context.globalCompositeOperation = "source-over";
          }

          context.beginPath();
          context.strokeStyle = line.color;
          context.lineWidth = line.width;
          context.moveTo(line.coordinates[0].x, line.coordinates[0].y);
          for (let j = 1; j < line.coordinates.length; j++) {
            context.lineTo(line.coordinates[j].x, line.coordinates[j].y);
            context.stroke();
          }
          context.closePath();
          */
        }
      }
      //props.client.ui.strokes.peek().length = 0;
    });
    return () => {
      // TODO: unsubscribe
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

        //context.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    return () => {
      // TODO: unsubscribe
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
