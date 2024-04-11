export default function AlreadyLoggedIn() {
  return (
    <div style="width: 100%; height:100%; padding: 0; margin: 0; display: flex; justify-content: center; align-items: center; font-size: 35px; gap: 30px">
      <img src="/icons/coboard.svg" width="200"></img>
      <div style={{ maxWidth: "40%" }}>
        You are already logged into this board. <br />
        Close the other tab to continue.
      </div>
    </div>
  );
}
