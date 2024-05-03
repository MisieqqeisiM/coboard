import { Head } from "../../deps.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div style="width: 100%; height:100%; margin: 0; padding: 0; display: flex; gap: 30px; justify-content: center; align-items: center; font-size:50px">
        <img src="/icons/coboard.svg" width="200"></img>
        Page not found.
      </div>
    </>
  );
}
