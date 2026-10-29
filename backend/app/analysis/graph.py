"""
Connected-scam relationship graph using NetworkX.

Builds a graph where nodes are reports and synthetic identifiers.
Edges explain WHY two entities are connected.
Never exposes reports outside the caller's authorized scope.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import networkx as nx

logger = logging.getLogger(__name__)


@dataclass
class ReportNode:
    report_id: str
    external_id: str
    category: str
    status: str
    risk_score: Optional[int]
    risk_level: Optional[str]
    synthetic_destination_ref: Optional[str]
    synthetic_indicators: Optional[str]


@dataclass
class GraphResult:
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    summary: Dict[str, Any]


class ScamRelationshipGraph:
    """
    Builds a NetworkX graph of report relationships based on shared
    synthetic identifiers. No personal data is used as a node or edge.
    """

    def build(self, reports: List[ReportNode]) -> GraphResult:
        G = nx.Graph()

        # Index by synthetic destination ref and indicators
        dest_index: Dict[str, List[str]] = {}   # dest_ref -> [report_ids]
        indicator_index: Dict[str, List[str]] = {}  # indicator -> [report_ids]

        for r in reports:
            node_id = f"report:{r.report_id}"
            G.add_node(
                node_id,
                node_type="report",
                report_id=r.report_id,
                external_id=r.external_id,
                category=r.category,
                status=r.status,
                risk_score=r.risk_score,
                risk_level=r.risk_level,
                label=r.external_id,
            )

            if r.synthetic_destination_ref:
                dest = r.synthetic_destination_ref.strip()
                dest_node_id = f"dest:{dest}"
                G.add_node(dest_node_id, node_type="synthetic_destination", label=dest, value=dest)
                dest_index.setdefault(dest, []).append(r.report_id)

            if r.synthetic_indicators:
                for ind in r.synthetic_indicators.split(","):
                    ind = ind.strip()
                    if not ind:
                        continue
                    ind_node_id = f"indicator:{ind}"
                    G.add_node(ind_node_id, node_type="synthetic_indicator", label=ind, value=ind)
                    indicator_index.setdefault(ind, []).append(r.report_id)

        # Add edges for shared synthetic destination
        for dest, rids in dest_index.items():
            dest_node_id = f"dest:{dest}"
            for rid in rids:
                report_node_id = f"report:{rid}"
                G.add_edge(
                    report_node_id,
                    dest_node_id,
                    edge_type="references_destination",
                    reason=f"References synthetic destination: {dest}",
                )

        # Add edges for shared indicators
        for ind, rids in indicator_index.items():
            ind_node_id = f"indicator:{ind}"
            for rid in rids:
                report_node_id = f"report:{rid}"
                G.add_edge(
                    report_node_id,
                    ind_node_id,
                    edge_type="shares_indicator",
                    reason=f"Shares synthetic indicator: {ind}",
                )

        # Build serializable output
        nodes_out = []
        for node_id, data in G.nodes(data=True):
            nodes_out.append({"id": node_id, **data})

        edges_out = []
        for src, tgt, data in G.edges(data=True):
            edges_out.append({"source": src, "target": tgt, **data})

        # Summary stats
        components = list(nx.connected_components(G))
        summary = {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "connected_components": len(components),
            "largest_component_size": max((len(c) for c in components), default=0),
            "disclaimer": (
                "Connections are based on shared synthetic identifiers. "
                "A shared identifier does not prove that parties are the same person "
                "or that any party is guilty of fraud."
            ),
        }

        return GraphResult(nodes=nodes_out, edges=edges_out, summary=summary)


_graph_builder = ScamRelationshipGraph()


def get_graph_builder() -> ScamRelationshipGraph:
    return _graph_builder
