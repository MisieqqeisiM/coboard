import { ClientContext } from "../app/WithClient.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import DrawableCanvas from "./DrawableCanvas.tsx";
import ObservableCanvas from "./ObservableCanvas.tsx";

export default function Canvas() {
  const client = useContext(ClientContext);

  if (client) {
    return (
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "300px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "green",
          }}
        />
        <ObservableCanvas client={client} />
        <DrawableCanvas client={client} />
      </div>
    );
  }
  return <>Connecting...</>;
}
