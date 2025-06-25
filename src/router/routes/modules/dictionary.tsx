import { Suspense, lazy } from "react";
import { Outlet } from "react-router";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const DictionaryManagePage = lazy(() => import("@/pages/dictionary"));

const dictionary: AppRouteObject = {
  order: 8,
  path: "dictionary",
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: "sys.menu.dictionary",
    icon: (
      <Iconify
        icon="solar:book-bookmark-bold-duotone"
        className="ant-menu-item-icon"
        size="24"
      />
    ),
    key: "/dictionary",
  },
  children: [
    {
      index: true,
      element: <DictionaryManagePage />,
      meta: {
        label: "字典管理",
        key: "/dictionary",
      },
    },
  ],
};

export default dictionary;
