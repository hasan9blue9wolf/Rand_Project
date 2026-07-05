import { create } from "zustand";

export type AppToastTone = "info" | "success";

type ToastPayload = {
  message: string;
  tone?: AppToastTone;
};

type ToastState = {
  hideToast: () => void;
  message: string | null;
  showToast: (payload: ToastPayload) => void;
  tone: AppToastTone;
};

export const useToastStore = create<ToastState>((set) => ({
  hideToast: () => set({ message: null }),
  message: null,
  showToast: ({ message, tone = "info" }) => set({ message, tone }),
  tone: "info",
}));
