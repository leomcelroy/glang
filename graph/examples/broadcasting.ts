import { parse } from "path";
import { createGraph } from "../graph_object";
import { GLangNode } from "../types";

enum BroadcastingOperation {
    Input,
    Reshape,
    Add,
    Multiply,
}

type NDArray = {
    data: Array<number>;
    shape: Array<number>;
};

type NodeData = {
    op: BroadcastingOperation;
    value: NDArray;
};

type EdgeData = {};


function makeBroadcastingGraph() {


    // TODO implement mutual iteration for arrays with compatible shapes


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

function mutually_iterate(matrix0: NDArray, matrix1: NDArray, fn) {
    // Compute the shape of the result, and allocate an array of the correct size.
    const shape = resultingShape(matrix0.shape, matrix1.shape);
    const value = new Array(shape.reduce((acc, cur) => acc*cur, 1));


    // Pad the shape of array with less axes with 1s (on the left).
    const shape0 = matrix0.shape.slice();
    const shape1 = matrix1.shape.slice();
    while (shape0.length < shape1.length) {
        shape0.unshift(1);
    }
    while (shape1.length < shape0.length) {
        shape1.unshift(1);
    }

    // Iterate over the arrays.
    const idx0 = new Array(shape0.length).fill(0);
    const idx1 = new Array(shape1.length).fill(0);
    let idx = 0;
    while (idx0[0] < shape0[0] && idx1[0] < shape1[0]) {
        // Chop off leading ones from the indices.
        let first_nonzero = shape0.findIndex((x) => x !== 1);
        const val0 = get_element(matrix0, idx0.slice(first_nonzero));
        first_nonzero = shape1.findIndex((x) => x !== 1);
        const val1 = get_element(matrix1, idx1.slice(first_nonzero));
        value[idx] = fn(val0, val1);
        ++idx;

        // Increment the indices.
        let axis = shape0.length;
        while (axis > 0) {
            --axis;

            // If both shapes are the same, increment both indices.
            if (shape0[axis] === shape1[axis]) {
                ++idx0[axis];
                ++idx1[axis];
                if (idx0[axis] === shape0[axis]) {
                    idx0[axis] = 0;
                    idx1[axis] = 0;
                    continue;
                }
                break;
            }

            // One of the shapes is 1.
            if (shape0[axis] === 1) {
                idx0[axis] = 0;
                ++idx1[axis];
            } else {
                ++idx0[axis];
                idx1[axis] = 0;
            }
        }
    }

    return {
        value,
        shape
    }
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

function get_strides(shape: Array<number>): Array<number> {
    const strides = [];
    let stride = 1;
    for (let i = shape.length - 1; i >= 0; i--) {
        strides.push(stride);
        stride *= shape[i];
    }
    return strides.reverse();
}

// This functions grabs a single number from an array.
// TODO Eventually we'll want to support slicing as well.
function get_element(array: NDArray, indices: Array<number>): number {
    if (indices.length !== array.shape.length) {
        throw new Error("Indices must have the same length as the array's shape.");
    }

    const strides = get_strides(array.shape);

    let index = 0;
    for (let i = 0; i < indices.length; i++) {
        index += indices[i] * strides[i];
    }

    return array.data[index];
}

function broadcastIndex(index, shape) {

    let inIndex = [];
    for (let i = 0; i < shape.length; i++) {
        inIndex.push(
            index[i] >= shape[i] ? shape[i]-1 : index[i]
        )
    }

    let flatIndex = 0;
    for (let i = 0; i < shape.length; i++) {
        flatIndex += inIndex[i] * shape.slice(i + 1).reduce((a, b) => a * b, 1);
    }

    return flatIndex;
}

function broadcast(
    { data: arr1, shape: shape1 }, 
    { data: arr2, shape: shape2 }, 
    func
  ) {
  // Determine the shape of the output array
  const outShape = resultingShape(shape1, shape2);
  if (outShape === null) return {
      data: [0],
      shape: [1]
  };
  // let shape1Idx = shape1.length - 1;
  // let shape2Idx = shape2.length - 1;
  // while (shape1Idx >= 0 || shape2Idx >= 0) {
  //   const dim1 = shape1Idx >= 0 ? shape1[shape1Idx] : 1;
  //   const dim2 = shape2Idx >= 0 ? shape2[shape2Idx] : 1;
  //   const maxDim = Math.max(dim1, dim2);
  //   outShape.unshift(maxDim);
  //   shape1Idx--;
  //   shape2Idx--;
  // }


  
  // Create the output array
  const outArr = new Array(outShape.reduce((acc, val) => acc * val, 1));
  
  // Loop over the output array, applying the function to the appropriate elements
  for (let i = 0; i < outArr.length; i++) {
    const coords = [];
    let index = i;
    for (let k = outShape.length - 1; k >= 0; k--) {
      coords[k] = index % outShape[k];
      index = Math.floor(index / outShape[k]);
    }

    const inShape1 = shape1.slice();
    while (inShape1.length < outShape.length) inShape1.unshift(1);

    const inShape2 = shape2.slice();
    while (inShape2.length < outShape.length) inShape2.unshift(1);


    const idxArr = shapedIndex(i, outShape);

    const idx1 = broadcastIndex(idxArr, inShape1);
    const idx2 = broadcastIndex(idxArr, inShape2);

    const val1 = arr1[idx1];
    const val2 = arr2[idx2];

    outArr[i] = func(val1, val2);
  }
  
 
  
  return { data: outArr, shape: outShape };
}

function shapedIndex(i, shape) {
    let index = [];
    let x = i;
    for (let d = 0; d < shape.length; d++) {
      const divisor = shape.slice(d+1).reduce((acc, cur) => acc * cur, 1);
      index.push(Math.floor(x/divisor));
      x = x%divisor;
    }

    return index;
}

const test0 = {
    data: [
        0, 0, 
        10, 10, 
        20, 20,
        30, 30
    ],
    shape: [4, 2]
};


const test1 = {
    data: [
        0, 1, 2
    ],
    shape: [3]
};


console.log(test0);
console.log(test1);

const resultBroadcast = broadcast(test0, test1, (x, y) => x + y);
console.log(resultBroadcast.data, resultBroadcast.shape);


const resultIterate = mutually_iterate(test0, test1, (x, y) => x + y);
console.log(resultBroadcast);

export { makeBroadcastingGraph, BroadcastingOperation };
