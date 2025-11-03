import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useTaskStore } from "@/store/useTaskStore";
import PlanView from "@/components/PlanView";
import TaskBoard from "@/components/TaskBoard";
import TaskDetailModal from "@/components/TaskDetailModal";
import TaskCreateModal from "@/components/TaskCreateModal";
import Button from "@/components/ui/Button";
import type { Coordinates, ImageDimensions, SelectedPin } from "@/utils/types";
import type { TaskDocType } from "@/db/schemas/task.schema";

export default function PlanPage() {
  const navigate = useNavigate();
  const userName = useAuthStore((state) => state.userName);
  const userId = useAuthStore((state) => state.userId);
  const logout = useAuthStore((state) => state.logout);
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const createTask = useTaskStore((state) => state.createTask);
  const getTaskById = useTaskStore((state) => state.getTaskById);

  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [tempPinPosition, setTempPinPosition] = useState<Coordinates | null>(null);
  const [tempTaskCoordinates, setTempTaskCoordinates] = useState<Coordinates | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
  });
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (userId) {
      loadTasks(userId);
    }
  }, [userId, loadTasks]);

  useEffect(() => {
    if (selectedTaskId) {
      setSelectedPin({ id: selectedTaskId, type: "task" });
    } else {
      setSelectedPin(null);
    }
  }, [selectedTaskId]);

  const calculateImageDimensions = () => {
    const img = imageRef.current;
    if (img) {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });

      const containerWidth = img.clientWidth || img.offsetWidth || img.naturalWidth;
      const containerHeight = img.clientHeight || img.offsetHeight || img.naturalHeight;
      setImageDimensions({ width: containerWidth, height: containerHeight });
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = x / rect.width;
    const yPercent = y / rect.height;

    const actualX = xPercent * originalDimensions.width;
    const actualY = yPercent * originalDimensions.height;

    setSelectedTaskId(null);
    setSelectedPin(null);

    setTempPinPosition({ x: xPercent, y: yPercent });
    setTempTaskCoordinates({ x: actualX, y: actualY });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePinClick = (pin: SelectedPin | null) => {
    if (pin) {
      setTempPinPosition(null);
      setTempTaskCoordinates(null);
      setSelectedPin(pin);
      setSelectedTaskId(pin.id);
    } else {
      setSelectedPin(null);
      setSelectedTaskId(null);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSelectedPin({ id: taskId, type: "task" });
  };

  const handleCancelTempPin = () => {
    setTempPinPosition(null);
    setTempTaskCoordinates(null);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setTempPinPosition(null);
    setTempTaskCoordinates(null);
  };

  const handleCreateTask = async (title: string, description?: string) => {
    if (!userId || !tempTaskCoordinates) {
      throw new Error("User ID or task coordinates not available");
    }

    await createTask({
      userId,
      title,
      description,
      floorPlanX: tempTaskCoordinates.x,
      floorPlanY: tempTaskCoordinates.y,
      checklistItems: [],
    });

    setTempPinPosition(null);
    setTempTaskCoordinates(null);
    setShowCreateModal(false);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setSelectedPin(null);
  };

  const handleUpdateTask = async (id: string, updates: Partial<TaskDocType>) => {
    await updateTask(id, updates);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const selectedTask = selectedTaskId ? getTaskById(selectedTaskId) || null : null;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Construction Plan</h1>
            <p className="text-gray-600 mt-1">Welcome, {userName}!</p>
          </div>
          <div className="flex gap-2">
            {tempPinPosition && (
              <>
                <Button onClick={handleOpenCreateModal}>Add Task</Button>
                <Button variant="secondary" onClick={handleCancelTempPin}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <PlanView
                tasks={tasks}
                selectedPin={selectedPin}
                setSelectedPin={handlePinClick}
                isAddingPin={!!tempPinPosition}
                tempPinPosition={tempPinPosition}
                tempTaskCoordinates={tempTaskCoordinates}
                onImageClick={handleImageClick}
                imageDimensions={imageDimensions}
                originalDimensions={originalDimensions}
                imageRef={imageRef}
                calculateImageDimensions={calculateImageDimensions}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Task List</h2>
              <TaskBoard onTaskSelect={handleTaskSelect} />
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          key={selectedTask.id}
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      <TaskCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateTask}
      />
    </main>
  );
}
