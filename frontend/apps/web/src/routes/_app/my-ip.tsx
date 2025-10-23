import { IPVersion } from "@lavascope/store";
import { IPEndpointsTable, MyIPTable } from "@lavascope/ui/components/lavascope";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/my-ip")({
    component: MyIP,
});

function MyIP() {
    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="max-w-[700px] w-full">
                <MyIPTable />
            </div>
            <div className="flex flex-wrap w-full justify-center">
                <IPEndpointsTable version={IPVersion.V4} />
                <IPEndpointsTable version={IPVersion.V6} />
            </div>
        </div>
    );
}
