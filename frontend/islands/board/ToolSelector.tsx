import { useRef, useState } from "preact/hooks";
import IconCircle from "../../components/IconCircle.tsx";

export default function ToolSelector() {
  const tools = [
    "pencil-outline",
    "ban-outline",
  ];
  const [tool, setTool] = useState(0);
  const nextTool = () => {
    setTool((t) => (t + 1) % tools.length);
  };
  return <IconCircle iconName={tools[tool]} onClick={nextTool} />;
}
