// import { GroupTable } from "@/components/Firewall/Groups/GroupTable";
import { GroupTable } from "@lavascope/ui/components/lavascope";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/groups/")({
    component: Groups,
});

function Groups() {
    return (
        // <main
        //     className="flex flex-col items-center justify-center gap-4 px-4
        //     md:m-auto md:max-w-5xl md:gap-10
        //     lg:max-w-7xl
        //     xl:max-w-[1536px]"
        // >
        <GroupTable />
        // </main>
    );
}
