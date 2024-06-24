import { showMessage } from "../../../client/toast.ts";
import { useContext, useEffect } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { ClientContext } from "../app/WithClient.tsx";

export default function CopySelector() {
  const client = useContext(ClientContext);
  if (!client) return <></>;
  const copy = () => {
    if (client.ui.selection.peek().size == 0) return;
    navigator.clipboard.writeText(
      `coboard:${
        JSON.stringify(Array.from(client.ui.selection.peek().values()))
      }`,
    );
    showMessage("Lines copied!");
  };
  useEffect(() => {
    globalThis.addEventListener("copy", copy);
  }, []);
  return <IconCircle iconName="copy-outline" onClick={copy} />;
}
