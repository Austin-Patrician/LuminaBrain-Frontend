import { Suspense, lazy } from "react";
import { Outlet } from "react-router";

import { SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const AgentFlowListPage = lazy(() => import("@/pages/agentFlow/list"));
const AgentFlowEditorPage = lazy(() => import("@/pages/agentFlow/index"));
const AgentFlowRunPage = lazy(() => import("@/pages/agentFlow/run"));

const agentFlow: AppRouteObject = {
  order: 3,
  path: "agentFlow",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: "sys.menu.multiflow",
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
      path: "list/:id",
      element: <AgentFlowEditorPage />,
      meta: {
        label: "流程编辑器",
        key: "/agentFlow/list/:id",
        hideMenu: true, // 隐藏在菜单中
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
    {
      path: "run/:id",
      element: <AgentFlowRunPage />,
      meta: {
        label: "流程运行",
        key: "/agentFlow/run/:id",
        hideMenu: true, // 不在菜单中显示运行页面
      },
    },
  ],
};

export default agentFlow;
