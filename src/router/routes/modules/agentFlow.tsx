import { Suspense, lazy } from "react";
import { Outlet } from "react-router";

import { SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const AgentFlowListPage = lazy(() => import("@/pages/agentFlow/list"));
const AgentFlowEditorPage = lazy(() => import("@/pages/agentFlow/index"));

const agentFlow: AppRouteObject = {
  order: 3,
  path: "agentFlow",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: "智能工作流",
    icon: (
      <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />
    ),
    key: "/agentFlow",
  },
  children: [
    {
      path: "list",
      index: true,
      element: <AgentFlowListPage />,
      meta: {
        label: "流程列表",
        key: "/agentFlow/list",
        hideMenu: false, // 不在菜单中显示编辑器页面
      },
    },
    {
      path: "editor",
      element: <AgentFlowEditorPage />,
      meta: {
        label: "流程编辑器",
        key: "/agentFlow/editor",
        hideMenu: true, // 不在菜单中显示编辑器页面
      },
    },
  ],
};

export default agentFlow;