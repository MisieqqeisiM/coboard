import { defineConfig } from "$fresh/server.ts";
import { cert, key } from "../certificates/certificates.ts";
import { INNER_HTTPS_PORT } from "../config.ts";

export default defineConfig({
  server: {
    cert: cert(),
    key: key(),
    onListen: () => {
      console.log(`Fresh server on: https://localhost:${INNER_HTTPS_PORT}`);
    },
    port: INNER_HTTPS_PORT,
  },
});
