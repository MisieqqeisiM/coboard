import { Signal, signal } from "@preact/signals";
import { createContext } from "preact";

export enum Tool {
  PEN,
  ERASER
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

export interface Settings {
  color: Signal<Color>;
  tool: Signal<Tool>;
  size: Signal<number>;
  stylusMode: Signal<boolean>;
}

export const SettingsContext = createContext<Settings>({
  color: signal(Color.BLACK),
  tool: signal(Tool.PEN),
  size: signal(20),
  stylusMode: signal(false),
})