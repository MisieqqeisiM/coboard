import { useContext } from "preact/hooks";
import { ClientContext, WithClient } from "../app/WithClient.tsx";
import ClientList from "../board/ClientList.tsx";
import CursorBox from "../board/CursorBox.tsx";
import PingButton from "../board/PingButton.tsx";
import Loading from "../app/Loading.tsx";

export default function Board() {
  const client = useContext(ClientContext);
  if (client) {
    return (
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        </div>
        <a href="/api/logout">log out</a>
        <h1 class="text-4xl font-bold">Current users:</h1>
        <ClientList />
        <PingButton />
        <CursorBox />
        <div />
      </div>
    );
  } else {
    return <Loading />;
  }
}
