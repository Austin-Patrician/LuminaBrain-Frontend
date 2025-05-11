import { Suspense, lazy } from "react";

import { Iconify, SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const Knowledge = lazy(() => import("@/pages/knowledge"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const aimodel: AppRouteObject[] = [
  {
    path: "knowledge",
    element: (
      <Wrapper>
        <Knowledge />
      </Wrapper>
    ),
    meta: {
      label: "knowledge",
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: "/knowledge",
    },
  },
];

export default aimodel;
