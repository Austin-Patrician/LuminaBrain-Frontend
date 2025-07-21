import { Suspense, lazy } from "react";

import { Iconify } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const MarketPlace = lazy(() => import("@/pages/marketPlace"));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}

const marketplace: AppRouteObject[] = [
  {
    path: "marketplace",
    element: (
      <Wrapper>
        <MarketPlace />
      </Wrapper>
    ),
    meta: {
      label: "sys.menu.marketplace",
      icon: <Iconify icon="solar:shop-bold-duotone" size={24} />,
      key: "/marketplace",
    },
  },
];

export default marketplace;
