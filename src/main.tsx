import "@css/tailwind.css";

import { Spinner } from "@heroui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import AppError from "./AppError";
import { routeTree } from "./routeTree.gen";
import { initializeI18n } from "./utils/i18n";

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

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

function initReact() {
    const root = document.getElementById("root");
    if (!root) throw new Error("Root element not found");

    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
        <StrictMode>
            <I18nProvider i18n={i18n}>
                <RouterProvider router={router} />
            </I18nProvider>
        </StrictMode>
    );
}

async function main() {
    await initializeI18n();
    initReact();
}

main();
