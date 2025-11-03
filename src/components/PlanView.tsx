import { useState, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { Coordinates, ImageDimensions, SelectedPin } from "@/utils/types";
import type { TaskDocType } from "@/db/schemas/task.schema";
import TaskMarker from "@/components/TaskMarker";
import TempCrossMarker from "@/components/TempCrossMarker";
import planImage from "@/assets/plan.png";

interface PlanViewProps {
  tasks: TaskDocType[];
  selectedPin: SelectedPin | null;
  setSelectedPin: (pin: SelectedPin | null) => void;
  isAddingPin: boolean;
  tempPinPosition: Coordinates | null;
  tempTaskCoordinates: Coordinates | null;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  imageDimensions: ImageDimensions;
  originalDimensions: ImageDimensions;
  imageRef: React.RefObject<HTMLImageElement | null>;
  calculateImageDimensions: () => void;
}

export default function PlanView({
  tasks,
  selectedPin,
  setSelectedPin,
  isAddingPin,
  tempPinPosition,
  tempTaskCoordinates,
  onImageClick,
  imageDimensions,
  originalDimensions,
  imageRef,
  calculateImageDimensions,
}: PlanViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handlePinClick = (task: TaskDocType) => {
    setSelectedPin({
      id: task.id,
      type: "task",
    });
  };

  const planHeight = useMemo(() => {
    return window.innerHeight - 210;
  }, []);

  return (
    <div className="w-full h-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={30}
        centerOnInit={true}
        wheel={{ step: 0.5 }}
        smooth={false}
        pinch={{ step: 5 }}
        disablePadding={true}
        panning={{
          velocityDisabled: true,
        }}
        doubleClick={{ disabled: true }}
        onZoom={({ state }) => setZoomLevel(state.scale)}
      >
        <TransformComponent
          wrapperStyle={{
            height: planHeight,
            width: "100%",
            border: "1px solid rgb(228, 219, 219)",
            borderRadius: "6px",
            boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 6px",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
            <img
              ref={imageRef}
              src={planImage}
              alt="Construction Plan"
              onLoad={calculateImageDimensions}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
            {imageDimensions.width > 0 && originalDimensions.width > 0 && (
              <div
                className="absolute inset-0"
                style={{
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                }}
                onClick={onImageClick}
              >
                {tasks
                  .filter((task) => task.floorPlanX !== undefined && task.floorPlanY !== undefined)
                  .map((task) => (
                    <TaskMarker
                      key={task.id}
                      task={task}
                      onClick={() => handlePinClick(task)}
                      isSelected={selectedPin?.type === "task" && selectedPin.id === task.id}
                      imageDimensions={imageDimensions}
                      originalDimensions={originalDimensions}
                      zoomLevel={zoomLevel}
                    />
                  ))}
                {tempPinPosition && tempTaskCoordinates && isAddingPin && !selectedPin && (
                  <TempCrossMarker
                    coordinates={tempTaskCoordinates}
                    imageDimensions={imageDimensions}
                    originalDimensions={originalDimensions}
                    zoomLevel={zoomLevel}
                  />
                )}
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
