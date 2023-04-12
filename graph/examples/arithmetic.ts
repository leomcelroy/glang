import { createGraph } from "../graph_object";
import { GLangNode } from "../types";

enum ArithmeticOperation {
    Input,
    Add,
    Subtract,
    Multiply,
    Divide,
}

function makeArithmeticGraph() {
    type NodeData = {
        op: ArithmeticOperation;
        value: number | null;
    };

    type EdgeData = {};

    const graph = createGraph<NodeData, EdgeData>();
    const default_input_value: number = 0;
    const eval_listeners: Array<(node_id: string) => void> = [recompute_value];

    function addEvalListener(listener: (node_id: string) => void) {
        eval_listeners.push(listener);
    }

    // Recomputes the value of a single node.
    function recompute_value(node_id: string): number | null {
        const node = graph.getNode(node_id);

        // There's nothing to compute for input nodes.
        if (node.data.op === ArithmeticOperation.Input) {
            return node.data.value;
        }

        // Collect the values of the input nodes (unconnected inputs will be null).
        const [ lhs_value, rhs_value ] = graph.getInputValues(
            node_id,
            (node_data) => node_data.value,
        );

        // If either input is null, our output is null.
        if (lhs_value === null || rhs_value === null) {
            node.data.value = null;
            return null;
        }

        // If both inputs are connected and defined, we can actually do some math.
        switch (node.data.op) {
            case ArithmeticOperation.Add:
                node.data.value = lhs_value + rhs_value;
                break;
            case ArithmeticOperation.Subtract:
                node.data.value = lhs_value - rhs_value;
                break;
            case ArithmeticOperation.Multiply:
                node.data.value = lhs_value * rhs_value;
                break;
            case ArithmeticOperation.Divide:
                node.data.value = lhs_value / rhs_value;
                break;
        }

        return node.data.value;
    }

    // Recomputes the value of the specified node and all of its descendants.
    function evaluate(node_id: string): void {
        // Collect all the descendants of this node.
        const descendants = graph.descendants(node_id);
        descendants.add(node_id);

        // Run all evaluation listeners on all descendants in topological order.
        graph.evaluateInTopologicalOrder((node_id: string, node: GLangNode<NodeData>) => {
            if (descendants.has(node_id)) {
                for (const eval_listener of eval_listeners) {
                    eval_listener(node_id);
                }
            }
        });
    }

    function addNode(op: ArithmeticOperation): string {
        let node_id: string;
        if (op === ArithmeticOperation.Input) {
            // Input nodes have no inputs and one output.
            node_id = graph.addNode({op: op, value: default_input_value}, 0, 1);
        } else {
            // All other nodes have two inputs and one output.
            node_id = graph.addNode({op: op, value: null}, 2, 1);
        }

        return node_id;
    }

    function removeNode(node_id: string): void {
        graph.removeNode(node_id);
    }

    function addEdge(src_node_id: string, src_idx: number, dst_node_id: string, dst_idx: number): string {
        if (src_idx !== 0) {
            throw new Error("Arithmetic nodes only have a single output.");
        }
        const edge_id = graph.addEdge({}, src_node_id, src_idx, dst_node_id, dst_idx);
        evaluate(dst_node_id);
        return edge_id;
    }

    function removeEdge(edge_id: string): void {
        const edge = graph.getEdge(edge_id);
        const dst_node_id = edge.dst.node_id;
        graph.removeEdge(edge_id);
        evaluate(dst_node_id);
    }

    function setInputValue(node_id: string, new_value: number): void {
        const node = graph.getNode(node_id);
        if (node.data.op !== ArithmeticOperation.Input) {
            throw new Error("Can't set the value of a non-input node.");
        }
        node.data.value = new_value;
        evaluate(node_id);
    }

    return {
        getGraph: graph.getGraph,
        getNode: graph.getNode,
        getEdge: graph.getEdge,
        addNode,
        removeNode,
        addEdge,
        removeEdge,
        setInputValue,
        addEvalListener,
        evaluate
    };
}

export { makeArithmeticGraph, ArithmeticOperation };
