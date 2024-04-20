import { useEffect } from "preact/hooks";

export default function Reload() {
  useEffect(() => {
    globalThis.location.reload();
  }, []);
  return <></>;
}
