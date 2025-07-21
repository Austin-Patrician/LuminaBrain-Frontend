import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";
import { Outlet } from "react-router";

import type { AppRouteObject } from "#/router";

const Prompt = lazy(() => import("@/pages/prompt"));
const PromptHistory = lazy(() => import("@/pages/prompt/history"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}

const prompt: AppRouteObject[] = [
  {
    path: "prompt",
    element: (
      <Suspense fallback={<CircleLoading />}>
        <Outlet />
      </Suspense>
    ),
    meta: {
      label: "sys.menu.prompt",
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: "/prompt",
    },
    children: [
      {
        index: true,
        element: <Prompt />,
        meta: {
          label: "sys.menu.prompt",
          key: "/prompt",
        },
      },
      {
        path: "history",
        element: <PromptHistory />,
        meta: {
          label: "sys.menu.promptHistory",
          key: "/prompt/history",
        },
      },
    ],
  },
];

export default prompt;
