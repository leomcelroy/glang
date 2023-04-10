import { GLangNode, GLangEdge, GLangGraph } from './types';
import * as CRUD from './crud';
import * as Traversal from './traversal';
import { topological_sort, evaluate_in_topological_order } from './topological_sort';

// This makes a graph object.
// It just binds the functional-style methods in ./crud.ts and ./traversal.ts to a particular graph.
export function createGraph<NodeData, EdgeData>() {
    const graph = CRUD.createGraph<NodeData, EdgeData>();

    function getGraph(): GLangGraph<NodeData, EdgeData> { return graph; }

    function getNode(node_id: string): GLangNode<NodeData> {
        return CRUD.getNode(graph, node_id);
    }

    function getEdge(edge_id: string): GLangEdge<EdgeData> {
        return CRUD.getEdge(graph, edge_id);
    }

    function getInputValues<InputType>(
        node_id: string,
        get_value: (node_data: NodeData) => InputType
    ): Array<InputType | null> {
        return CRUD.getInputValues(graph, node_id, get_value);
    }

    function addNode(node_data: NodeData, n_inputs: number, n_outputs: number): string {
        return CRUD.addNode(graph, node_data, n_inputs, n_outputs);
    }

    function removeNode(node_id: string): void {
        CRUD.removeNode(graph, node_id);
    }

    function addEdge(
        edge_data: EdgeData,
        src_node_id: string,
        src_idx: number,
        dst_node_id: string,
        dst_idx: number
    ): string {
        return CRUD.addEdge(graph, edge_data, src_node_id, src_idx, dst_node_id, dst_idx);
    }

    function removeEdge(edge_id: string): void {
        CRUD.removeEdge(graph, edge_id);
    }

    function traverseDepthFirstForward(
        node_id: string,
        f: (node_id: string, node: GLangNode<NodeData>) => boolean,
        g: (node_id: string, node: GLangNode<NodeData>) => void,
    ): boolean {
        return Traversal.traverse_depth_first_forward(graph, node_id, f, g);
    }

    function traverseDepthFirstBackward(
        node_id: string,
        f: (node_id: string, node: GLangNode<NodeData>) => boolean,
        g: (node_id: string, node: GLangNode<NodeData>) => void,
    ): boolean {
        return Traversal.traverse_depth_first_backward(graph, node_id, f, g);
    }

    function descendants(node_id: string): Set<string> {
        return Traversal.descendants(graph, node_id);
    }

    function ancestors(node_id: string): Set<string> {
        return Traversal.ancestors(graph, node_id);
    }

    function topologicallySortNodes(): Array<string> {
        return topological_sort(graph);
    }

    function evaluateInTopologicalOrder(
        f: (node_id: string, node: GLangNode<NodeData>) => void
    ): void {
        evaluate_in_topological_order(graph, f);
    }

    return {
        getGraph,
        getNode,
        getEdge,
        getInputValues,
        addNode,
        addEdge,
        removeNode,
        removeEdge,
        traverseDepthFirstForward,
        traverseDepthFirstBackward,
        descendants,
        ancestors,
        topologicallySortNodes,
        evaluateInTopologicalOrder,
    }
}
