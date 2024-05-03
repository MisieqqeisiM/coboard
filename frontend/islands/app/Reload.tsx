import { useEffect } from "../../../deps.ts";

export default function Reload() {
  useEffect(() => {
    globalThis.location.reload();
  }, []);
  return <></>;
}
