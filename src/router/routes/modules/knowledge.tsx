import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";
import { Outlet } from "react-router";

import type { AppRouteObject } from "#/router";

const Knowledge = lazy(() => import("@/pages/knowledge/index"));
const KnowledgeDetail = lazy(() => import("@/pages/knowledge/detail"));
const KnowledgeItemDetail = lazy(() => import("@/pages/knowledge/item-detail"));

const knowledge: AppRouteObject[] = [
  {
    path: "knowledgemanagement",
    element: (
      <Suspense fallback={<CircleLoading />}>
        <Outlet />
      </Suspense>
    ),
    meta: {
      label: "sys.menu.knowledge",
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: "/knowledgemanagement",
    },
    children: [
      {
        index: true,
        meta: {
          label: "sys.menu.knowledge",
          key: "/knowledgemanagement",
        },
        element: <Knowledge />,
      },
      {
        path: ":id",
        element: <KnowledgeDetail />,
        meta: {
          label: "sys.menu.knowledgedetail",
          key: "/knowledgemanagement/:id",
          hideMenu: true, // 隐藏菜单
        },
      },
      {
        path: ":knowledgeId/item/:itemId",
        element: <KnowledgeItemDetail />,
        meta: {
          label: "sys.menu.knowledgeitemdetail",
          key: "/knowledgemanagement/:knowledgeId/item/:itemId",
          hideMenu: true, // 隐藏菜单
        },
      },
    ],
  },
];

export default knowledge;
