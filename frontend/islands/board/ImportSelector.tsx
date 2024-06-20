import IconCircle from "../app/IconCircle.tsx";
import { useContext, useRef } from "../../../deps_client.ts";
import { ClientContext } from "../app/WithClient.tsx";
import { Line, Point } from "../../../liaison/liaison.ts";
import { Color, Mode, SettingsContext } from "../../../client/settings.ts";
import { CameraContext } from "../../../client/camera.ts";

export default function ImportSelector({
}: {
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useContext(ClientContext);
  const camera = useContext(CameraContext);
  const settings = useContext(SettingsContext);

  const showErrorMessage = () => {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = 'Failed to load the file';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);

  }

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = parseSVGContent(content);
        if(lines.length>0) {
          client.socket.deselectAll();
          client.socket.drawToSelection(lines);
          settings.mode.value = Mode.MOVE;
        }
        else showErrorMessage();

        input.value='';
      };
      reader.readAsText(file);
    }

  };

 const parseSVGContent = (content: string): Line[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'image/svg+xml');
    
    if (!doc) {
      console.error('Failed to parse file');
      return [];
    }
    
    const polylines = doc.querySelectorAll('polyline');
    const lines: Line[] = [];
    const middle = { x: 0, y: 0 };
    let n = 0;

    polylines.forEach((polyline) => {
      const points = polyline.getAttribute('points')?.trim().split(' ');
      let color = polyline.getAttribute('stroke') || Color.BLACK;
      if (!color.match("#[0-9a-fA-F]{6}"))
        //we are still going to try to draw the lines
        color = Color.BLACK;

      const width = parseFloat(polyline.getAttribute('stroke-width') || '1');

      if (points) {
        const coordinates: Point[] = points.map((point) => {
          const [x, y] = point.split(',').map(parseFloat);
          n++;
          middle.x += x;
          middle.y += y;
          return { x, y };
        });

        const id = 0;//is it okay???
        lines.push(new Line(id, width, color, coordinates));
      }
    });

    if (n > 0) {
      middle.x /= n;
      middle.y /= n;

      const [mx, my] = camera.peek().toBoardCoords(window.innerWidth / 2, window.innerHeight / 2);
      const diff = { x: mx - middle.x, y: my - middle.y };

      const newLines = lines.map((l) => Line.move(l, diff));
      return newLines;
    } else {
      console.warn('No valid polylines found.');
      return [];
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    return [];
  }
};
  const clickIcon =()=> {
    fileInputRef.current?.click();
  }
    return (
    <>
      <input
        type="file"
        accept=".svg"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    <IconCircle iconName="cloud-upload-outline" onClick={clickIcon} />
    </>
  );
}