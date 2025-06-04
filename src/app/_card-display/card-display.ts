import type { CardFile } from "@/server/api/routers/files";
import { create } from "zustand";

export const useCurrentCardFileStore = create<{
  currentCard: CardFile | undefined;
  setCurrentCard: (cardFile: CardFile | undefined) => void;
}>()((set) => ({
  currentCard: undefined,
  setCurrentCard: (cardFile: CardFile | undefined) =>
    set((state) => ({ ...state, currentCard: cardFile })),
}));
