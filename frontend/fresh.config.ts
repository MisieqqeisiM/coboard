import { defineConfig } from "$fresh/server.ts";
import { HTTP_PORT } from "../config.ts";

export default defineConfig({
  server: {
    onListen: () => {
      console.log(`Fresh server on: https://localhost:${HTTP_PORT}`);
    },
    port: HTTP_PORT,
  },
});
