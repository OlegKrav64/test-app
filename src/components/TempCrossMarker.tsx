import type { Coordinates, ImageDimensions } from "@/utils/types";
import { Plus } from "lucide-react";

interface TempCrossMarkerProps {
  coordinates: Coordinates;
  imageDimensions: ImageDimensions;
  originalDimensions: ImageDimensions;
  zoomLevel: number;
}

export default function TempCrossMarker({
  coordinates,
  imageDimensions,
  originalDimensions,
  zoomLevel,
}: TempCrossMarkerProps) {
  const crossSize = 24;
  const adjustedPosition = Math.ceil(crossSize / 2);

  const positionX = coordinates.x / originalDimensions.width;
  const positionY = coordinates.y / originalDimensions.height;

  const left = imageDimensions.width * positionX - adjustedPosition;
  const top = imageDimensions.height * positionY - adjustedPosition;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: `scale(${1 / zoomLevel})`,
        transformOrigin: "center center",
      }}
    >
      <div className="relative" style={{ width: `${crossSize}px`, height: `${crossSize}px` }}>
        <Plus className="w-6 h-6 text-red-500" />
      </div>
    </div>
  );
}
