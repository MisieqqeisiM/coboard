import { createContext, Signal, signal } from "../deps_client.ts";

//TODO: some of them are not like the others
export enum Tool {
  PEN,
  LINE,
  POLYLINE,
  RECTANGLE,
  POLYGON,
  ELLIPSE,
}
export enum Mode {
  DRAW,
  ERASE,
  MOVE,
}

export enum Color {
  BLACK = "#13161b",
  DARK_BLUE = "#1e20a6",
  BLUE = "#0f93ff",
  CYAN = "#00ffd5",
  GREEN = "#56eb20",
  YELLOW = "#ffeb0a",
  ORANGE = "#ff7518",
  RED = "#db1d00",
  MAGENTA = "#ff007b",
  VIOLET = "#cf60ff",
}

//this is nonsensical and should be removed when we're done with it
export enum EraserColor {
  WHITE = "#ffffff",
  TRANSPARENT = "#000000",
}

export interface Settings {
  color: Signal<Color>;
  tool: Signal<Tool>;
  mode: Signal<Mode>;
  size: Signal<number>;
  penSize: Signal<number>;
  eraserSize: Signal<number>;
  stylusMode: Signal<boolean>;
}

export const SettingsContext = createContext<Settings>({
  color: signal(Color.BLACK),
  tool: signal(Tool.PEN),
  mode: signal(Mode.DRAW),
  size: signal(20),
  penSize: signal(20),
  eraserSize: signal(20),
  stylusMode: signal(false),
});

export const OnEnterContext = createContext<Signal<(() => void) | null>>(
  signal(null),
);
export const EnterTextContext = createContext<Signal<string>>(signal("Enter"));
