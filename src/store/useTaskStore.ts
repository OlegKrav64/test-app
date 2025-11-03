import { create } from "zustand";
import { getTasksCollection } from "@/db/rxdb";
import type { TaskDocType, ChecklistItem } from "@/db/schemas/task.schema";
import { v4 as uuidv4 } from "uuid";

interface TaskState {
  tasks: TaskDocType[];
  isLoading: boolean;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  loadTasks: (userId: string) => Promise<void>;
  createTask: (task: Omit<TaskDocType, "id" | "createdAt" | "updatedAt">) => Promise<TaskDocType>;
  updateTask: (id: string, updates: Partial<TaskDocType>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addChecklistItem: (taskId: string, label: string) => Promise<void>;
  updateChecklistItem: (
    taskId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ) => Promise<void>;
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  getTaskById: (id: string) => TaskDocType | undefined;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  loadTasks: async (userId: string) => {
    try {
      set({ isLoading: true });
      const tasksCollection = await getTasksCollection();
      const tasks = await tasksCollection
        .find({
          selector: { userId },
        })
        .exec();

      const tasksData = tasks.map((task) => task.toJSON() as TaskDocType);
      set({ tasks: tasksData, isLoading: false });
    } catch {
      alert("Failed to load tasks");
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const tasksCollection = await getTasksCollection();
      const now = new Date().toISOString();
      const newTask = await tasksCollection.insert({
        id: uuidv4(),
        ...taskData,
        checklistItems: taskData.checklistItems ?? [],
        createdAt: now,
        updatedAt: now,
      });

      const task = newTask.toJSON() as TaskDocType;
      set((state) => ({ tasks: [...state.tasks, task] }));
      return task;
    } catch (error) {
      alert("Failed to create task");
      throw error;
    }
  },

  updateTask: async (id: string, updates: Partial<TaskDocType>) => {
    try {
      const tasksCollection = await getTasksCollection();
      const task = await tasksCollection.findOne(id).exec();
      if (!task) {
        throw new Error("Task not found");
      }

      await task.update({
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));
    } catch (error) {
      alert("Failed to update task");
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      const tasksCollection = await getTasksCollection();
      const task = await tasksCollection.findOne(id).exec();
      if (!task) {
        throw new Error("Task not found");
      }

      await task.remove();
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
      }));
    } catch (error) {
      alert("Failed to delete task");
      throw error;
    }
  },

  addChecklistItem: async (taskId: string, label: string) => {
    try {
      const state = get();
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const newItem: ChecklistItem = {
        id: uuidv4(),
        label: label.trim(),
        done: false,
        status: "Not started",
      };

      const updatedItems = [...task.checklistItems, newItem];
      await get().updateTask(taskId, { checklistItems: updatedItems });
    } catch (error) {
      alert("Failed to add checklist item");
      throw error;
    }
  },

  updateChecklistItem: async (taskId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    try {
      const state = get();
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const updatedItems = task.checklistItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      await get().updateTask(taskId, { checklistItems: updatedItems });
    } catch (error) {
      alert("Failed to update checklist item");
      throw error;
    }
  },

  removeChecklistItem: async (taskId: string, itemId: string) => {
    try {
      const state = get();
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const updatedItems = task.checklistItems.filter((item) => item.id !== itemId);
      await get().updateTask(taskId, { checklistItems: updatedItems });
    } catch (error) {
      alert("Failed to remove checklist item");
      throw error;
    }
  },

  getTaskById: (id: string) => {
    return get().tasks.find((t) => t.id === id);
  },
}));
