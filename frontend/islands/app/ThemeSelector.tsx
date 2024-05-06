import { useContext } from "../../../deps_client.ts";
import IconCircle from "../app/IconCircle.tsx";
import { ThemeContext } from "./Themed.tsx";

export default function ThemeSelector() {
  const theme = useContext(ThemeContext);
  const toggleTheme = () => {
    theme.value = !theme.peek();
  };

  if (theme.value) {
    return <IconCircle iconName="sunny-outline" onClick={toggleTheme} />;
  } else {
    return <IconCircle iconName="moon-outline" onClick={toggleTheme} />;
  }
}
