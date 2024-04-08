import { useEffect, useState } from "preact/hooks";
import LoginForm from "./LoginForm.tsx";
import Board from "../board/Board.tsx";

export default function MainDashboard() {
  const [component, setComponent] = useState(<></>);
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setComponent(
        <>
          <LoginForm />
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
