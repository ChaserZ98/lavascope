import { useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useVultrAPI } from "@/hooks/vultr";
import { IListGroupsResponse } from "@/lib/vultr";
import {
    addGroupStateAtom,
    deleteGroupStateAtom,
    getCreatingGroupCountAtom,
    getGroupDescriptionAtom,
    groupsStateAtom,
    GroupState,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    persistCreatingGroupAtom,
    setDescriptionAtom,
    setGroupIsDeletingAtom,
    setGroupIsUpdatingAtom,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import logging from "@/utils/log";

export function useCreateGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const { t } = useLingui();

    const getCreatingGroupCount = useSetAtom(getCreatingGroupCountAtom);
    const addGroupState = useSetAtom(addGroupStateAtom);
    const deleteGroupState = useSetAtom(deleteGroupStateAtom);
    const persistCreatingGroup = useSetAtom(persistCreatingGroupAtom);

    const createGroupMutation = useMutation({
        mutationFn: async (description: string) => await vultrAPI.firewall.createGroup({ description }),
        onMutate: async (description) => {
            const count = getCreatingGroupCount();
            const creatingGroupId = `temp-${count}`;
            const creatingGroupState = {
                group: {
                    id: creatingGroupId,
                    description,
                    date_created: new Date().toISOString(),
                    date_modified: new Date().toISOString(),
                    instance_count: 0,
                    rule_count: 0,
                    max_rule_count: 0
                },
                newRule: {
                    [IPVersion.V4]: initialNewRuleIPv4,
                    [IPVersion.V6]: initialNewRuleIPv6,
                },
                newDescription: description,
                isUpdating: false,
                isDeleting: false,
                isCreating: true,
            };
            addGroupState(creatingGroupState);
            return {
                creatingGroupId,
                restore: () => {
                    deleteGroupState(creatingGroupId);
                }
            };
        },
        onSuccess: async (data, _, { creatingGroupId }) => {
            const group = data.firewall_group;
            const groupState: GroupState = {
                group,
                newRule: {
                    [IPVersion.V4]: initialNewRuleIPv4,
                    [IPVersion.V6]: initialNewRuleIPv6,
                },
                newDescription: group.description,
                isUpdating: false,
                isDeleting: false,
                isCreating: false,
            };
            persistCreatingGroup(creatingGroupId, groupState);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) => produce(state, (draft) => {
                draft.meta.total += 1;
                draft.firewall_groups.push(group);
            }));
            logging.info(`Successfully created a new firewall group.`);
        },
        onError: (err, _, context) => {
            if (context !== undefined) context.restore();
            logging.error(`Failed to create the new firewall group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(t`Failed to create the new firewall group: ${message}`);
        },
        retry: false,
    });

    return createGroupMutation;
}

export function useGroupsQuery() {
    const vultrAPI = useVultrAPI();

    const groupsQuery = useQuery({
        queryKey: ["groups"],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: vultrAPI.firewall.listGroups,
        select: (data) => data.firewall_groups,
        retry: false,
    });

    const setGroupsState = useSetAtom(groupsStateAtom);

    useEffect(() => {
        if (groupsQuery.isError) logging.error(`Failed to fetch firewall groups: ${groupsQuery.error}`);
    }, [groupsQuery.isError]);

    useEffect(() => {
        const data = groupsQuery.data;
        if (!data) return;
        setGroupsState((state) => {
            // add new groups or update existing ones
            data.forEach((group) => {
                const groupId = group.id;
                if (!state[groupId]) {
                    state[groupId] = {
                        group,
                        newRule: {
                            [IPVersion.V4]: initialNewRuleIPv4,
                            [IPVersion.V6]: initialNewRuleIPv6,
                        },
                        newDescription: group.description,
                        isUpdating: false,
                        isDeleting: false,
                        isCreating: false,
                    };
                } else {
                    state[groupId].group = group;
                }
            });
            // remove groups that are no longer in the data
            Object.keys(state).forEach((key) => {
                if (!data.find((group) => group.id === key)) {
                    // ignore groups that are being created, updated, or deleted since they will be handled by their respective mutations
                    if (state[key]?.isCreating || state[key]?.isUpdating || state[key]?.isDeleting) return;
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
        retry: false,
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
                    isCreating: false,
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
    const setGroupDescription = useSetAtom(setDescriptionAtom);
    const getGroupDescription = useSetAtom(getGroupDescriptionAtom);

    const updateGroupMutation = useMutation({
        mutationFn: async ({ groupId, description }: { groupId: string; description: string }) =>
            await vultrAPI.firewall.updateGroup({
                "firewall-group-id": groupId,
                description,
            }),
        onMutate: async ({ groupId, description }) => {
            setGroupIsUpdating(groupId, true);
            const oldDescription = getGroupDescription(groupId);
            setGroupDescription(groupId, description);
            return () => {
                setGroupDescription(groupId, oldDescription);
            };
        },
        onSuccess: async (_, { groupId, description }) => {
            queryClient.setQueryData(
                ["groups"],
                (state: IListGroupsResponse) => produce(state, (draft) => {
                    draft.firewall_groups = draft.firewall_groups.map((group) => (group.id === groupId ? { ...group, description } : group));
                })
            );
            logging.info(`Successfully updated group with ID ${groupId}`);
            toast.success(t`Successfully updated group with ID ${groupId}`);
        },
        onError: (err, _, restoreCache) => {
            if (restoreCache !== undefined) restoreCache();
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
    const deleteGroupState = useSetAtom(deleteGroupStateAtom);

    const deleteGroupMutation = useMutation({
        mutationKey: ["groups"],
        mutationFn: async (groupId: string) =>
            await vultrAPI.firewall.deleteGroup({
                "firewall-group-id": groupId,
            }),
        onMutate: async (groupId) => {
            setGroupIsDeleting(groupId, true);
        },
        onSuccess: async (_, groupId) => {
            deleteGroupState(groupId);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) =>
                produce(state, (draft) => {
                    draft.meta.total -= 1;
                    draft.firewall_groups = draft.firewall_groups.filter((group) => group.id !== groupId);
                })
            );
            logging.info(`Successfully deleted group with ID ${groupId}`);
            toast.success(t`Successfully deleted group with ID ${groupId}`);
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
