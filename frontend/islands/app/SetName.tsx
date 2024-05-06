interface SetNameProps {
  redirectTo: string;
  name: string;
}
export default function SetName({ redirectTo, name }: SetNameProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 0,
        }}
      >
        <div style="position: relative">
          <img
            width="1000"
            height="1000"
            style={{
              position: "absolute",
              zIndex: -1,
              left: -570,
              top: -400,
              opacity: 0.3,
            }}
            src="/icons/coboard.svg"
          />
        </div>
        <h3>Choose a name</h3>
        <form method="GET" action="/api/set_name">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input class="u-full-width" type="text" name="name" value={name} />
          <input
            class="u-full-width button-primary"
            type="submit"
            value="submit"
          />
        </form>
      </div>
    </div>
  );
}
