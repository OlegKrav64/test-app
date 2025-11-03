import { useState, useEffect, type FormEvent } from "react";
import type { TaskDocType } from "@/db/schemas/task.schema";
import { X } from "lucide-react";
import ChecklistEditor from "@/components/ChecklistEditor";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface TaskDetailModalProps {
  task: TaskDocType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TaskDocType>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) {
    return null;
  }

  const handleCancel = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
    onClose();
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Task" : task.title}
            </h2>
            <button onClick={onClose} className="text-gray-400 cursor-pointer" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 text-left">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label
                    htmlFor="task-title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title *
                  </label>
                  <Input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={1}
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Add a description..."
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    loadingText="Saving..."
                    disabled={!title.trim()}
                  >
                    Save
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {task.description && (
                  <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                    <p className="text-gray-700">{formatDate(task.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <p className="text-gray-700">{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
                {task && (
                  <div className="pt-4 border-t border-gray-200">
                    <ChecklistEditor taskId={task.id} />
                  </div>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
