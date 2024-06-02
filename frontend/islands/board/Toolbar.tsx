import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import AccountMenu from "./AccountMenu.tsx";
import ColorSelector from "./ColorSelector.tsx";
import ToolSelector from "./ToolSelector.tsx";
import { ClientContext } from "../app/WithClient.tsx";
import StylusModeSelector from "./StylusModeSelector.tsx";
import SizeSelector from "./SizeSelector.tsx";
import ShareSelector from "./ShareSelector.tsx";

export default function Toolbar() {
  const client = useContext(ClientContext);

  const editorTools = (
    <>
      <ColorSelector />
      <SizeSelector />
      <ToolSelector />
      <StylusModeSelector />
      <ShareSelector shareToken={client?.ui.shareToken} />
    </>
  );
  return (
    <div class="toolbar">
      <div class="toolbar-content">
        <AccountMenu>
          <IconCircle
            iconName="grid-outline"
            onClick={() => {
              globalThis.location.href = "/";
            }}
          />
          <IconCircle
            iconName="exit-outline"
            onClick={() => {
              globalThis.location.href = "/api/logout";
            }}
          />
          <IconCircle
            iconName="pencil-outline"
            onClick={() => {
              globalThis.location.href =
                `/set_name?redirectTo=${window.location.pathname}`;
            }}
          />
        </AccountMenu>
        {client?.ui.viewerOnly ? null : editorTools}
      </div>
    </div>
  );
}
