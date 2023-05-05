import { parse } from "path";
import { createGraph } from "../graph_object";
import { GLangNode } from "../types";

enum BroadcastingOperation {
    Input,
    Reshape,
    Add,
    Multiply,
}

function makeBroadcastingGraph() {
    type NDArray = {
        data: Array<number>;
        shape: Array<number>;
    };

    // This functions grabs a single number from an array.
    // TODO Eventually we'll want to support slicing as well.
    function get_element(array: NDArray, indices: Array<number>): number {
        if (indices.length !== array.shape.length) {
            throw new Error("Indices must have the same length as the array's shape.");
        }

        // we want this for an array with 3 axes
        // index = indices[0] * (array.shape[1] * array.shape[2])
        //     + indices[1] * array.shape[2] + indices[2];


    }

    function shapes_are_compatible(lhs_shape: Array<number>, rhs_shape: Array<number>): boolean {
        // TODO
        // Maybe this actually returns a new shape?
        return true;
    }


    // TODO implement mutual iteration for arrays with compatible shapes

    type NodeData = {
        op: BroadcastingOperation;
        value: NDArray;
    };

    type EdgeData = {};

    const graph = createGraph<NodeData, EdgeData>();
    const zero_array: NDArray = {data: [0], shape: [1]};
    const eval_listeners: Array<(node_id: string) => void> = [recompute_value];

    function addEvalListener(listener: (node_id: string) => void) {
        eval_listeners.push(listener);
    }

    function parse_input_value(value: string): NDArray {
        const data: NDArray = {
            data: [],
            shape: [],
        }

        try {
            // Parse the array.
            const array = JSON.parse(value);
            if (!Array.isArray(array)) {
                throw new Error("Input value must be an array.");
            }

            // Check that all subarrays have the same length.
            const shape: Array<number> = [];
            let subarray = array;
            while (Array.isArray(subarray)) {
                shape.push(subarray.length);
                subarray = subarray[0];
            }
            if (!(typeof subarray === "number")) {
                throw new Error("Input value must be an array of numbers.");
            }

            // TODO Ensure that other dims agree.

            return data;
        } catch (e) {
            console.log(e);
            data.data = [];
            data.shape = [];
            return data;
        }
    }

    // Recomputes the value of a single node.
    function recompute_value(node_id: string): void {
        const node = graph.getNode(node_id);

        // There's nothing to compute for input nodes.
        if (node.data.op === BroadcastingOperation.Input) {
            return;
        }

        // Collect the values of the input nodes (unconnected inputs will be null).
        const [ lhs_value, rhs_value ] = graph.getInputValues(
            node_id,
            (node_data) => node_data.value,
        );

        // If either input is null, our output is null.
        if (lhs_value === null || rhs_value === null) {
            node.data.value = {
                data: [0],
                shape: [1],
            };
            return;
        }

        // If both inputs are connected and defined, we can actually do some math.
        node.data.value.data = [];
        switch (node.data.op) {
            case BroadcastingOperation.Add:
                node.data.value = mutually_iterate(lhs_value, rhs_value, (lhs, rhs) => lhs + rhs);
                break;
            case BroadcastingOperation.Multiply:
                node.data.value = mutually_iterate(lhs_value, rhs_value, (lhs, rhs) => lhs * rhs);
                break;
        }
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

    function addNode(op: BroadcastingOperation): string {
        let node_id: string;
        if (op === BroadcastingOperation.Input) {
            // Input nodes have no inputs and one output.
            node_id = graph.addNode({op: op, value: zero_array}, 0, 1);
        } else {
            // All other nodes have two inputs and one output.
            node_id = graph.addNode({op: op, value: zero_array}, 2, 1);
        }

        return node_id;
    }

    function removeNode(node_id: string): void {
        graph.removeNode(node_id);
    }

    function addEdge(src_node_id: string, src_idx: number, dst_node_id: string, dst_idx: number): string {
        if (src_idx !== 0) {
            throw new Error("Broadcasting nodes only have a single output.");
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

    function setInputValue(node_id: string, new_value: NDArray): void {
        const node = graph.getNode(node_id);
        if (node.data.op !== BroadcastingOperation.Input) {
            throw new Error("Can't set the value of a non-input node.");
        }
        node.data.value = new_value;
        evaluate(node_id);
    }

    function setInputValueFromString(node_id: string, new_value: string): void {
        const value = parse_input_value(new_value);
        setInputValue(node_id, value);
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

function mutually_iterate(matrix0, matrix1, fn) {
    const finalShape = resultingShape(matrix0.shape, matrix1.shape);

    
}

function resultingShape(shape0, shape1) {
  let match = true;

  const lengths = [ shape0.length, shape1.length ];

  const upper = Math.max(...lengths);
  const lower = Math.min(...lengths);
  const dimensions = [];

  for (let i = 0; i < upper; i++) {
    const dimension0 = shape0.at(-(i+1));
    const dimension1 = shape1.at(-(i+1));

    if (i >= lower) {
      dimensions.push(dimension0 || dimension1);
      continue;
    }

    dimensions.push(dimension0 === dimension1 ? dimension0 : dimension0 * dimension1);

    if (dimension0 === 1 || dimension1 === 1) continue;
    if (dimension0 !== dimension1) match = false;

  }
  
  return match
    ? dimensions.reverse()
    : null;
}

export { makeBroadcastingGraph, BroadcastingOperation };
