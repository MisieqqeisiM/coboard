import { OnEnterContext } from "../../../client/settings.ts";
import { useContext } from "../../../deps_client.ts";
export default function Enter() {
  const onEnter = useContext(OnEnterContext);
  if (onEnter.value === null) {
    return <></>;
  }
  return (
    <button
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
      }}
      class="button-primary"
      onClick={onEnter.value}
    >
      Enter
    </button>
  );
}
