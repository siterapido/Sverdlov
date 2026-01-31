"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import {
    ChevronRight,
    ChevronDown,
    MapPin,
    Users,
    Building2,
    Layers,
    Circle,
    Plus,
    MoreHorizontal,
} from "lucide-react";

export interface NucleusData {
    id: string;
    name: string;
    type: "territorial" | "thematic";
    state: string;
    city: string;
    zone?: string | null;
    status: "dispersed" | "pre_nucleus" | "in_formation" | "active" | "consolidated";
    memberCount?: number;
    coordinatorName?: string;
}

interface TreeNode {
    id: string;
    label: string;
    type: "state" | "city" | "zone" | "nucleus";
    data?: NucleusData;
    children?: TreeNode[];
    memberCount?: number;
}

interface NucleiTreeViewProps {
    nuclei: NucleusData[];
    onSelect?: (nucleus: NucleusData) => void;
    onAddNucleus?: (location: { state: string; city: string; zone?: string }) => void;
    selectedId?: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    dispersed: { label: "Disperso", color: "bg-zinc-100 text-zinc-600" },
    pre_nucleus: { label: "Pré-núcleo", color: "bg-amber-100 text-amber-700" },
    in_formation: { label: "Em formação", color: "bg-blue-100 text-blue-700" },
    active: { label: "Ativo", color: "bg-emerald-100 text-emerald-700" },
    consolidated: { label: "Consolidado", color: "bg-purple-100 text-purple-700" },
};

function buildTree(nuclei: NucleusData[]): TreeNode[] {
    const stateMap = new Map<string, Map<string, Map<string, NucleusData[]>>>();

    // Group nuclei by state > city > zone
    nuclei.forEach(nucleus => {
        if (!stateMap.has(nucleus.state)) {
            stateMap.set(nucleus.state, new Map());
        }
        const cityMap = stateMap.get(nucleus.state)!;

        if (!cityMap.has(nucleus.city)) {
            cityMap.set(nucleus.city, new Map());
        }
        const zoneMap = cityMap.get(nucleus.city)!;

        const zoneKey = nucleus.zone || "__no_zone__";
        if (!zoneMap.has(zoneKey)) {
            zoneMap.set(zoneKey, []);
        }
        zoneMap.get(zoneKey)!.push(nucleus);
    });

    // Build tree structure
    const tree: TreeNode[] = [];

    stateMap.forEach((cityMap, state) => {
        const stateNode: TreeNode = {
            id: `state-${state}`,
            label: state,
            type: "state",
            children: [],
            memberCount: 0,
        };

        cityMap.forEach((zoneMap, city) => {
            const cityNode: TreeNode = {
                id: `city-${state}-${city}`,
                label: city,
                type: "city",
                children: [],
                memberCount: 0,
            };

            zoneMap.forEach((nucleiList, zone) => {
                if (zone === "__no_zone__") {
                    // Nuclei without zone go directly under city
                    nucleiList.forEach(nucleus => {
                        cityNode.children!.push({
                            id: nucleus.id,
                            label: nucleus.name,
                            type: "nucleus",
                            data: nucleus,
                            memberCount: nucleus.memberCount || 0,
                        });
                        cityNode.memberCount! += nucleus.memberCount || 0;
                    });
                } else {
                    // Create zone node
                    const zoneNode: TreeNode = {
                        id: `zone-${state}-${city}-${zone}`,
                        label: `Zona ${zone}`,
                        type: "zone",
                        children: [],
                        memberCount: 0,
                    };

                    nucleiList.forEach(nucleus => {
                        zoneNode.children!.push({
                            id: nucleus.id,
                            label: nucleus.name,
                            type: "nucleus",
                            data: nucleus,
                            memberCount: nucleus.memberCount || 0,
                        });
                        zoneNode.memberCount! += nucleus.memberCount || 0;
                    });

                    cityNode.children!.push(zoneNode);
                    cityNode.memberCount! += zoneNode.memberCount!;
                }
            });

            stateNode.children!.push(cityNode);
            stateNode.memberCount! += cityNode.memberCount!;
        });

        tree.push(stateNode);
    });

    // Sort by member count (descending)
    tree.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

    return tree;
}

