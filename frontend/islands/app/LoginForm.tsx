import { useContext, useState } from "preact/hooks";
import { ClientContext } from "./WithClient.tsx";

export default function LoginForm({ stateChanger }: any) {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const client = useContext(ClientContext);
  if (client) {
    return (
      <div className="login-form">
        <h1>Please Log In</h1>
        <label>
          <p>Username</p>
          <input
            type="text"
            onInput={(e) => setUserName(e.currentTarget.value)}
          />
        </label>
        {/*<label> //TODO: uncomment when password handling is added
              <p>Password</p>
              <input type="password" onInput={e=> setPassword(e.currentTarget.value)}/>
    </label>*/}
        <div>
          <button
            onClick={() => {
              client.socket.authenticate(username, password);
              setTimeout(() => {
                //TODO: make the proper response handling, can't listen to sessionStorage on the same window in UseEffect...
                stateChanger(sessionStorage.getItem("token"));
              }, 1000);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
  return <>Connecting...</>;
}
