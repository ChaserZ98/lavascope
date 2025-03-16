import { createFileRoute } from "@tanstack/react-router";

import IPEndpointsTable from "@/components/IPEndpointsTable";
import MyIPTable from "@/components/MyIPTable";
import { Version } from "@/store/ip";

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
                <IPEndpointsTable version={Version.V4} />
                <IPEndpointsTable version={Version.V6} />
            </div>
        </div>
    );
}
