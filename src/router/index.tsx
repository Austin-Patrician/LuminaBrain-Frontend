import DashboardLayout from "@/layouts/dashboard";
import PageError from "@/pages/sys/error/PageError";
import Login from "@/pages/sys/login/Login";
import GitHubCallback from "@/pages/sys/login/GitHubCallback";
import DocsPage from "@/pages/docs";
import ProtectedRoute from "@/router/components/protected-route";
import { usePermissionRoutes } from "@/router/hooks";
import { ERROR_ROUTE } from "@/router/routes/error-routes";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, type RouteObject, createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import type { AppRouteObject } from "#/router";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

const PUBLIC_ROUTE: AppRouteObject = {
	path: "/login",
	element: (
		<ErrorBoundary FallbackComponent={PageError}>
			<Login />
		</ErrorBoundary>
	),
};

const GITHUB_CALLBACK_ROUTE: AppRouteObject = {
	path: "/auth/github/callback",
	element: (
		<ErrorBoundary FallbackComponent={PageError}>
			<GitHubCallback />
		</ErrorBoundary>
	),
};

const DOCS_ROUTE: AppRouteObject = {
	path: "/docs",
	element: (
		<ErrorBoundary FallbackComponent={PageError}>
			<DocsPage />
		</ErrorBoundary>
	),
};

const NO_MATCHED_ROUTE: AppRouteObject = {
	path: "*",
	element: <Navigate to="/404" replace />,
};

export default function Router() {
	const permissionRoutes = usePermissionRoutes();

	const PROTECTED_ROUTE: AppRouteObject = {
		path: "/",
		element: (
			<ProtectedRoute>
				<DashboardLayout />
			</ProtectedRoute>
		),
		children: [{ index: true, element: <Navigate to={HOMEPAGE} replace /> }, ...permissionRoutes],
	};

	const routes = [PUBLIC_ROUTE, GITHUB_CALLBACK_ROUTE, DOCS_ROUTE, PROTECTED_ROUTE, ERROR_ROUTE, NO_MATCHED_ROUTE] as RouteObject[];

	const router = createHashRouter(routes);

	return <RouterProvider router={router} />;
}
