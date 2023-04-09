import { GLangNode, GLangEdge, GLangGraph } from './types';
import { getNode, getEdge } from './crud';

function* output_edge_ids<NodeData>(node: GLangNode<NodeData>): IterableIterator<string> {
    for (const output of node.outputs) {
        for (const edge_id of output) {
            yield edge_id;
        }
    }
}

function* output_edges<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
): IterableIterator<GLangEdge<EdgeData>> {
    for (const edge_id of output_edge_ids(node)) {
        yield getEdge(graph, edge_id);
    }
}

function* output_node_ids<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
): IterableIterator<string> {
    for (const edge of output_edges(graph, node)) {
        yield edge.dst.node_id;
    }
}

function* unique_output_node_ids<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
): IterableIterator<string> {
    const node_id_set = new Set<string>();
    for (const output_node_id of output_node_ids(graph, node)) {
        if (!node_id_set.has(output_node_id)) {
            node_id_set.add(output_node_id);
            yield output_node_id;
        }
    }
}

function* input_edge_ids<NodeData>(node: GLangNode<NodeData>): IterableIterator<string> {
    for (const input of node.inputs) {
        if (input !== null) yield input;
    }
}

function* input_edges<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
): IterableIterator<GLangEdge<EdgeData>> {
    for (const edge_id of input_edge_ids(node)) {
        yield getEdge(graph, edge_id);
    }
}

function* input_node_ids<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
) {
    for (const edge of input_edges(graph, node)) {
        yield edge.src.node_id;
    }
}

function* unique_input_node_ids<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    node: GLangNode<NodeData>,
) {
    const node_id_set = new Set<string>();
    for (const input_node_id of input_node_ids(graph, node)) {
        if (!node_id_set.has(input_node_id)) {
            node_id_set.add(input_node_id);
            yield input_node_id;
        }
    }
}

enum VisitStatus {
    Unvisited,
    Visiting,
    Visited,
}

// This function walks a graph in depth first order. It records the path that has been traversed to
// reach the current node using a stack. It calls one function (f) when elements are pushed to the
// stack, and another (g) when they are popped. In a cycle-free graph, when the first function is
// evaluated on a node, neither function has been evaluated on any of its descendants. And when the
// second function is called on a node, both the first and second function have been called on all
// its descendants.
//
// The argument child_node_ids must return an iterator for the "child" nodes of a given node. If you
// pass in unique_output_node_ids, you get a forward traversal. If you pass in
// unique_input_node_ids, you get a backward traversal.
//
// The function returns true (and stops traversing) if a cycle is detected. It returns false
// otherwise.
function generic_depth_first_traversal<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    start_node_id: string,
    f: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
    g: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
    child_node_ids: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => IterableIterator<string>,
): boolean {
    function* start_node_generator(): IterableIterator<string> {
        yield start_node_id;
    }

    const node_status = new Map<string, VisitStatus>();
    // The iterator yields the unique node ids reachable from the current parent node via a single
    // edge hop. The string holds the last value yielded by the iterator, or is null if we have yet
    // to call the iterator for the first time.
    const stack: [string | null, IterableIterator<string>][] = [[null, start_node_generator()]];

    while (stack.length > 0) {
        const [prev_node_id, next_node_id_itr] = stack[stack.length - 1];
        const next_node_id: string | undefined = next_node_id_itr.next().value;

        if (prev_node_id !== null) {
            // If the previous node isn't null, exit it.
            const prev_node = getNode(graph, prev_node_id);
            g(graph, prev_node_id, prev_node);
            node_status.set(prev_node_id, VisitStatus.Visited);
        }

        if (next_node_id !== undefined) {
            const status = node_status.get(next_node_id) ?? VisitStatus.Unvisited;
            if (status === VisitStatus.Visiting) {
                // We found a cycle.
                return true;
            }
            if (status === VisitStatus.Visited) {
                // Multiple paths connect start_node_id and next_node_id.
                continue;
            }

            // For unvisited nodes, we call f and push next_node's children onto the stack.
            const next_node = getNode(graph, next_node_id);
            node_status.set(next_node_id, VisitStatus.Visiting);
            f(graph, next_node_id, next_node);
            stack[stack.length - 1][0] = next_node_id;
            stack.push([null, child_node_ids(graph, next_node_id, next_node)]);
            continue;
        }

        // We only reach this instruction if the current parent node has no more children to visit.
        stack.pop();
    }

    return false;
}

function forward_depth_first_traversal<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    start_node_id: string,
    f: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
    g: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
) {
    return generic_depth_first_traversal(
        graph,
        start_node_id,
        f,
        g,
        (graph, node_id, node) => unique_output_node_ids(graph, node),
    );
}

function backward_depth_first_traversal<NodeData, EdgeData>(
    graph: GLangGraph<NodeData, EdgeData>,
    start_node_id: string,
    f: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
    g: (graph: GLangGraph<NodeData, EdgeData>, node_id: string, node: GLangNode<NodeData>) => void,
) {
    return generic_depth_first_traversal(
        graph,
        start_node_id,
        f,
        g,
        (graph, node_id, node) => unique_input_node_ids(graph, node),
    );
}

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

export {
    generic_depth_first_traversal,
    forward_depth_first_traversal,
    backward_depth_first_traversal,
    traverse_forward_breadth_first,
    traverse_backward_breadth_first
};
