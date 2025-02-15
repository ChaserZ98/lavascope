import { Button, TableCell, TableRow, Tooltip } from "@heroui/react";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "@tanstack/react-router";

import { GroupState } from "@/store/firewall/groups";

interface GroupProps extends React.ComponentProps<"tr"> {
    group: GroupState;
    refreshing: boolean;
    onGroupDelete: (id: string) => void;
}

export default function Group(props: GroupProps) {
    const group = props.group;
    const loading = props.refreshing || group.deleting;

    return (
        <TableRow className={loading ? "animate-pulse" : ""}>
            <TableCell>{group.id}</TableCell>
            <TableCell>{group.description}</TableCell>
            <TableCell>
                {new Date(group.date_created).toLocaleString(
                    Intl.DateTimeFormat().resolvedOptions().locale,
                    {
                        timeZoneName: "short",
                        hour12: false,
                    }
                )}
            </TableCell>
            <TableCell>{group.rule_count}</TableCell>
            <TableCell>{group.instance_count}</TableCell>
            <TableCell>
                <div className="flex w-16 items-center justify-end">
                    {!loading && (
                        <Tooltip content="Edit" delay={1000} closeDelay={100}>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="primary"
                                to={`/groups/${group.id}`}
                                className="text-default-400 transition-colors-opacity hover:text-primary-400"
                                as={Link}
                            >
                                <Icon
                                    path={mdiPencil}
                                    size={0.75}
                                    className="cursor-pointer"
                                />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip content="Delete" delay={1000} closeDelay={100}>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="text-default-400 transition-colors-opacity hover:text-danger-400"
                            onPress={() => props.onGroupDelete(group.id)}
                            disabled={loading}
                        >
                            <Icon path={mdiTrashCan} size={0.75} />
                        </Button>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
}
