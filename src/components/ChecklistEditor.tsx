import { useState, type FormEvent } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ChecklistItem } from "@/db/schemas/task.schema";
import { cn } from "@/utils/lib";

interface ChecklistEditorProps {
  taskId: string;
}

type ChecklistItemStatus = ChecklistItem["status"];

const ChecklistItemStatusEnum = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  FINAL_CHECK_AWAITING: "Final Check awaiting",
  DONE: "Done",
} as const;

const statusOptions: ChecklistItemStatus[] = [
  ChecklistItemStatusEnum.NOT_STARTED,
  ChecklistItemStatusEnum.IN_PROGRESS,
  ChecklistItemStatusEnum.BLOCKED,
  ChecklistItemStatusEnum.FINAL_CHECK_AWAITING,
  ChecklistItemStatusEnum.DONE,
];

const getStatusColor = (status: ChecklistItemStatus) => {
  switch (status) {
    case ChecklistItemStatusEnum.NOT_STARTED:
      return "bg-gray-100 text-gray-700 border-gray-300";
    case ChecklistItemStatusEnum.IN_PROGRESS:
      return "bg-blue-100 text-blue-700 border-blue-300";
    case ChecklistItemStatusEnum.BLOCKED:
      return "bg-red-100 text-red-700 border-red-300";
    case ChecklistItemStatusEnum.FINAL_CHECK_AWAITING:
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case ChecklistItemStatusEnum.DONE:
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export default function ChecklistEditor({ taskId }: ChecklistEditorProps) {
  const [newItemLabel, setNewItemLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const isLoading = useTaskStore((state) => state.isLoading);
  const addChecklistItem = useTaskStore((state) => state.addChecklistItem);
  const updateChecklistItem = useTaskStore((state) => state.updateChecklistItem);
  const removeChecklistItem = useTaskStore((state) => state.removeChecklistItem);
  const getTaskById = useTaskStore((state) => state.getTaskById);

  const task = getTaskById(taskId);
  const items = task?.checklistItems || [];
  const completedCount = items.filter((item) => item.done).length;
  const totalCount = items.length;

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) {
      return;
    }

    setIsAdding(true);
    await addChecklistItem(taskId, newItemLabel);
    setNewItemLabel("");
    setIsAdding(false);
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    await updateChecklistItem(taskId, item.id, { done: !item.done });
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeChecklistItem(taskId, itemId);
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingLabel(item.label);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingLabel("");
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!editingLabel.trim()) {
      handleCancelEdit();
      return;
    }

    await updateChecklistItem(taskId, itemId, { label: editingLabel.trim() });
    setEditingItemId(null);
    setEditingLabel("");
  };

  const handleItemStatusChange = async (itemId: string, newStatus: ChecklistItemStatus) => {
    await updateChecklistItem(taskId, itemId, { status: newStatus });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Checklist</h3>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount} / {totalCount} completed
          </span>
        )}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          type="text"
          value={newItemLabel}
          onChange={(e) => setNewItemLabel(e.target.value)}
          placeholder="Add checklist item..."
          disabled={isAdding || isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          size="md"
          isLoading={isAdding}
          disabled={!newItemLabel.trim() || isLoading}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </form>
      {isLoading ? (
        <div className="text-sm text-gray-500 py-2">Loading checklist...</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-2">No checklist items yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <button
                type="button"
                onClick={() => handleToggleItem(item)}
                className={cn(
                  "shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  item.done
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 hover:border-blue-500"
                )}
                aria-label={item.done ? "Mark as incomplete" : "Mark as complete"}
              >
                {item.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>

              {editingItemId === item.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleSaveEdit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(item.id);
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    size="sm"
                    className="flex-1 border-blue-500"
                  />
                </div>
              ) : (
                <>
                  <span
                    onClick={() => handleStartEdit(item)}
                    className={cn(
                      "flex-1 text-sm cursor-text",
                      item.done ? "line-through text-gray-500" : "text-gray-900"
                    )}
                  >
                    {item.label}
                  </span>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleItemStatusChange(item.id, e.target.value as ChecklistItemStatus)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "shrink-0 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                      getStatusColor(item.status)
                    )}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
