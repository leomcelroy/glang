import { GLangNode, GLangEdge, GLangGraph } from './types';
import { traverse_depth_first_backward } from './traversal';

// This functions topologically sorts the nodes in a graph. Its complexity is linear in the number
// of nodes. It's built on a backwards depth first traversal. Our entry function just ensures we
// only visit each node once. Our exit function adds the node to the sorted list. Because the exit
// function is called on all of a node's inputs before it is called on the node itself, each node is
// added to the sorted list after all of its inputs.
function topological_sort<NodeData, EdgeData>(graph: GLangGraph<NodeData, EdgeData>): string[] {
    const sorted_node_ids: string[] = [];
    const sorted_node_ids_set = new Set<string>();
    for (const node_id in graph.nodes) {
        if (sorted_node_ids_set.has(node_id)) {
            continue;
        }
        traverse_depth_first_backward(
            graph,
            node_id,
            (graph, node_id, node) => {
                // Ignore this node's inputs if it's already been sorted.
                return sorted_node_ids_set.has(node_id);
            },
            (graph, node_id, node) => {
                if (!sorted_node_ids_set.has(node_id)) {
                    sorted_node_ids.push(node_id);
                    sorted_node_ids_set.add(node_id);
                }
            }
        );
    }
    return sorted_node_ids;
}

export { topological_sort };
