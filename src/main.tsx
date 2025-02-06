import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { HeroUIProvider } from "@heroui/react";

import router from "@/routes/index";

import "@css/tailwind.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <HeroUIProvider navigate={router.navigate}>
            <RouterProvider router={router} />
        </HeroUIProvider>
    </React.StrictMode>
);
