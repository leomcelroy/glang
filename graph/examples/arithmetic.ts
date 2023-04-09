import { createGraph } from "../graph_object";
import { forward_depth_first_traversal } from "../traversal";

enum ArithmeticOperation {
    Input0,
    Add,
    Subtract,
    Multiply,
    Divide,
}

type NodeData = {
    op: ArithmeticOperation;
    value: number | null;
};

type EdgeData = {};

function makeArithmeticGraph() {
    const graph = GLANG.createGraph<NodeData, EdgeData>();
    const default_input_value = 0;

    function recompute_value(node_id: string, graph: GLangGraph<NodeData, EdgeData>) {
        const node = GLANG.getNode(graph, node_id);
        // There's nothing to compute for input nodes.
        if (node.data.op === ArithmeticOperation.Input) {
            return;
        }

        const [ lhs_value, rhs_value ] = GLANG.getInputValues(
            graph,
            node_id,
            "value"
        );

        if (lhs_value === null || rhs_value === null) {
            node.data.value = null;
            return;
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
    }

    function addNode(op: ArithmeticOperation): string {
        if (op === ArithmeticOperation.Input) {
            // Input nodes have no inputs and one output.
            return GLANG.addNode(graph, {op: op, value: default_input_value}, 0, 1);
        } else {
            // All other nodes have two inputs and one output.
            return GLANG.addNode(graph, {op: op, value: null}, 2, 1);
        }
    }

    function getInputNames(id) {
        return PARAMETER_NAMES[id].inputs;
    }

    function getOutputNames(id) {
        return PARAMETER_NAMES[id].outputs;
    }

    function removeNode(node_id: string) {
        GLANG.removeNode(graph, node_id);
    }

    function addEdge(
        src_node_id: string,
        src_idx: number,
        dst_node_id: string,
        dst_idx: number
    ): string {
        // All nodes have a single output so the output index is always 0.
        const edge_id = GLANG.addEdge(graph, {}, src_node_id, src_idx, dst_node_id, dst_idx);
        // Re-evaluate values of all downstream nodes.
        // Note: this is sloppy, we should do a topological sort and evaluate in that order.
        traverse_forward_breadth_first(graph, src_node_id, (graph, node_id, node) => {
            recompute_value(node_id, graph);
        });
        return edge_id;
    }

    function removeEdge(edge_id: string) {
        const edge = GLANG.getEdge(graph, edge_id);
        const dst_node_id = edge.dst.node_id;
        GLANG.removeEdge(graph, edge_id);
        traverse_forward_breadth_first(graph, dst_node_id, (graph, node_id, node) => {
            recompute_value(node_id, graph);
        });
    }

    function changeNodeOp(node_id: string, new_op: ArithmeticOperation) {
        const node = GLANG.getNode(graph, node_id);
        node.data.op = new_op;

        // Update the number of inputs.
        // (All nodes have one output so there's no need to update that.)
        if (new_op === ArithmeticOperation.Input) {
            if (node.inputs.length !== 0) {
                node.inputs = [];
            }
        } else {
            if (node.inputs.length !== 2) {
                node.inputs = [null, null];
            }
        }

        traverse_forward_breadth_first(graph, node_id, (graph, node_id, node) => {
            recompute_value(node_id, graph);
        });
    }

    function changeInputValue(node_id: string, new_value: number) {
        const node = GLANG.getNode(graph, node_id);
        if (node.data.op !== ArithmeticOperation.Input) {
            throw new Error("Can't change the value of a non-input node.");
        }
        node.data.value = new_value;

        // events["changeInputValue"](graph, trigger);

        traverse_forward_breadth_first(graph, node_id, (graph, node_id, node) => {
            recompute_value(node_id, graph);
        });
    }

    return {
        getNode: (node_id: string) => GLANG.getNode(graph, node_id),
        getNodeValue: (node_id: string) => GLANG.getNode(graph, node_id).data.value,
        getEdge: (edge_id: string) => GLANG.getEdge(graph, edge_id),
        addNode: addNode,
        removeNode: removeNode,
        addEdge: addEdge,
        removeEdge: removeEdge,
        changeNodeOp: changeNodeOp,
        changeInputValue: changeInputValue,
        getGraph: () => graph,
        getNodeTypes: () => ArithmeticOperation,
        getInputNames,
        getOutputNames,
        addListener(eventName, callback) {

        },
        // setGraph(newGraph) {
        //     graph.setGraph(newGraph);
        // }
        // evaluate(triggers) {
        //     myEvalFunc(graph, triggers);
        // }
        // getInputs(nodeId, dataKey) {}
        // setOutputs(nodeId, dataKey) {}

        // myGraph.evaluate(triggers) or myEvalFunc(graph, triggers)
    };
}

export { makeArithmeticGraph, ArithmeticOperation };
