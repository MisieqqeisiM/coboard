import { Point } from "../../../../liaison/liaison.ts";

export function getEllipse(rectanglePoint1: Point | null, rectanglePoint2: Point | null): Point[] {
    if(rectanglePoint2 == null) {
        if(rectanglePoint1==null)
            return [];
        else return [rectanglePoint1];
    }
    const point1 = rectanglePoint1!;
    const point2 = rectanglePoint2!;

    const centerX = (point1!.x + point2!.x) / 2;
    const centerY = (point1!.y + point2!.y) / 2;

    const radiusX = Math.abs(point1!.x - point2!.x) / 2;
    const radiusY = Math.abs(point1!.y - point2!.y) / 2;

    const perimeter = 2 * (radiusX + radiusY);
    const numPoints = Math.max(48, Math.floor(perimeter / 10));

    const result: Point[] = [];
    const angleIncrement = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleIncrement;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        result.push({ x, y });
    }
    result.push(result[0]);
    return result;
}

export function getRectangle(rectanglePoint1: Point | null, rectanglePoint2: Point | null) {
    if(rectanglePoint2 == null) {
        if(rectanglePoint1 == null)
            return [];
        return [rectanglePoint1];

    }
    const point1=rectanglePoint1!;
    const point2=rectanglePoint2;
    return [
        { x: point1.x, y: point1.y },
        { x: point1.x, y: point2.y },
        { x: point2.x, y: point2.y },
        { x: point2.x, y: point1.y },
        { x: point1.x, y: point1.y }
    ];
}
export function getLine(startPoint: Point | null, endPoint: Point | null) {
    if(endPoint == null) {
        if(startPoint == null) 
            return [];
        return [startPoint!];
    }
    return [startPoint!, endPoint!];
}

export function getSquarePoint(rectanglePoint1: Point, rectanglePoint2: Point) {
    const sideLength = Math.abs(rectanglePoint2.y - rectanglePoint1.y);
    const sgn = rectanglePoint1.x < rectanglePoint2.x ? 1 : -1;
    return { x: rectanglePoint1.x + sgn * sideLength, y: rectanglePoint2.y };
}

export function getCircle(rectanglePoint1: Point | null, rectanglePoint2: Point | null) {
    if(rectanglePoint2 == null) {
        if(rectanglePoint1 == null)
            return [];
        return [rectanglePoint1];
    }

    return getEllipse(rectanglePoint1, getSquarePoint(rectanglePoint1!, rectanglePoint2!));
}

export function getSquare(rectanglePoint1: Point | null, rectanglePoint2: Point | null) {
    if(rectanglePoint2 == null) {
        if(rectanglePoint1 == null)
            return [];
        return [rectanglePoint1];
    }

    return getRectangle(rectanglePoint1, getSquarePoint(rectanglePoint1!, rectanglePoint2!));


}