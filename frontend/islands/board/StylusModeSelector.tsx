import { useContext } from "preact/hooks";
import IconCircle from "../../components/IconCircle.tsx";
import { SettingsContext } from "../../../client/settings.ts";

export default function StylusModeSelector() {
  const stylusMode = useContext(SettingsContext).stylusMode;
  const toggle = () => {
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
