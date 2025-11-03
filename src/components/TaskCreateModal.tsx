import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description?: string) => Promise<void>;
}

export default function TaskCreateModal({ isOpen, onClose, onCreate }: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    setIsCreating(true);
    await onCreate(trimmedTitle, description.trim() || undefined);
    onClose();
    setIsCreating(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <button onClick={onClose} className="text-gray-400 cursor-pointer" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label
                htmlFor="create-task-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <Input
                id="create-task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={1}
                maxLength={100}
                disabled={isCreating}
                autoFocus
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label
                htmlFor="create-task-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="create-task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isCreating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Add a description (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isCreating}
                loadingText="Creating..."
                disabled={!title.trim()}
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
