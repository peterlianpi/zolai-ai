"use client";

import { createContext, useContext, useState } from "react";

type TablePaginationMode = "infinite" | "normal";

interface UserPreferencesContextType {
  tablePagination: TablePaginationMode;
  isLoading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  tablePagination: "infinite",
  isLoading: true,
});

export function UserPreferencesProvider({
  children,
  initialTablePagination = "infinite",
}: {
  children: React.ReactNode;
  initialTablePagination?: TablePaginationMode;
}) {
  const [tablePagination] = useState<TablePaginationMode>(initialTablePagination);
  const [isLoading] = useState(false);

  // We no longer fetch on mount, as this is seeded from the server in protected layout.
  // The mutation/update logic can still go here if needed, but for now we just provide it.

  return (
    <UserPreferencesContext.Provider value={{ tablePagination, isLoading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useTablePagination() {
  return useContext(UserPreferencesContext);
}
