export function cert() {
  return Deno.readTextFileSync("certificates/domain.crt");
}

export function key() {
  return Deno.readTextFileSync("certificates/domain.key");
}