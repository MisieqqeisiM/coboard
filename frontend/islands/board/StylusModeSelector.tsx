import { useContext, useEffect, useState } from "../../../deps_client.ts";
import IconCircle from "../../components/IconCircle.tsx";
import { SettingsContext } from "../../../client/settings.ts";

export default function StylusModeSelector() {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const [toggled, setToggled] = useState(false);
  useEffect(() => {
    if (toggled) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      if (e.pointerType != "touch") {
        stylusMode.value = true;
      }
    };
    document.addEventListener("pointermove", move);
    return () => {
      document.removeEventListener("pointermove", move);
    };
  }, [toggled]);

  const toggle = () => {
    setToggled(true);
    stylusMode.value = !stylusMode.peek();
  };

  if (stylusMode.value) {
    return (
      <IconCircle
        iconName={"lock-closed-outline"}
        color="#33c3f0"
        onClick={toggle}
      />
    );
  } else {
    return <IconCircle iconName={"lock-open-outline"} onClick={toggle} />;
  }
}
