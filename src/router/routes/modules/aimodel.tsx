import { Suspense, lazy } from "react";

import { Iconify, SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const AIModel = lazy(() => import("@/pages/aimodel"));

function Wrapper({ children }: any) {
	return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const aimodel: AppRouteObject[] = [
	{
		path: "aimodel",
		element: (
			<Wrapper>
				<AIModel />
			</Wrapper>
		),
		meta: {
			label: "sys.menu.aimodel",
			icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
			key: "/aimodel",
		},
	},
];

export default aimodel;
