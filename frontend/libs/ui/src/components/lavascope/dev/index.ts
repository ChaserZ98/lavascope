import * as Jotai from "./jotai-dev-tools";
import * as TanStackRouter from "./tanstack-router-dev-tools";

export const JotaiDevTools = process.env.NODE_ENV !== "development" ? () => null : Jotai.JotaiDevTools;

export const TanStackRouterDevtools = process.env.NODE_ENV !== "development" ? () => null : TanStackRouter.TanStackRouterDevtools;
