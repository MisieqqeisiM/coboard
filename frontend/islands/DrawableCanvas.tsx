import { ClientContext } from "./WithClient.tsx";
import { useRef, useEffect } from 'preact/hooks';
import { Client } from "../../client/client.ts";
import Draw from "../islands/Draw.tsx"
import ObservableCanvas from "./ObservableCanvas.tsx";

export default function DrawableCanvas() {
    return (
        <ClientContext.Consumer>
            {client =>{
                if(!client) return "Connecting";
                return <div>
                <Draw client={client} />
                <ObservableCanvas client={client} />
                </div>
            }
        }
        </ClientContext.Consumer>
    );
};
