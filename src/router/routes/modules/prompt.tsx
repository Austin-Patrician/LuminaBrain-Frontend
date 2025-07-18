import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const Prompt = lazy(() => import("@/pages/prompt"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const applicaiton: AppRouteObject[] = [
  {
    path: "prompt",
    element: (
      <Wrapper>
        <Prompt />
      </Wrapper>
    ),
    meta: {
      label: "sys.menu.prompt",
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: "/prompt",
    },
  },
];

export default applicaiton;
