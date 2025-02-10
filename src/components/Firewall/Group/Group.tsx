import { TableCell, Tooltip } from "@heroui/react";
import { mdiContentCopy, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";

export default function Group() {
    return (
        <>
            <TableCell className="text-foreground">1</TableCell>
            <TableCell className="text-foreground">123</TableCell>
            <TableCell className="text-foreground">123</TableCell>
            <TableCell className="text-foreground">123</TableCell>
            <TableCell className="flex items-center justify-center gap-2 text-foreground">
                <span className="flex-1">123</span>
                <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Copy" delay={1000}>
                        <button className="text-default-400 transition-colors-opacity duration-300 ease hover:text-primary-500">
                            <Icon
                                path={mdiContentCopy}
                                size={0.75}
                                className="cursor-pointer"
                            />
                        </button>
                    </Tooltip>
                    <Tooltip content="Refresh" delay={1000}>
                        <button className="text-default-400 transition-colors-opacity duration-300 ease hover:text-primary-500">
                            <Icon path={mdiRefresh} size={0.75} />
                        </button>
                    </Tooltip>
                </div>
            </TableCell>
            <TableCell className="text-foreground">123</TableCell>
        </>
    );
}
