import { create } from "zustand";

interface ToastStructure {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title?: string;
  message?: string;
}

interface toastStoreType {
  toastList: ToastStructure[];
  Toast: (toast: Omit<ToastStructure, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<toastStoreType>((set, get) => ({
  toastList: [],
  removeToast: (id: string) =>
    set((state) => ({
      toastList: state.toastList.filter((t) => t.id !== id),
    })),

  Toast: ({ type, title, message }: Omit<ToastStructure, "id">) => {
    const id = Math.random().toString(36).slice(2);

    set((state) => ({
      toastList: [...state.toastList, { id, type, title, message }],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
}));

export const Toast = useToastStore.getState().Toast;
