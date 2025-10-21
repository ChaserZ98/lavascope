import "@lavascope/tailwind";

import { initializeI18n } from "@lavascope/i18n";
import { initColorScheme, initTheme } from "@lavascope/store";
import { Spinner } from "@lavascope/ui/components/ui/spinner";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import AppError from "./AppError";
import { routeTree } from "./routeTree.gen";
import { createIDBPersister } from "./utils/persister";

const router = createRouter({
    routeTree,
    defaultPendingComponent: () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-2">
                <Spinner className="w-10 h-10" />
                <p>Loading...</p>
            </div>
        </div>
    ),
    defaultErrorComponent: ({ error, reset }) => (
        <AppError error={error} reset={reset} />
    ),
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
});
const persister = createIDBPersister("reactQuery");

function initReact() {
    const root = document.getElementById("root");
    initTheme();
    initColorScheme();
    if (!root) throw new Error("Root element not found");

    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
        <StrictMode>
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{ persister }}
            >
                <I18nProvider i18n={i18n}>
                    <RouterProvider router={router} />
                </I18nProvider>
            </PersistQueryClientProvider>
        </StrictMode>
    );
}

async function main() {
    await initializeI18n();
    initReact();
}

main();
