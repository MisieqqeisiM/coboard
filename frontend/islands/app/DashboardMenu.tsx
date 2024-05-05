import AccountMenu from "../board/AccountMenu.tsx";
import IconCircle from "./IconCircle.tsx";

export default function DashboardMenu() {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1000,
      }}
    >
      <AccountMenu>
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
    </div>
  );
}
