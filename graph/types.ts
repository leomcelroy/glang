type GLangNode<NodeData> = {
    data: NodeData;

    // Each input can only have zero or one edges connected to it.
    // If present, the string is a GLangEdge id.
    inputs: Array<string | null>

    // Each output can be connected to multiple edges.
    // The strings are GLangEdge ids.
    outputs: Array<Set<string>>
};

type GLangEdge<EdgeData> = {
    data: EdgeData;

    src: {node_id: string, idx: number};
    dst: {node_id: string, idx: number};
};

type GLangNodes<NodeData> = {
    [node_id: string]: GLangNode<NodeData>;
}

type GLangEdges<EdgeData> = {
    [edge_id: string]: GLangEdge<EdgeData>;
}

type GLangGraph<NodeData, EdgeData> = {
    nodes: GLangNodes<NodeData>;
    edges: GLangEdges<EdgeData>;
};

export {GLangNode, GLangEdge, GLangNodes, GLangEdges, GLangGraph};
