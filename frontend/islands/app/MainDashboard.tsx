import { useEffect, useState } from "preact/hooks";
import ClientList from "../board/ClientList.tsx";
import CursorBox from "../board/CursorBox.tsx";
import PingButton from "../board/PingButton.tsx";
import LoginForm from "./LoginForm.tsx";
import Canvas from "../board/Canvas.tsx";
import Board from "../board/Board.tsx";
import { WithClient } from "./WithClient.tsx";

export default function MainDashboard() {
  const [component, setComponent] = useState(<></>);
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setComponent(
        <>
          <LoginForm stateChanger={setToken} />
        </>,
      );
    } else {
      setComponent(
        <>
          <Board />
        </>,
      );
    }
  }, [token]);

  return (
    <>
      {component}
    </>
  );
}
