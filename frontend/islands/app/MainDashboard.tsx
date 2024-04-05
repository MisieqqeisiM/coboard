import { useEffect, useState } from "preact/hooks";
import ClientList from "../board/ClientList.tsx";
import CursorBox from "../board/CursorBox.tsx";
import PingButton from "../board/PingButton.tsx";
import LoginForm from "./LoginForm.tsx";
import Canvas from "../board/Canvas.tsx"

export default function MainDashboard() {
  const [component, setComponent] = useState(<></>);
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setComponent(
        <>
          <LoginForm stateChanger={setToken} />
        </>
      );
    } else {
      setComponent(
        <>
          <h1 class="text-4xl font-bold">Current users:</h1>
          <ClientList />
          <PingButton />
          <CursorBox />
          <Canvas />
        </>
      );
    }
  }, [token]);

  return (
    <>
      {" "}
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center"></div>
        <>{component}</>
        <div />
      </div>
    </>
  );
}
