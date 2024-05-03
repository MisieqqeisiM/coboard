/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "../deps.ts";

import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
