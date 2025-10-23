import * as Jotai from "./jotai-dev-tools";
import * as TanStackRouter from "./tanstack-router-dev-tools";

export const JotaiDevTools = import.meta.env.PROD ? () => null : Jotai.JotaiDevTools;

export const TanStackRouterDevtools = import.meta.env.PROD ? () => null : TanStackRouter.TanStackRouterDevtools;
