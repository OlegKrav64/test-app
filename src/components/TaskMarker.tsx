import type { TaskDocType } from "@/db/schemas/task.schema";
import type { ImageDimensions } from "@/utils/types";
import { cn } from "@/utils/lib";

interface TaskMarkerProps {
  task: TaskDocType;
  onClick: () => void;
  isSelected: boolean;
  imageDimensions: ImageDimensions;
  originalDimensions: ImageDimensions;
  zoomLevel: number;
}

export default function TaskMarker({
  task,
  onClick,
  isSelected,
  imageDimensions,
  originalDimensions,
  zoomLevel,
}: TaskMarkerProps) {
  if (task.floorPlanX === undefined || task.floorPlanY === undefined) {
    return null;
  }

  const pinSize = 26;
  const adjustedPosition = Math.ceil(pinSize / 2);

  const positionX = task.floorPlanX / originalDimensions.width;
  const positionY = task.floorPlanY / originalDimensions.height;

  // Calculate pixel position on displayed image
  const left = imageDimensions.width * positionX - adjustedPosition;
  const top = imageDimensions.height * positionY - adjustedPosition;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left,
        top,
        transform: `scale(${1 / zoomLevel})`,
        transformOrigin: "center center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      data-type="plan-pin"
    >
      <div
        className={cn(
          "rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
          isSelected && "bg-blue-600 border-white scale-125 shadow-lg",
          !isSelected && "bg-blue-500 border-white hover:bg-blue-600 hover:scale-110"
        )}
        style={{
          width: `${pinSize}px`,
          height: `${pinSize}px`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      {task.title && isSelected && (
        <div className="absolute top-full mt-1 whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-gray-800 text-white shadow-lg">
          {task.title}
        </div>
      )}
    </div>
  );
}
