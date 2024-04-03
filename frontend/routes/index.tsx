import ClientList from "../islands/ClientList.tsx";
import CursorBox from "../islands/CursorBox.tsx";
import DrawableCanvas from "../islands/DrawableCanvas.tsx" 
import PingButton from "../islands/PingButton.tsx";
import ObservableCanvas from "../islands/ObservableCanvas.tsx";

export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Current users:</h1>
        <ClientList />
        <PingButton />
        <DrawableCanvas />
        <CursorBox />
      </div>
    </div>
  );
}
