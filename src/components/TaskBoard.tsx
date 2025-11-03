import { useTaskStore } from "@/store/useTaskStore";
import type { TaskDocType } from "@/db/schemas/task.schema";
import { cn } from "@/utils/lib";

interface TaskBoardProps {
  onTaskSelect: (taskId: string) => void;
}

export default function TaskBoard({ onTaskSelect }: TaskBoardProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks yet. Click on the plan to add a task!</p>
      </div>
    );
  }

  const getCompletedCount = (task: TaskDocType) => {
    return task.checklistItems.filter((item) => item.done).length;
  };

  const getTotalCount = (task: TaskDocType) => {
    return task.checklistItems.length;
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const completedCount = getCompletedCount(task);
        const totalCount = getTotalCount(task);
        const isSelected = selectedTaskId === task.id;

        return (
          <div
            key={task.id}
            onClick={() => onTaskSelect(task.id)}
            className={cn(
              "p-4 border rounded-lg cursor-pointer transition-all",
              isSelected
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>
                )}
                {totalCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      Checklist: {completedCount} / {totalCount} completed
                    </span>
                  </div>
                )}
              </div>
              {task.floorPlanX !== undefined && task.floorPlanY !== undefined && (
                <div className="ml-4 shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    On Plan
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
