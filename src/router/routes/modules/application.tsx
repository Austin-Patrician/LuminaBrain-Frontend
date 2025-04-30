import { Suspense, lazy } from "react";

import { Iconify, SvgIcon } from "@/components/icon";
import { CircleLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const Application = lazy(() => import("@/pages/application"));


function Wrapper({ children }: any) {
	return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const applicaiton: AppRouteObject[] = [
	{
		path: "application",
		element: (
			<Wrapper>
				<Application />
			</Wrapper>
		),
		meta: {
			label: "sys.menu.applicaiton.index",
			icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
			key: "/application",
		},
	},
];

export default applicaiton;
