import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { KeepAliveTab } from "../types";

// Mock user data for demonstration - replace with real API calls
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
  },
  {
    id: "2",
    username: "user",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
  },
];

export function useTabLabelRender() {
  const { t } = useTranslation();

  const specialTabRenderMap = useMemo<
    Record<string, (tab: KeepAliveTab) => React.ReactNode>
  >(
    () => ({
      "sys.menu.system.user_detail": (tab: KeepAliveTab) => {
        const userId = tab.params?.id;
        const defaultLabel = t(tab.label);
        if (userId) {
          const user = mockUsers.find((item) => item.id === userId);
          return `${user?.username}-${defaultLabel}`;
        }
        return defaultLabel;
      },
    }),
    [t]
  );

  const renderTabLabel = (tab: KeepAliveTab) => {
    const specialRender = specialTabRenderMap[tab.label];
    if (specialRender) {
      return specialRender(tab);
    }
    return t(tab.label);
  };

  return renderTabLabel;
}
