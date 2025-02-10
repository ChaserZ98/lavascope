import "@css/tailwind.css";

import { Spinner } from "@heroui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import AppError from "./AppError";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
    routeTree,
    defaultPendingComponent: () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <Spinner label="Loading..." />
        </div>
    ),
    defaultErrorComponent: ({ error, reset }) => (
        <AppError error={error} reset={reset} />
    ),
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
