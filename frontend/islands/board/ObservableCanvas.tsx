import { Signal, useContext,useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";
import { createProgram, loadShader, resizeCanvasToDisplaySize } from "./webgl-utils/index.ts"
import { Camera, CameraContext } from "../../../client/camera.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const camera:Signal<Camera> = useContext(CameraContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let resolutionUniformLocation: WebGLUniformLocation | null = null;
  let colorUniformLocation: WebGLUniformLocation | null = null;
  let scaleUniformLocation: WebGLUniformLocation | null = null;
  let translationUniformLocation: WebGLUniformLocation | null = null;

  const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_translation;
    uniform vec2 u_scale;

    void main() {
      vec2 translatedPosition = a_position + u_translation;
      //vec2 scaledPosition = a_position * u_scale;
      //vec2 position = scaledPosition + u_translation;
      vec2 position = translatedPosition*u_scale;

      vec2 zeroToOne = position / u_resolution;
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
      //this can be even better if we add the attributes there
      const program = createProgram(gl, [vertexShader, fragmentShader]);
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

      // buffer setup
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      return() => {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteProgram(program);
        gl.deleteBuffer(positionBuffer);
      };

  },[]);
  
  //handle resizing
  useEffect(()=> {
    const subscription = camera.subscribe((camera: Camera)=>{
       drawLines(props.client.ui.strokes.value);
    });
    return ()=> {
      //unsubscribe
    };
  },[]);

  //handle drawing lines
  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {
      drawLines(strokes);
    });

    return () => {
      // TODO: Unsubscribe
    };
  }, []);


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
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    for (const line of lines) {
      if (line && line.coordinates && line.coordinates.length > 1) {
        const color = line.color === EraserColor.TRANSPARENT ? [1, 1, 1, 1] : hexToRgb(line.color);


        const positions: number[] = [];
        for (const coord of line.coordinates) {
          positions.push(coord.x, coord.y);
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      
        gl.uniform2fv(scaleUniformLocation, [camera.peek().scale, camera.peek().scale]);
        gl.uniform2fv(translationUniformLocation, [camera.peek().dx, camera.peek().dy]);
        
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4fv(colorUniformLocation, color);
        gl.drawArrays(gl.LINE_STRIP, 0, line.coordinates.length);
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
      }
    });
    return () => {
      // TODO: Unsubscribe
    };
  }, []);


  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "blue" }}
    />
  );
}

