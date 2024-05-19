import { Signal, useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { EraserColor } from "../../../client/settings.ts";
import { createProgram, createProgramFromSources, loadShader, resizeCanvasToDisplaySize } from "./webgl-utils/index.ts"
import { Camera, CameraContext } from "../../../client/camera.ts";
import { Line } from "../../../liaison/liaison.ts";
import { getPointsFromLine, setColorAndPoints, setUniforms } from "./webgl-utils/line_drawing.ts";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function ObservableCanvas(props: CanvasProps) {
  const camera: Signal<Camera> = useContext(CameraContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let program: WebGLProgram | null=null;

  const vertexShaderSource = `
    //position on board
    attribute vec2 a_position;

    //dimensions of the board
    uniform vec2 u_resolution;

    //camera transformations
    uniform vec2 u_translation;
    uniform vec2 u_scale;

    void main() {
        vec2 translatedPosition = a_position + u_translation;
        vec2 position = translatedPosition * u_scale;

        vec2 vertex = position;
        vec2 zeroToOne = vertex / u_resolution;
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

  //create the program and stuff
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

    program = createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource], [], []);
    gl.useProgram(program);

    return () => {
      gl.deleteProgram(program);
    };

  }, []);

  //subscribe to camera
  useEffect(() => {
    const subscription = camera.subscribe((camera: Camera) => {
      drawLines(props.client.ui.strokes.value);
    });
    return () => {
      // unsubscribe
    };
  }, []);

  //subscribe to the clear button
  useEffect(() => {
    const subscription = props.client.ui.clear.subscribe((newValue) => {
      if (newValue) {
        if(glRef.current!=null) {
          const gl = glRef.current;
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    });
    return () => {
      // TODO: Unsubscribe
    };
  }, []);


  //subscribe to see new strokes
  useEffect(() => {
    const subscription = props.client.ui.strokes.subscribe((strokes) => {
      drawLines(strokes);
    });

    return () => {
      // TODO: Unsubscribe
    };
  }, []);

  function drawLines(lines: Line[]) {
    const gl = glRef.current;
    gl.clear(gl.COLOR_BUFFER_BIT);
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    setUniforms(gl, program!, camera);

    for (const line of lines) {
      if (line && line.coordinates && line.coordinates.length > 0) {

        let length = setColorAndPoints(gl, program!, line);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, length);
        //TODO: remove the buffer maybe? i don't know how it works yet

      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
    />
  );
}

