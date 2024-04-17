import { useRef, useState } from "preact/hooks";

export default function ToolSelector() {
  const tools = [
    "pencil-outline",
    "ban-outline",
  ];
  const [tool, setTool] = useState(0);
  const nextTool = () => {
    setTool((t) => (t + 1) % tools.length);
  };
  return (
    <div
      class="tool-selector"
      dangerouslySetInnerHTML={{
        __html: `<ion-icon name='${tools[tool]}'></ion-icon>`,
      }}
      onClick={nextTool}
    >
    </div>
  );
}
