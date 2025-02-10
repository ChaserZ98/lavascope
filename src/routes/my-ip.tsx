import { createFileRoute } from "@tanstack/react-router";

import MyIPTable from "@/components/MyIPTable";

export const Route = createFileRoute("/my-ip")({
    component: MyIP,
});

function MyIP() {
    return (
        <div className="flex w-full h-full justify-center">
            <div className="max-w-[700px] w-full">
                <MyIPTable />
            </div>
        </div>
    );
}
