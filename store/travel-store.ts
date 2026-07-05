import { create } from "zustand";

type SearchState = {
  destination: string;
  travelMonth: string;
  travelers: string;
  updateSearch: (payload: {
    destination: string;
    travelMonth: string;
    travelers: string;
  }) => void;
};

export const useTravelStore = create<SearchState>()((set) => ({
  destination: "",
  travelMonth: "",
  travelers: "",
  updateSearch: (payload) => set(payload),
}));
