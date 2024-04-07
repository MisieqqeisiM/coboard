export default function LoginForm() {
  const iconSize = 40;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h3>Welcome to Coboard</h3>
        <form method="post" action="/api/login">
          <label for="login">Username</label>
          <input class="u-full-width" type="text" name="login" id="login" />
          <label for="password" style={{ color: "#eee" }}>Password</label>
          <input
            class="u-full-width"
            disabled
            style={{ backgroundColor: "#fafafa", borderColor: "#fcfcfc" }}
            type="password"
            name="password"
            id="password"
          />
          {/* TODO: password */}
          <input
            class="u-full-width button-primary"
            type="submit"
            value="log in"
          />
        </form>
        <div style="display: flex; justify-content: center; flex-direction: column; align-items: center">
          Powered by:
          <div style="display: flex; gap: 5px">
            <a href="https://deno.com/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/deno.svg"
              />
            </a>
            <a href="https://fresh.deno.dev/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/fresh.svg"
              />
            </a>
            <a href="https://socket.io/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/socketio.svg"
              />
            </a>
            <a href="http://getskeleton.com/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/skeleton.png"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
