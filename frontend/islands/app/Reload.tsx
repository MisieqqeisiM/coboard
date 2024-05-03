import { useEffect } from "../../../deps_client.ts";

export default function Reload() {
  useEffect(() => {
    globalThis.location.reload();
  }, []);
  return <></>;
}
