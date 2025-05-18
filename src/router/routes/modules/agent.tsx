import { Suspense, lazy } from "react";

import { Iconify, SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const Agent = lazy(() => import("@/pages/agent"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const agent: AppRouteObject[] = [
  {
    path: "agent",
    element: (
      <Wrapper>
        <Agent />
      </Wrapper>
    ),
    meta: {
      label: "agent",
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: "/agent",
    },
  },
];

export default agent;
