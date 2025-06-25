import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const ChatPage = lazy(() => import("@/pages/Chat"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}

const chat: AppRouteObject = {
  order: 2,
  path: "chat",
  element: (
    <Wrapper>
      <ChatPage />
    </Wrapper>
  ),
  meta: {
    label: "sys.menu.chat",
    icon: <Iconify icon="solar:chat-round-bold-duotone" size={24} />,
    key: "/chat",
  },
};

export default chat;