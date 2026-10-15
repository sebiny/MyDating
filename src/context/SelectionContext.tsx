"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type SelectionContextType = {
  selectedIds: number[];
  toggleSelection: (id: number) => void;
  removeSelection: (id: number) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined,
);

//the name used to identify a piece of data in localStorage
const STORAGE_KEY = "selectedIds";
const CHANGE_EVENT = "selectedIdsChanged";

// Read the saved value from localStorage.
function getSnapshot(): string {
  //snapshot is a pic of the current state of something
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
    //you will get selectedIds saved in the localStorage
  } catch {
    return "[]";
  }
}
// The server must return a stable snapshot during SSR.
//server can't access the browser's localStorage and when Next.js renders the page on the server, it needs a safe initial value. So we provide []
function getServerSnapshot(): string {
  return "[]";
}
// Subscribe to changes in localStorage.
// listen for changes to the saved selection data, and let React know when sth changes.
function subscribe(callback: () => void) {
  function handleChange() {
    callback();
    //function passed into subscribe
    //and this callback comes from useSyncExternalStore
  }
  //it tells the browser to listen for a particular event
  //it  starts listening
  //JS methods provided by the browser
  //window is a browser object that represents the browser and provides access to browser features.
  window.addEventListener("storage", handleChange);
  window.addEventListener(CHANGE_EVENT, handleChange);
  //it stops listening
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(CHANGE_EVENT, handleChange);
  };
}
// Notify this tab when localStorage changes.
function saveIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  //saves the JSON.stringify(ids) under the key "STORAGE_KEY"
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function SelectionProvider({ children }: { children: ReactNode }) {
  const savedValue = useSyncExternalStore(
    subscribe,
    //tells React how to listen for changes
    getSnapshot,
    //tells React how to read the curent value in the browser
    getServerSnapshot,
    //provides the initial value during server rendering and hydration
  );
  let selectedIds: number[] = [];
  //this ids need to be reassigned
  try {
    const parsed: unknown = JSON.parse(savedValue);
    // localStorage stores data as strings, not as JavaScript arrays or objects. so we need to parse it to be a JS data
    if (
      //if parsed is array do .every
      Array.isArray(parsed) &&
      // true if every item passes the condition.
      // false if at least one item fails the condition.
      parsed.every((id) => typeof id === "number" && Number.isFinite(id))
    ) {
      selectedIds = parsed;
    }
  } catch {
    selectedIds = [];
  }
  function toggleSelection(id: number) {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    saveIds(nextIds);
  }
  function removeSelection(id: number) {
    saveIds(selectedIds.filter((selectedId) => selectedId !== id));
  }
  function clearSelection() {
    saveIds([]);
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
