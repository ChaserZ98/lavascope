import { useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useVultrAPI } from "@/hooks/vultr";
import { IListGroupsResponse } from "@/lib/vultr";
import {
    groupsStateAtom,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    setGroupIsDeletingAtom,
    setGroupIsUpdatingAtom,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import logging from "@/utils/log";

export function useGroupsQuery() {
    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const groupsQuery = useQuery({
        queryKey: ["groups"],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: vultrAPI.firewall.listGroups,
        select: (data) => data.firewall_groups,
        retry: false,
    });

    const setGroupsState = useSetAtom(groupsStateAtom);

    useEffect(() => {
        if (groupsQuery.isError) {
            logging.error(
                `Failed to fetch firewall groups: ${groupsQuery.error}`
            );
            const message =
                groupsQuery.error instanceof Error
                    ? groupsQuery.error.message
                    : groupsQuery.error;
            toast.error(t`Failed to fetch firewall groups: ${message}`);
        }
    }, [groupsQuery.isError]);

    useEffect(() => {
        const data = groupsQuery.data || [];
        setGroupsState((state) => {
            // add new groups or update existing ones
            data.forEach((group) => {
                const groupId = group.id;
                if (!state[groupId]) {
                    state[groupId] = {
                        group: group,
                        newRule: {
                            [IPVersion.V4]: initialNewRuleIPv4,
                            [IPVersion.V6]: initialNewRuleIPv6,
                        },
                        newDescription: group.description,
                        isUpdating: false,
                        isDeleting: false,
                    };
                } else {
                    state[groupId].group = group;
                }
            });
            // remove groups that are no longer in the data
            Object.keys(state).forEach((key) => {
                if (!data.find((group) => group.id === key)) {
                    delete state[key];
                }
            });
        });
    }, [groupsQuery.data]);

    return groupsQuery;
}

export function useGroupQuery(groupId: string) {
    const vultrAPI = useVultrAPI();

    const groupQuery = useQuery({
        queryKey: ["groups", groupId],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: async () =>
            await vultrAPI.firewall.getGroup({ "firewall-group-id": groupId }),
        select: (data) => data.firewall_group,
    });

    const setGroupsState = useSetAtom(groupsStateAtom);

    useEffect(() => {
        if (!groupQuery.data) return;
        setGroupsState((state) => {
            if (!state[groupId]) {
                state[groupId] = {
                    group: groupQuery.data,
                    newRule: {
                        [IPVersion.V4]: initialNewRuleIPv4,
                        [IPVersion.V6]: initialNewRuleIPv6,
                    },
                    newDescription: groupQuery.data.description,
                    isUpdating: false,
                    isDeleting: false,
                };
            } else {
                state[groupId].group = groupQuery.data;
            }
        });
    }, [groupQuery.data]);

    return groupQuery;
}

export function useUpdateGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const { t } = useLingui();

    const setGroupIsUpdating = useSetAtom(setGroupIsUpdatingAtom);

    const updateGroupMutation = useMutation<
        void,
        Error,
        {
            groupId: string;
            description: string;
        }
    >({
        mutationFn: async ({ groupId, description }) =>
            await vultrAPI.firewall.updateGroup({
                "firewall-group-id": groupId,
                description,
            }),
        onMutate: async ({ groupId, description }) => {
            setGroupIsUpdating(groupId, true);
            await queryClient.cancelQueries({
                queryKey: ["groups"],
            });
            const previousGroupsState =
                queryClient.getQueryData<IListGroupsResponse>(["groups"]);
            const newGroupsState = {
                ...previousGroupsState,
                firewall_groups: previousGroupsState?.firewall_groups.map(
                    (group) => {
                        if (group.id === groupId) {
                            return {
                                ...group,
                                description,
                            };
                        }
                        return group;
                    }
                ),
            };
            queryClient.setQueryData(["groups"], newGroupsState);
            return { previousGroupsState };
        },
        onSuccess: async (_, { groupId }) => {
            logging.info(`Successfully updated group with ID ${groupId}`);
            toast.success(t`Successfully updated group with ID ${groupId}`);
            await queryClient.invalidateQueries({
                queryKey: ["groups"],
            });
        },
        onError: (err, _, context) => {
            const typedContext = context as {
                previousGroupsState: IListGroupsResponse;
            };
            queryClient.setQueryData(
                ["groups"],
                typedContext.previousGroupsState
            );
            logging.error(`Failed to update group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(t`Failed to update group: ${message}`);
        },
        onSettled: (_res, _err, { groupId }: { groupId: string }) => {
            setGroupIsUpdating(groupId, false);
        },
    });

    return updateGroupMutation;
}

export function useDeleteGroupMutation() {
    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const queryClient = useQueryClient();

    const setGroupIsDeleting = useSetAtom(setGroupIsDeletingAtom);

    const deleteGroupMutation = useMutation({
        mutationFn: async (groupId: string) =>
            await vultrAPI.firewall.deleteGroup({
                "firewall-group-id": groupId,
            }),
        onMutate: async (groupId) => {
            setGroupIsDeleting(groupId, true);
        },
        onSuccess: async (_, groupId) => {
            logging.info(`Successfully deleted group with ID ${groupId}`);
            toast.success(t`Successfully deleted group with ID ${groupId}`);
            await queryClient.invalidateQueries({
                queryKey: ["groups"],
            });
        },
        onError: (err) => {
            logging.error(`Failed to delete group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(t`Failed to delete group: ${message}`);
        },
        onSettled: (_res, _err, groupId: string) => {
            setGroupIsDeleting(groupId, false);
        },
    });
    return deleteGroupMutation;
}
