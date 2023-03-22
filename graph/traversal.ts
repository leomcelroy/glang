import { GLangNode, GLangEdge, GLangGraph } from './types';
import { getNode, getEdge } from './crud';

// This function walks over all nodes in the transitive closure of the outputs of the specified node
// in breadth-first order, calling the specified function along the way.
function traverse_forward_breadth_first<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string,
    f: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
) {
    const visited = new Set<string>();
    const queue = [node_id];
    while (queue.length > 0) {
        const node_id = queue.shift();
        if (node_id === undefined) {
            throw new Error('Queue is empty.');
        }
        if (visited.has(node_id)) {
            continue;
        }
        visited.add(node_id);

        const node = getNode(graph, node_id);
        f(graph, node_id, node);

        for (const output of node.outputs) {
            for (const edge_id of output) {
                const edge = getEdge(graph, edge_id);
                queue.push(edge.dst.node_id);
            }
        }
    }
}

// This function walks over all nodes in the transitive closure of the inputs of the specified node
// in breadth-first order, calling the specified function along the way.
function traverse_backward_breadth_first<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node_id: string,
    f: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
) {
    const visited = new Set<string>();
    const queue = [node_id];
    while (queue.length > 0) {
        const node_id = queue.shift();
        if (node_id === undefined) {
            throw new Error('Queue is empty.');
        }
        if (visited.has(node_id)) {
            continue;
        }
        visited.add(node_id);

        const node = getNode(graph, node_id);
        f(graph, node_id, node);

        for (const input of node.inputs) {
            if (input !== null) {
                const edge = getEdge(graph, input);
                queue.push(edge.src.node_id);
            }
        }
    }
}

export { traverse_forward_breadth_first, traverse_backward_breadth_first };
