type GLangNode<NodeData> = {
    data: NodeData;

    // these strings are GLangEdge ids
    inputs: Array<string | null>
    outputs: Array<Set<string>>
};

type GLangEdge<EdgeData> = {
    data: EdgeData;

    src: {node_id: string, idx: number};
    dst: {node_id: string, idx: number};
};

type GLangGraph<NodeData, EdgeData> = {
    nodes: Map<string, GLangNode<NodeData>>;
    edges: Map<string, GLangEdge<EdgeData>>;
};

export {GLangGraph, GLangNode, GLangEdge};
