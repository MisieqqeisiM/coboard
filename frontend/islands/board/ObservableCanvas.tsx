import { Signal, useContext, useEffect, useRef } from "../../../deps_client.ts";
import { Color, SettingsContext, Tool } from "../../../client/settings.ts";
import {
  createProgramFromSources,
  resizeCanvasToDisplaySize,
} from "./webgl-utils/index.ts";
import { Camera, CameraContext } from "../../../client/camera.ts";
import { Line, Point } from "../../../liaison/liaison.ts";
import {
  linesIntersect,
  setUniforms,
  squaredDistanceToLine,
} from "./webgl-utils/line_drawing.ts";
import { ThemeContext } from "../app/Themed.tsx";
import { LineBuffer } from "./webgl-utils/LineBuffer.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { LineDrawer } from "./webgl-utils/LineDrawer.ts";

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
    let startPoint: Point|null=null;
    let drawing = false;
    let shiftPressed = false;
    let lineId = -1;
    let movedLine: Line | null = null;

    function draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      setUniforms(gl, program!, camera, theme.peek());
      lineBuffer.draw(program!);
      if (movedLine) {
        lineDrawer.drawLine(program!, movedLine);
      } else if (drawing) {
        const color = tool.peek() == Tool.ERASER
          ? Color.BLACK
          : strokeColor.peek();
        lineDrawer.drawLine(
          program!, 
          new Line(0, strokeWidth.peek(), strokeColor.peek(), points)
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

    function getIntersectedLineId(point: Point) {
      let id: number | null = null;
      for (const line of client!.ui.lines.values()) {
        if (
          squaredDistanceToLine(point, line.coordinates) <
            line.width * line.width
        ) {
          id = line.id;
        }
      }
      return id;
    }

    function getRectangle(point1: Point, point2: Point) {
      return [
        {x:point1.x, y:point1.y},
        {x:point1.x, y:point2.y},
        {x:point2.x, y:point2.y},
        {x:point2.x, y:point1.y},
        {x:point1.x, y:point1.y}
      ];
    }
    function getEllipse(rectanglePoint1: Point, rectanglePoint2: Point): Point[] {
      const centerX = (rectanglePoint1.x + rectanglePoint2.x) / 2;
      const centerY = (rectanglePoint1.y + rectanglePoint2.y) / 2;

      const radiusX = Math.abs(rectanglePoint1.x - rectanglePoint2.x) / 2;
      const radiusY = Math.abs(rectanglePoint1.y - rectanglePoint2.y) / 2;

      const perimeter = 2 * (radiusX + radiusY);
      const numPoints = Math.max(48, Math.floor(perimeter / 10));

      const result: Point[] = [];
      const angleIncrement = (2 * Math.PI) / numPoints;

      for (let i = 0; i < numPoints; i++) {
          const angle = i * angleIncrement;
          const x = centerX + radiusX * Math.cos(angle);
          const y = centerY + radiusY * Math.sin(angle);
          result.push({ x, y });
      }
      result.push(result[0]);
      return result;
    }
    function getSquarePoint(rectanglePoint1: Point, rectanglePoint2: Point) {
      const sideLength = Math.abs(rectanglePoint2.y - rectanglePoint1.y);
      const sgn = rectanglePoint1.x<rectanglePoint2.x ? 1 : -1;
      return {x: rectanglePoint1.x+sgn*sideLength, y: rectanglePoint2.y};
    }
    function setDrawingEnd() {
      drawing = false;
      points = [];
      startPoint=null;
    }
    function setDrawingStart(point: Point) {
      drawing =true;
      startPoint=point;
    }

    function submitLine() {
      const line: Line = new Line(
        lineId--,
        strokeWidth.peek(),
        strokeColor.peek(),
        points,
      );
      client.socket.draw(line);
      setDrawingEnd();
      draw();
    }

    props.startDraw.subscribe((point) => {
      if (!point) return;

      if (tool.peek() === Tool.MOVE) {
        const id = getIntersectedLineId(point);
        if (id) {
          movedLine = client.ui.lines.get(id)!;
          client.socket.remove(id);
        }
      } else if (tool.peek() == Tool.ERASER || tool.peek() == Tool.PEN) {
        points = [point];
        drawing = true;
        draw();
      }
      else if (tool.peek() == Tool.LINE) {
        setDrawingStart(point);
        draw();
      }
      else if(tool.peek() == Tool.RECTANGLE) {
        setDrawingStart(point);
        draw();
      }
      else if(tool.peek() == Tool.ELLIPSE) {
        setDrawingStart(point);
        draw();
      }
    });

    function moveLine(line: Line, diff: Point): Line {
      const coords = line.coordinates.map((point) => {
        return {
          x: point.x + diff.x,
          y: point.y + diff.y,
        };
      });
      return new Line(line.id, line.width, line.color, coords);
    }

    props.draw.subscribe((point) => {
      //called on each mousemove
      if (!point) return;
      if (movedLine) {
        const prev = points.at(-1)!;
        points.push(point);
        const diff: Point = {
          x: point.x - prev.x,
          y: point.y - prev.y,
        };
        movedLine = moveLine(movedLine, diff);
        draw();
      }
      if (!drawing) return;

      switch (tool.peek()) {
       case (Tool.ERASER):
          const segment = [points.at(-1)!, point];
          for (const line of client.ui.lines.values()) {
            if (linesIntersect(segment, line.coordinates, strokeWidth.peek())) {
              client.socket.remove(line.id);
            }
          }
          points.push(point);
          break;
        case (Tool.PEN):
          points.push(point);
          break;
        case (Tool.LINE):
          points = [startPoint, point];
          break;
        case(Tool.RECTANGLE):
          if(shiftPressed)
            points = getRectangle(startPoint!, getSquarePoint(startPoint!, point));
          else
            points = getRectangle(startPoint!, point);
          break;
        case(Tool.ELLIPSE):
          if(shiftPressed)
            points = getEllipse(startPoint!, getSquarePoint(startPoint!, point));
          else
            points = getEllipse(startPoint!, point);

          break;

      }
      draw();
    });

    props.endDraw.subscribe((point) => {
      if (!point) return;
      if (movedLine) {
        client.socket.draw(movedLine);
        movedLine = null;
      } else if (drawing) {
        if (tool.peek() == Tool.PEN || tool.peek() ==Tool.LINE || tool.peek() == Tool.RECTANGLE || tool.peek() == Tool.ELLIPSE)
          submitLine();
        else if (tool.peek() == Tool.ERASER) {
          setDrawingEnd();
          draw();
        }
      }
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
      else if(e.shiftKey) {
        shiftPressed=true;
      }
    });
    globalThis.addEventListener('keyup', (e)=> {
      if(!e.shiftKey) {
        shiftPressed=false;
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
