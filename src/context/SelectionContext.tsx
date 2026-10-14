"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SelectionContextType = {
  selectedIds: number[];
  toggleSelection: (id: number) => void;
  removeSelection: (id: number) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined,
);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggleSelection(id: number) {
    setSelectedIds((current) =>
      //current is current selected ids array
      current.includes(id)
        ? //if it's already an selected id, remove them
          current.filter((selectedId) => selectedId !== id)
        : //if not, add them to the selection
          [...current, id],
    );
  }

  function removeSelection(id: number) {
    setSelectedIds((current) =>
      current.filter((selectedId) => selectedId !== id),
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        toggleSelection,
        removeSelection,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }

  return context;
}
