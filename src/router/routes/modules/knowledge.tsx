import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";
import { Outlet } from "react-router";

import type { AppRouteObject } from "#/router";

const Knowledge = lazy(() => import("@/pages/knowledge"));
const KnowledgeDetail = lazy(() => import("@/pages/knowledge/detail"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}

const knowledge: AppRouteObject[] = [
  // {
  //   path: "knowledge",
  //   element: (
  //     <Suspense fallback={<CircleLoading />}>
  //       <Outlet />
  //     </Suspense>
  //   ),
  //   meta: {
  //     label: "sys.menu.knowledge",
  //     icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
  //     key: "/knowledge",
  //   },
  //   children: [
  //     {
  //       index: false,
  //       element: <Knowledge />,
  //     },
  //     {
  //       path: ":id",
  //       element: <KnowledgeDetail />,
  //       meta: {
  //         label: "sys.menu.knowledge_detail",
  //         key: "/knowledge/:id",
  //       },
  //     },
  //   ],
  // },
];

export default knowledge;