import { defineConfig } from "$fresh/server.ts";
import { cert, key } from "../certificates/certificates.ts";

export default defineConfig({ server: { cert: cert(), key: key(), onListen: () => {
  console.log("Fresh server on: https://localhost:8443")
}, port: 8443 }});
