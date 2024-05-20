import { useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Client } from "../../../client/client.ts";
import { CameraContext } from "../../../client/camera.ts";
import {
  Color,
  EraserColor,
  SettingsContext,
  Tool,
} from "../../../client/settings.ts";
import { Line } from "../../../liaison/liaison.ts";
import {
  createProgramFromSources,
  resizeCanvasToDisplaySize,
} from "./webgl-utils/index.ts";
import {
  getPointsFromLine,
  linesIntersect,
  setColorAndPoints,
  setUniforms,
} from "./webgl-utils/line_drawing.ts";
import { ThemeContext } from "../app/Themed.tsx";

interface CanvasProps {
  client: Client;
  width: number;
  height: number;
}

export default function DrawableCanvas(props: CanvasProps) {
  const camera = useContext(CameraContext);
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

  const tool = useContext(SettingsContext).tool;
  const stroke_color = useContext(SettingsContext).color;
  const stroke_width = useContext(SettingsContext).size;
  const stylusMode = useContext(SettingsContext).stylusMode;
  const theme = useContext(ThemeContext);
  let points: { x: number; y: number }[] = [];

  const canvasInit = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl");
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
  };

  //drawing logic
  useEffect(() => {
    canvasInit();

    const canvas = canvasRef.current;
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    const context = glRef.current;

    let drawing = false;

    const startDraw = (x: number, y: number) => {
      resizeCanvasToDisplaySize(context.canvas);
      context.viewport(0, 0, context.canvas.width, context.canvas.height);
      setUniforms(context, program!, camera, theme.peek());

      drawing = true;
      points = [{ x: x, y: y }];

      let len = setColorAndPoints(
        context,
        program!,
        new Line(null, stroke_width.peek(), stroke_color.peek(), points),
      );
      context.drawArrays(context.TRIANGLE_STRIP, 0, length);
    };

    const draw = (x: number, y: number) => {
      if (!drawing) return;
      points.push({ x: x, y: y });
      const color = tool.peek() == Tool.PEN ? stroke_color.peek() : Color.BLACK;

      let length = setColorAndPoints(
        context,
        program!,
        new Line(null, stroke_width.peek(), color, points),
      );

      context.drawArrays(context.TRIANGLE_STRIP, 0, length);
    };

    const endDraw = () => {
      if (drawing) {
        drawing = false;
        if (tool.peek() == Tool.PEN) {
          const line: Line = new Line(
            null,
            stroke_width.peek(),
            stroke_color.peek(),
            points,
          );
          props.client.ui.local_strokes.value.push(line);
          props.client.socket.draw(line);
        } else {
          const lines: Line[] = props.client.ui.strokes.value;
          const removeIds: number[] = [];
          context.clear(context.COLOR_BUFFER_BIT);

          for (const line of lines) {
            if (linesIntersect(line.coordinates, points, stroke_width.peek())) {
              removeIds.push(line.id!);
            }
          }

          for (const id of removeIds) {
            props.client.socket.remove(id);
          }
        }
        points = [];
      }
    };

    const mouseDown = (event: MouseEvent) => {
      if (event.button != 0) return;

      startDraw(...camera.peek().toBoardCoords(event.clientX, event.clientY));
    };

    const mouseMove = (event: MouseEvent) => {
      draw(...camera.peek().toBoardCoords(event.clientX, event.clientY));
    };

    const mouseUp = () => {
      endDraw();
    };

    const touchStart = (event: TouchEvent) => {
      if (stylusMode.peek()) return;
      if (event.touches.length != 1) return;
      event.preventDefault();
      startDraw(
        ...camera.peek().toBoardCoords(
          event.touches[0].clientX,
          event.touches[0].clientY,
        ),
      );
    };

    const touchMove = (event: TouchEvent) => {
      if (event.touches.length != 1) return;
      event.preventDefault();
      draw(
        ...camera.peek().toBoardCoords(
          event.touches[0].clientX,
          event.touches[0].clientY,
        ),
      );
    };

    const touchEnd = () => {
      endDraw();
    };

    canvas.addEventListener("touchstart", touchStart);
    globalThis.addEventListener("touchend", touchEnd);
    globalThis.addEventListener("touchcancel", touchEnd);
    globalThis.addEventListener("touchmove", touchMove);
    canvas.addEventListener("mousedown", mouseDown);
    globalThis.addEventListener("mouseup", mouseUp);
    globalThis.addEventListener("mousemove", mouseMove);

    return () => {
      canvas.removeEventListener("touchstart", touchStart);
      globalThis.removeEventListener("touchend", touchEnd);
      globalThis.removeEventListener("touchcancel", touchEnd);
      globalThis.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("mousedown", mouseDown);
      globalThis.removeEventListener("mouseup", mouseUp);
      globalThis.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  //redraw when strokes change
  useEffect(() => {
    const subscription = props.client.ui.local_strokes.subscribe((strokes) => {
      const context = glRef.current;
      if (!context) {
        return;
      }

      resizeCanvasToDisplaySize(context.canvas);
      context.viewport(0, 0, context.canvas.width, context.canvas.height);
      setUniforms(context, program!, camera, theme.peek());
      context.clear(context.COLOR_BUFFER_BIT);

      const draw_line = (line: Line) => {
        if (line && line.coordinates && line.coordinates.length > 0) {
          let length = setColorAndPoints(context, program!, line);
          context.drawArrays(context.TRIANGLE_STRIP, 0, length);
        }
      };

      draw_line(
        new Line(null, stroke_width.peek(), stroke_color.peek(), points),
      );
      if (
        (!props.client.ui.local_strokes) ||
        (!props.client.ui.local_strokes.value)
      ) {
        return;
      }

      props.client.ui.local_strokes.value.forEach(draw_line);
    });
    theme.subscribe((value) => {
      setUniforms(glRef.current!, program!, camera, value);
    });
    return () => {
      // TODO: unsubscribe
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 100,
        height: "100%",
        width: "100%",
      }}
    />
  );
}
