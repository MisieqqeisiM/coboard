import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import AccountMenu from "./AccountMenu.tsx";
import ColorSelector from "./ColorSelector.tsx";
import ModeSelector from "./ModeSelector.tsx";
import { ClientContext } from "../app/WithClient.tsx";
import StylusModeSelector from "./StylusModeSelector.tsx";
import SizeSelector from "./SizeSelector.tsx";
import ShareSelector from "./ShareSelector.tsx";
import ToolMenu from "./ToolMenu.tsx";
import ExportSelector from "./ExportSelector.tsx";
import ImportSelector from "./ImportSelector.tsx";
import OptionsMenu from "./OptionsMenu.tsx";

export default function Toolbar() {
  const client = useContext(ClientContext);

  const editorTools = (
    <>
      <ColorSelector />
      <SizeSelector />
      <ModeSelector />
      <ToolMenu />
      <IconCircle
        iconName="arrow-undo-outline"
        onClick={() => client?.socket.undo()}
      />
      <IconCircle
        iconName="arrow-redo-outline"
        onClick={() => client?.socket.redo()}
      />
      <OptionsMenu>
        <StylusModeSelector />
        <ExportSelector />
        <ImportSelector />
        <ShareSelector shareToken={client?.ui.shareToken} />
      </OptionsMenu>
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
