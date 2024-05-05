import { IS_BROWSER } from "$fresh/runtime.ts";
import { CLIENT_ID } from "../../../config.ts";
interface LoginFormProps {
  redirectTo: string;
}
export default function LoginForm({ redirectTo }: LoginFormProps) {
  if (!IS_BROWSER) return <></>;
  const iconSize = 40;
  const googleLoginURL = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );
  googleLoginURL.searchParams.append("client_id", CLIENT_ID);
  googleLoginURL.searchParams.append(
    "redirect_uri",
    `${window.location.protocol}//${window.location.hostname}/api/login/google`,
  );
  googleLoginURL.searchParams.append("response_type", "code");
  googleLoginURL.searchParams.append("access_type", "offline");
  googleLoginURL.searchParams.append("prompt", "consent");
  googleLoginURL.searchParams.append(
    "scope",
    "https://www.googleapis.com/auth/userinfo.email",
  );
  googleLoginURL.searchParams.append("state", redirectTo);

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
              top: -380,
              opacity: 0.3,
            }}
            src="/icons/coboard.svg"
          />
        </div>
        <h3>Welcome to Coboard</h3>
        <a
          class="u-full-width button button-primary"
          href={googleLoginURL.toString()}
        >
          Log in with google
        </a>
        <a
          class="u-full-width button button-primary"
          href={`/api/login/anonymous?redirectTo=${redirectTo}`}
        >
          Log in anonymously
        </a>
        <div style="display: flex; justify-content: center; flex-direction: column; align-items: center">
          Powered by:
          <div style="display: flex; gap: 3px">
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
            <a href="https://www.mongodb.com/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/mongo.svg"
              />
            </a>
            <a href="https://www.docker.com/">
              <img
                width={iconSize}
                height={iconSize}
                src="/icons/docker.svg"
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
