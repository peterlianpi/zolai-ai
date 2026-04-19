import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

interface UserPreferences {
  theme: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  tablePagination: string;
  telegramChatId: string | null;
  telegramEnabled: boolean;
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const response = await client.api.preferences.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }
      const result = await response.json();
      return result.data as UserPreferences;
    },
    staleTime: 1000 * 60 * 5,
  });
}
