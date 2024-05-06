import {
  createContext,
  signal,
  useContext,
  useEffect,
} from "../../../deps_client.ts";

export const ThemeContext = createContext(signal(true));

export default function Themed() {
  const theme = useContext(ThemeContext);
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      theme.value = false;
    }
    theme.subscribe((v) => {
      if (!v) {
        localStorage.setItem("theme", "dark");
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      } else {
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    });
  }, []);
  return <></>;
}