export function NucleiTreeView({
    nuclei,
    onSelect,
    onAddNucleus,
    selectedId,
    className,
}: NucleiTreeViewProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

    const tree = React.useMemo(() => buildTree(nuclei), [nuclei]);

    // Filter tree based on search
    const filteredTree = React.useMemo(() => {
        if (!searchTerm) return tree;

        const term = searchTerm.toLowerCase();

        const filterNode = (node: TreeNode): TreeNode | null => {
            // Check if this node matches
            const nodeMatches = node.label.toLowerCase().includes(term);

            // Check if any children match
            const filteredChildren = node.children
                ?.map(child => filterNode(child))
                .filter((child): child is TreeNode => child !== null);

            // Include node if it matches or has matching children
            if (nodeMatches || (filteredChildren && filteredChildren.length > 0)) {
                return {
                    ...node,
                    children: filteredChildren || node.children,
                };
            }

            return null;
        };

        return tree
            .map(node => filterNode(node))
            .filter((node): node is TreeNode => node !== null);
    }, [tree, searchTerm]);

    // Auto-expand nodes when searching
    React.useEffect(() => {
        if (searchTerm) {
            const allIds = new Set<string>();
            const collectIds = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                    allIds.add(node.id);
                    if (node.children) collectIds(node.children);
                });
            };
            collectIds(filteredTree);
            setExpandedNodes(allIds);
        }
    }, [searchTerm, filteredTree]);

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const expandAll = () => {
        const allIds = new Set<string>();
        const collectIds = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                allIds.add(node.id);
                if (node.children) collectIds(node.children);
            });
        };
        collectIds(tree);
        setExpandedNodes(allIds);
    };

    const collapseAll = () => {
        setExpandedNodes(new Set());
    };

    const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = node.data && selectedId === node.data.id;

        const icons = {
            state: <MapPin className="h-4 w-4 text-primary" />,
            city: <Building2 className="h-4 w-4 text-blue-500" />,
            zone: <Layers className="h-4 w-4 text-amber-500" />,
            nucleus: <Circle className="h-3 w-3 text-emerald-500 fill-emerald-500" />,
        };

        return (
            <div key={node.id}>
                <div
                    className={cn(
                        "flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors",
                        "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                        isSelected && "bg-primary/10 border-l-2 border-primary",
                        depth > 0 && "ml-6"
                    )}
                    onClick={() => {
                        if (hasChildren) {
                            toggleNode(node.id);
                        }
                        if (node.data && onSelect) {
                            onSelect(node.data);
                        }
                    }}
                >
                    {/* Expand/collapse icon */}
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                        {hasChildren ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-zinc-400" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                            )
                        ) : null}
                    </span>

                    {/* Node icon */}
                    {icons[node.type]}

                    {/* Label */}
                    <span className={cn(
                        "flex-1 text-sm truncate",
                        node.type === "nucleus" ? "font-medium" : "font-semibold",
                        isSelected && "text-primary"
                    )}>
                        {node.label}
                    </span>

                    {/* Status badge for nuclei */}
                    {node.data && (
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 font-medium",
                            statusConfig[node.data.status].color
                        )}>
                            {statusConfig[node.data.status].label}
                        </span>
                    )}

                    {/* Member count */}
                    {node.memberCount !== undefined && node.memberCount > 0 && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {node.memberCount}
                        </span>
                    )}

                    {/* Add button for locations */}
                    {onAddNucleus && node.type !== "nucleus" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const location: { state: string; city: string; zone?: string } = {
                                    state: "",
                                    city: "",
                                };

                                if (node.type === "state") {
                                    location.state = node.label;
                                } else if (node.type === "city") {
                                    // Parse state from parent
                                    const [, state, city] = node.id.split("-");
                                    location.state = state;
                                    location.city = city;
                                } else if (node.type === "zone") {
                                    const parts = node.id.split("-");
                                    location.state = parts[1];
                                    location.city = parts[2];
                                    location.zone = parts.slice(3).join("-").replace("Zona ", "");
                                }

                                onAddNucleus(location);
                            }}
                            className="p-1 text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Adicionar núcleo"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="border-l border-zinc-200 dark:border-zinc-700 ml-5">
                        {node.children!.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700", className)}>
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                        Hierarquia de Núcleos
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={expandAll}
                            className="text-xs"
                        >
                            Expandir
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={collapseAll}
                            className="text-xs"
                        >
                            Recolher
                        </Button>
                    </div>
                </div>
                <SearchInput
                    placeholder="Buscar núcleo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                    inputSize="sm"
                />
            </div>

            {/* Tree */}
            <div className="max-h-[500px] overflow-y-auto">
                {filteredTree.length === 0 ? (
                    <div className="py-8 text-center text-sm text-zinc-500">
                        {searchTerm ? "Nenhum resultado encontrado" : "Nenhum núcleo cadastrado"}
                    </div>
                ) : (
                    <div className="py-2 group">
                        {filteredTree.map(node => renderNode(node))}
                    </div>
                )}
            </div>

            {/* Footer with stats */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{nuclei.length} núcleos</span>
                    <span>
                        {nuclei.reduce((sum, n) => sum + (n.memberCount || 0), 0)} membros total
                    </span>
                </div>
            </div>
        </div>
    );
}

export default NucleiTreeView;
