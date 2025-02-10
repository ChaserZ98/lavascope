import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    loader: () => {
        // Redirect to /groups
        throw redirect({
            to: "/groups",
        });
    },
});
