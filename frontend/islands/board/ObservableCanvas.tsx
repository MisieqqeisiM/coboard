import { Signal, useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Color, SettingsContext, Tool } from "../../../client/settings.ts";
import {
  createProgramFromSources,
  resizeCanvasToDisplaySize,
} from "./webgl-utils/index.ts";
import { Camera, CameraContext } from "../../../client/camera.ts";
import { Line, Point } from "../../../liaison/liaison.ts";
import {
  getPointsFromLine,
  linesIntersect,
  setUniforms,
} from "./webgl-utils/line_drawing.ts";
import { ThemeContext } from "../app/Themed.tsx";
import { LineBuffer } from "./webgl-utils/LineBuffer.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { LineDrawer } from "./webgl-utils/LineDrawer.ts";
import { Undoable } from "../../../liaison/actions.ts";

interface CanvasProps {
  width: number;
  height: number;
  startDraw: Signal<Point | null>;
  draw: Signal<Point | null>;
  endDraw: Signal<Point | null>;
}

export default function ObservableCanvas(props: CanvasProps) {
  const camera: Signal<Camera> = useContext(CameraContext);
  const tool = useContext(SettingsContext).tool;
  const strokeColor = useContext(SettingsContext).color;
  const strokeWidth = useContext(SettingsContext).size;
  const client = useContext(ClientContext);
  if (!client) return <></>;
  const theme = useContext(ThemeContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let program: WebGLProgram | null = null;

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
    uniform bool u_theme;
    void main() {
      vec4 color = u_color;
      if(!u_theme) {
        if(color.x <= 0.15 && color.y <= 0.15 && color.z <= 0.15) {
          color = vec4(0.9, 0.9, 0.9, 1.0);
        }
      } 
      gl_FragColor = color;
    }
  `;

  //create the program and stuff
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl2")!;
    if (!gl) {
      console.log("no context");
      return;
    }
    glRef.current = gl;

    program = createProgramFromSources(
      gl,
      [vertexShaderSource, fragmentShaderSource],
      [],
      [],
    );
    gl.useProgram(program);
    const lineBuffer = new LineBuffer(gl);
    const lineDrawer = new LineDrawer(gl);

    let points: Point[] = [];
    let drawing = false;
    let lineId = -1;

    function draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      setUniforms(gl, program!, camera, theme.peek());
      lineBuffer.draw(program!);
      if (drawing) {
        const color = tool.peek() == Tool.PEN
          ? strokeColor.peek()
          : Color.BLACK;
        lineDrawer.drawLine(
          program!,
          new Line(0, strokeWidth.peek(), color, points),
        );
      }
    }

    for (const line of client.ui.lines.values()) {
      lineBuffer.addLine(line);
    }

    client.ui.newLine.subscribe((line) => {
      if (!line) return;
      lineBuffer.addLine(line);
      draw();
    });
    client.ui.removeLine.subscribe((id) => {
      if (!id) return;
      lineBuffer.removeLine(id);
      draw();
    });
    client.ui.clear.subscribe((clear) => {
      if (!clear) return;
      lineBuffer.clear();
      draw();
    });

    props.startDraw.subscribe((point) => {
      if (!point) return;
      drawing = true;
      points = [point];
      draw();
    });

    props.draw.subscribe((point) => {
      if (!point) return;
      if (!drawing) return;
      if (tool.peek() === Tool.ERASER) {
        const segment = [points.at(-1)!, point];
        for (const line of client.ui.lines.values()) {
          if (linesIntersect(segment, line.coordinates, strokeWidth.peek())) {
            client.socket.remove(line.id);
          }
        }
      }
      points.push(point);
      draw();
    });

    props.endDraw.subscribe((point) => {
      if (!point) return;
      if (drawing) {
        if (tool.peek() == Tool.PEN) {
          const line: Line = new Line(
            lineId--,
            strokeWidth.peek(),
            strokeColor.peek(),
            points,
          );
          lineBuffer.addLine(line);
          client.socket.draw(line);
        }
      }
      drawing = false;
      points = [];
      draw();
    });

    theme.subscribe((_) => draw());
    camera.subscribe((_) => draw());
    client.ui.confirmLine.subscribe((e) => {
      if (!e) return;
      lineBuffer.changeId(e.localId, e.globalId);
    });

    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "z" && e.ctrlKey) {
        client.socket.undo();
      }
    });

    return () => {
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
