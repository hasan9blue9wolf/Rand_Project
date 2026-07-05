import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorage } from "../services/storage";

type TutorialState = {
  completed: boolean;
  completeTutorial: () => void;
  resetTutorial: () => void;
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      completed: false,
      completeTutorial: () => set({ completed: true }),
      resetTutorial: () => set({ completed: false }),
    }),
    {
      merge: (persistedState, currentState) => {
        const persistedCompleted =
          persistedState &&
          typeof persistedState === "object" &&
          "completed" in persistedState &&
          typeof persistedState.completed === "boolean"
            ? persistedState.completed
            : currentState.completed;

        return {
          ...currentState,
          completed: persistedCompleted,
        };
      },
      name: "hayatrips-first-time-tutorial",
      storage: appStorage,
    },
  ),
);
