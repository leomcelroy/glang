import { GLangNode, GLangEdge, GLangGraph } from './types';

function createGraph<NodeData, EdgeData>(): GLangGraph<NodeData, EdgeData> {
    return {
        nodes: {},
        edges: {},
    };
}

function getNode<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string
): GLangNode<NodeData> {
    if (!(node_id in graph.nodes)) {
        throw new Error(`Node ${node_id} does not exist.`);
    }
    return graph.nodes[node_id];
}

function getEdge<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    edge_id: string
): GLangEdge<EdgeData> {
    if (!(edge_id in graph.edges)) {
        throw new Error(`Edge ${edge_id} does not exist.`);
    }
    return graph.edges[edge_id];
}

function getInputValues<NodeData, EdgeData, InputType>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string,
    get_value: (node_data: NodeData) => InputType,
): Array<InputType | null> {
    const node = getNode(graph, node_id);
    const values = node.inputs.map(edge_id => {
        if (edge_id === null) return null;

        const edge = getEdge(graph, edge_id);
        const input_id = edge.src.node_id;
        const input_node = getNode(graph, input_id);

        return get_value(input_node.data);
    });

    return values;
}

function addNode<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    data: NodeData,
    n_inputs: number = 0,
    n_outputs: number = 0,
): string {
    const node_id = crypto.randomUUID();
    if (node_id in graph.nodes) {
        throw new Error(`Node ID ${node_id} already exists.`);
    }
    const node = {
        data: data,
        inputs: Array(n_inputs).fill(null),
        outputs: Array(n_outputs).fill(new Set<string>()),
    };
    graph.nodes[node_id] = node;
    return node_id;
}

function removeNode<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string
) {
    if (!(node_id in graph.nodes)) {
        throw new Error(`Node ${node_id} does not exist.`);
    }
    const node = graph.nodes[node_id];

    for (const edge_set of node.outputs) {
        for (const edge of edge_set) {
            removeEdge(graph, edge);
        }
    }
    for (const edge of node.inputs) {
        if (edge !== null) {
            removeEdge(graph, edge);
        }
    }

    delete graph.nodes[node_id];
}

function addInput<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string
): number {
    const node = getNode(graph, node_id);
    const input_idx = node.inputs.length;
    node.inputs.push(null);
    return input_idx;
}

function removeInput<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string,
    input_idx: number
) {
    const node = getNode(graph, node_id);
    if (input_idx >= node.inputs.length) {
        throw new Error(`Input index ${input_idx} is out of bounds.`);
    }
    const existing_edge = node.inputs[input_idx];
    if (existing_edge !== null) {
        removeEdge(graph, existing_edge);
    }
    node.inputs.splice(input_idx, 1);
    for (const edge_id of node.inputs.slice(input_idx)) {
        if (edge_id !== null) {
            const edge = getEdge(graph, edge_id);
            edge.dst.idx -= 1;
        }
    }
}

function addOutput<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string
): number {
    const node = getNode(graph, node_id);
    const output_idx = node.outputs.length;
    node.outputs.push(new Set<string>());
    return output_idx;
}

function removeOutput<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string,
    output_idx: number
) {
    const node = getNode(graph, node_id);
    if (output_idx >= node.outputs.length) {
        throw new Error(`Output index ${output_idx} is out of bounds.`);
    }
    for (const edge_id of node.outputs[output_idx]) {
        removeEdge(graph, edge_id);
    }
    node.outputs.splice(output_idx, 1);
    for (const output of node.outputs.slice(output_idx)) {
        for (const edge_id of output) {
            const edge = getEdge(graph, edge_id);
            edge.src.idx -= 1;
        }
    }
}

function addEdge<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    data: EdgeData,
    src_node_id: string,
    src_idx: number,
    dst_node_id: string,
    dst_idx: number
): string {
    // Create the edge.
    const edge_id = crypto.randomUUID();
    if (edge_id in graph.edges) {
        throw new Error(`Edge ID ${edge_id} already exists.`);
    }
    const edge = {
        data: data,
        src: {node_id: src_node_id, idx: src_idx},
        dst: {node_id: dst_node_id, idx: dst_idx},
    };
    graph.edges[edge_id] = edge;

    // Link it to its src and dst nodes.
    const src_node = getNode(graph, src_node_id);
    src_node.outputs[src_idx].add(edge_id);
    const dst_node = getNode(graph, dst_node_id);
    const existing_edge = dst_node.inputs[dst_idx];
    if (existing_edge !== null) {
        removeEdge(graph, existing_edge);
    }
    dst_node.inputs[dst_idx] = edge_id;

    // Return the new edge id.
    return edge_id;
}

function removeEdge<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    edge_id: string
) {
    const edge = getEdge(graph, edge_id);
    const src_node = getNode(graph, edge.src.node_id);
    src_node.outputs[edge.src.idx].delete(edge_id);
    const dst_node = getNode(graph, edge.dst.node_id);
    dst_node.inputs[edge.dst.idx] = null;
    delete graph.edges[edge_id];
}

export {
    createGraph,
    getNode,
    getEdge,
    getInputValues,
    addNode,
    removeNode,
    addInput,
    removeInput,
    addOutput,
    removeOutput,
    addEdge,
    removeEdge,
};
