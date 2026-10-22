"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/src/lib/supabase/browser";

type SelectionContextType = {
  selectedIds: string[];
  toggleSelection: (id: string) => Promise<void>;
  removeSelection: (id: string) => Promise<void>;
  clearSelection: () => Promise<void>;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadSelections = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSelectedIds([]);
        return;
      }
      const { data } = await supabase.from("selected_profiles").select("profile_id");
      // The query selects only profile_id, which is the ID list used by the selection UI.
      setSelectedIds(((data ?? []) as { profile_id: string }[]).map((selection) => selection.profile_id));
    } catch {
      setSelectedIds([]);
    }
  }, []);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    void loadSelections();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void loadSelections();
    });
    return () => subscription.unsubscribe();
  }, [loadSelections]);

  const toggleSelection = useCallback(async (id: string) => {
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (selectedIds.includes(id)) {
      const { error } = await supabase.from("selected_profiles").delete().eq("profile_id", id);
      if (!error) setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
      return;
    }
    const { error } = await supabase.from("selected_profiles").insert({ user_id: user.id, profile_id: id });
    if (!error) setSelectedIds((current) => current.includes(id) ? current : [...current, id]);
  }, [selectedIds]);

  const removeSelection = useCallback(async (id: string) => {
    try {
      const { error } = await createClient().from("selected_profiles").delete().eq("profile_id", id);
      if (!error) setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    } catch { /* Supabase is not configured yet. */ }
  }, []);

  const clearSelection = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("selected_profiles").delete().eq("user_id", user.id);
      if (!error) setSelectedIds([]);
    } catch { /* Supabase is not configured yet. */ }
  }, []);

  return (
    <SelectionContext.Provider value={{ selectedIds, toggleSelection, removeSelection, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used inside SelectionProvider");
  return context;
}
