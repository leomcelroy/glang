//--------------------------------------------------------------------------------------------------
// Types
//--------------------------------------------------------------------------------------------------

// TODO: Perhaps nodes/edges should know which graph they belong to.

interface GLangNode<NT, ET> {
    data: NT;

    inputs: {name: string, edge: GLangEdge<NT, ET> | null}[];
    outputs: {name: string, edges: Set<GLangEdge<NT, ET>>}[];
};

interface GLangEdge<NT, ET> {
    data: ET;

    src: {node: GLangNode<NT, ET>, port: number};
    dst: {node: GLangNode<NT, ET>, port: number};
};

interface GLangGraph<NT, ET> {
    nodes: Set<GLangNode<NT, ET>>;
    edges: Set<GLangEdge<NT, ET>>;
}


//--------------------------------------------------------------------------------------------------
// Constructors
//--------------------------------------------------------------------------------------------------

function makeGraph<NT, ET>(): GLangGraph<NT, ET> {
    return {
        nodes: new Set<GLangNode<NT, ET>>(),
        edges: new Set<GLangEdge<NT, ET>>(),
    };
}

function makeNode<NT, ET>(data: NT): GLangNode<NT, ET> {
    return {
        data: data,
        inputs: [],
        outputs: [],
    };
}

function makeEdge<NT, ET>(
    data: ET,
    dst_node: GLangNode<NT, ET>,
    dst_port: number,
    src_node: GLangNode<NT, ET>,
    src_port: number,
): GLangEdge<NT, ET> {
    return {
        data: data,
        src: {node: src_node, port: src_port},
        dst: {node: dst_node, port: dst_port},
    };
}


//--------------------------------------------------------------------------------------------------
// Graph Operations
//--------------------------------------------------------------------------------------------------

// TODO: Add assertions to ensure that the graph is valid.

function addNode<NT, ET>(graph: GLangGraph<NT, ET>, node:GLangNode<NT, ET>) {
    graph.nodes.add(node);
}

function removeNode<NT, ET>(graph: GLangGraph<NT, ET>, node: GLangNode<NT, ET>) {
    for (const edges of node.outputs.map((output) => output.edges)) {
        for (const edge of edges) {
            remove_edge(graph, edge);
        }
    }
    for (const edge of node.inputs.map((input) => input.edge)) {
        if (edge !== null) {
            remove_edge(graph, edge);
        }
    }
    graph.nodes.delete(node);
}

function add_edge<NT, ET>(
    graph: GLangGraph<NT, ET>,
    edge: GLangEdge<NT, ET>,
) {
    graph.edges.add(edge);
    edge.src.node.outputs[edge.src.port].edges.add(edge);
    const existing_edge = edge.dst.node.inputs[edge.dst.port].edge;
    if (existing_edge !== null) {
        remove_edge(graph, existing_edge);
    }
    edge.dst.node.inputs[edge.dst.port].edge = edge;
}

function remove_edge<NT, ET>(graph: GLangGraph<NT, ET>, edge: GLangEdge<NT, ET>) {
    edge.dst.node.inputs[edge.dst.port].edge = null;
    edge.src.node.outputs[edge.src.port].edges.delete(edge);
    graph.edges.delete(edge);
}
