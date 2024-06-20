import { Signal, useContext, useEffect, useRef } from "../../../deps_client.ts";
import {
  createProgramFromSources,
  resizeCanvasToDisplaySize,
} from "./webgl-utils/index.ts";
import { Camera, CameraContext } from "../../../client/camera.ts";
import { Line } from "../../../liaison/liaison.ts";
import { setUniforms } from "./webgl-utils/line_drawing.ts";
import { ThemeContext } from "../app/Themed.tsx";
import { LineBuffer } from "./webgl-utils/LineBuffer.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { LineDrawer } from "./webgl-utils/LineDrawer.ts";
import { DrawableCanvas } from "../../../client/canvas.ts";

interface CanvasProps {
  controls: SignalCanvas;
}

export class SignalCanvas implements DrawableCanvas {
  public delta: Point = 0;
  tmpLine = new Signal<Line | null>();
  selected = new Signal<Map<number, Line>>(new Map());
  redrawSig = new Signal(false);
  dontRedraw = false;

  stopDrawing(): void {
    this.dontRedraw = true;
  }

  setTmpLine(line: Line | null): void {
    this.tmpLine.value = line;
  }
  setSelected(lines: Line[]): void {
    const newSelected = new Map<number, Line>();
    for (const line of lines) {
      newSelected.set(line.id, line);
    }
    this.selected.value = newSelected;
  }

  getSelected(): Map<number, Line> {
    return this.selected.peek();
  }

  redraw(): void {
    this.dontRedraw = false;
    this.redrawSig.value = !this.redrawSig.peek();
  }
}

export default function Canvas(
  { controls }: CanvasProps,
) {
  const camera: Signal<Camera> = useContext(CameraContext);
  const client = useContext(ClientContext);
  if (!client) return <></>;
  const theme = useContext(ThemeContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  let program: WebGLProgram | null = null;

  const vertexShaderSource = `#
    //position on board
    attribute vec2 a_position;

    //dimensions of the board
    uniform vec2 u_resolution;

    //camera transformations
    uniform vec2 u_translation;
    uniform vec2 u_scale;
    varying vec2 position;

    void main() {
        position = a_position;
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
    uniform bool u_selected;
    varying vec2 position;
    void main() {
      vec4 color = u_color;
      if(!u_theme) {
        if(color.x <= 0.15 && color.y <= 0.15 && color.z <= 0.15) {
          color = vec4(0.9, 0.9, 0.9, 1.0);
        }
      } 
      if(u_selected)
        color *= 0.5 + 0.5*sin((position.x + position.y)*0.3);
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
    const selectBuffer = new LineBuffer(gl);
    const lineDrawer = new LineDrawer(gl);

    function draw() {
      if (controls.dontRedraw) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      setUniforms(gl, program!, camera, theme.peek(), false);
      lineBuffer.draw(program!);
      setUniforms(gl, program!, camera, theme.peek(), true);
      selectBuffer.draw(program!);
      const line = controls.tmpLine.peek();
      setUniforms(gl, program!, camera, theme.peek(), false);
      if (line) lineDrawer.drawLine(program!, line);
    }

    for (const line of client.ui.cache.getLines()) {
      lineBuffer.addLine(line);
    }

    client.ui.canvas.onAddLines.subscribe((lines) => {
      for (const line of lines) {
        lineBuffer.addLine(line);
      }
      draw();
    });

    client.ui.canvas.onRemoveLines.subscribe((ids) => {
      for (const id of ids) {
        lineBuffer.removeLine(id);
      }
      draw();
    });

    client.ui.canvas.onReset.subscribe((clear) => {
      if (!clear) return;
      lineBuffer.clear();
      draw();
    });

    controls.tmpLine.subscribe((_) => draw());
    controls.selected.subscribe((lines) => {
      selectBuffer.clear();
      for (const line of lines.values()) {
        selectBuffer.addLine(line);
      }
      draw();
    });
    controls.redrawSig.subscribe((_) => draw());

    theme.subscribe((_) => draw());
    camera.subscribe((_) => draw());

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
