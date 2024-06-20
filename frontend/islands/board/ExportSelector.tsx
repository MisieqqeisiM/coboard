import IconCircle from "../app/IconCircle.tsx";
import { UIClient } from "../../../client/client.ts";
import { LineCache } from "../../../client/LineCache.ts";
import { Line, Point } from "../../../liaison/liaison.ts";
import { useContext } from "../../../deps_client.ts";
import { ClientContext } from "../app/WithClient.tsx";

export default function ExportSelector({
}: {
}) {

  const client = useContext(ClientContext);
  function makeSVGLine(line: Line) : string {
    const pointsString = line.coordinates.map(p => `${p.x},${p.y}`).join(' ');

    return `<polyline points="${pointsString}" stroke="${line.color}" stroke-linecap="round" stroke-width="${line.width}" fill="none" />`;
  }
  function makeSVG(lines: IterableIterator<Line>) : string {
    const svgEnd = '</svg>';
    let svgContent = '';
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for(const line of lines) {
        line.coordinates.forEach(({ x, y }) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        });

        svgContent+=makeSVGLine(line);
    }
    const width=maxX-minX
    const height = maxY-minY
    //this should be probably somewhere else
    const margin = 200
    
    const svgStart = `<svg viewBox="${minX-margin} ${minY-margin} ${width+2*margin} ${height+2*margin}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;

    return svgStart+svgContent+svgEnd;
  }

  function downloadSVG(svgContent: string) {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coboard.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const exportLines = () => {
      if (client) {
          const lineCache: LineCache = client.ui.cache
          if (lineCache != null) {
              let lines: IterableIterator<Line> = lineCache!!.getLines()

              const svgContent = makeSVG(lines)
              downloadSVG(svgContent)
          }
      }

  };

  return (
    <IconCircle iconName="download-outline" onClick={exportLines} />
  );
}