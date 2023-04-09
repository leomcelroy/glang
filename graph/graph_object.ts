import { GLangNode, GLangEdge, GLangGraph } from './types';
import * as CRUD from './crud';

// This just wraps the functional-style methods in ./crud.ts into an object.
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

    return {
        getGraph,
        getNode,
        getEdge,
        getInputValues,
        addNode,
        addEdge,
        removeNode,
        removeEdge,
    }
}
