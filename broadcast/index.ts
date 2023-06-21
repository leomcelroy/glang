import { html, render } from "lit-html";

import { createGraphUI } from "../coilcam-js/createGraphUI/createGraphUI";
import { createGraph } from "../coilcam-js/createGraph";
import { topologicalSort } from "../coilcam-js/topologicalSort";

type BroadcastingOperation = "Input"
  | "Reshape"
  | "Add"
  | "Multiply"
  | "Reciprocal";


type NDArray = {
    data: Array<number>;
    shape: Array<number>;
};

type NodeData = {
    op: BroadcastingOperation;
    value: NDArray;
};

function nullMatrix() {
  return {
    data: [],
    shape: [0]
  }
}

const nodes = {
  "Input": {
    name: "input",
    inputs: [ ],
    outputs: [ "matrix" ],
    post(nodeDOM, data) {
      const view = html`
        <textarea
          @blur=${setValue}
          @click=${e => { e.preventDefault(); }}>[0, 0, 0]</textarea>

      `

      function setValue(e) {
        const text = e.target.value;
        const newValue = parse_input_value(text);
        data.value = newValue;
      }

      render(view, nodeDOM);
    }
  },
  "Reshape": {
    name: "reshape",
    inputs: [ "matrix", "shape" ],
    outputs: [ "matrix" ],
    func(a, b) {
      if (b.shape.length !== 1 || b.shape[0] == 0) {
        console.log("Shapes must have exactly one axis.");
        return nullMatrix();
      }

      const n_elements_matrix = a.shape.reduce((a, b) => a * b, 1);
      const n_elements_shape = b.data.reduce((a, b) => a * b, 1);
      if (n_elements_matrix !== n_elements_shape) {
        console.log("Number of elements in matrix and shape must match.");
        return nullMatrix();
      }

      // TODO Do we want a deep copy?
      const data = a.data.slice();
      const shape = b.data.slice();
      return { data, shape };
    },
    post(nodeDOM, data) {
      nodeDOM.innerHTML = JSON.stringify(data.value);
    }
  },
  "Add": {
    name: "add",
    inputs: [ "matrix0", "matrix1" ],
    outputs: [ "matrix" ],
    func(a, b) {
      return broadcast(a, b, (x, y) => x + y);
    },
    post(nodeDOM, data) {
      nodeDOM.innerHTML = JSON.stringify(data.value);
    }
  },
  "Multiply": {
    name: "multiply",
    inputs: [ "matrix0", "matrix1" ],
    outputs: [ "matrix" ],
    func(a, b) {
      return broadcast(a, b, (x, y) => x * y);
    },
    post(nodeDOM, data) {
      nodeDOM.innerHTML = JSON.stringify(data.value);
    }
  },
  "Reciprocal": {
    name: "reciprocal",
    inputs: [ "matrix" ],
    outputs: [ "matrix" ],
    func(a) {
      return map_over_array(a, (x) => 1 / x);
    },
    post(nodeDOM, data) {
      nodeDOM.innerHTML = JSON.stringify(data.value);
    }
  }
};

const drawNodeInput = (k, index, name) => html`
  <div class="node-input">
    <div
      class=${[
        "node-input-circle",
        "socket"
      ].join(" ")}
      data-id=${`${k}:in:${index}`}></div>
    <div class="node-input-name">${name}</div>
  </div>
`

const drawNodeOutput = (k, index, name) => html`
  <div class="node-output">
    <div class="node-output-name">${name}</div>
    <div
      class="node-output-circle socket"
      data-id=${`${k}:out:${index}`}></div>
  </div>
`

const drawNode = (item, state) => {
  const [ k, node ] = item;
  const master = node.data.master;
  const nodeName = master.name;
  const inputNames = master.inputs;
  const outputNames = master.outputs;

  const selected = state.selectedNodes.has(k);

  if (!state.graphUIData[k]) return "";

  return html`
    <div
      class=${["node", selected ? "selected-node" : ""].join(" ")}
      data-id=${k}
      style=${`left: ${state.graphUIData[k].x}px; top: ${state.graphUIData[k].y}px;`}>
      <div class="node-title">
        <div class="node-name">${nodeName}</div>
      </div>
      ${inputNames.map((x, i) => drawNodeInput(k, i, x))}
      ${outputNames.map((x, i) => drawNodeOutput(k, i, x))}
      <div class="node-view" id=${"ID"+k}></div>
    </div>
  `
}

const config = {
  graph: createGraph(),
  addNode,
  evaluate,
  nodes,
  drawNode,
}

function evaluate(...nodeIds) {

  const graph = config.graph.getGraph();
  const groups = topologicalSort(graph, nodeIds).flat();

  groups.forEach(nodeId => {
    const node = config.graph.getNode(nodeId);
    // console.log(node);
    let inputs = config.graph.iterateInputs(nodeId, (data, outIndex) => {
      return data.value;
    });

    inputs = inputs.map(x => x === null ? nullMatrix() : x);

    const func = node.data.master.func;
    if (func) node.data.value = func(...inputs);

    const nodeDOM = document.querySelector(`#ID${nodeId}`);

    if (!nodeDOM) return;
    node.data.master.post(nodeDOM, node.data);
  })

}

function addNode(menuString) {
  const master = config.nodes[menuString];

  const data = {
    master,
    value: nullMatrix()
  };

  const id = config.graph.addNode(data, master.inputs.length, master.outputs.length);
  return id;
}


const state = createGraphUI(document.body, config);


function parse_input_value(value: string): NDArray {
    const data: NDArray = {
        data: [],
        shape: [],
    }

    try {
        // Parse the array.
        const array = JSON.parse(value);
        const newData = arrayToData(array);

        // TODO Ensure that other dims agree.

        return newData;
    } catch (e) {
        console.log(e);
        data.data = [];
        data.shape = [];
        return data;
    }
}

function map_over_array(
  { data: arr, shape: shape },
  func
) {
  // Create the output array
  const outArr = new Array(arr.length);
  const outShape = shape.slice();

  // Loop over the output array, applying the function to each element
  for (let i = 0; i < arr.length; i++) {
    outArr[i] = func(arr[i]);
  }

  return { data: outArr, outShape };
}

function broadcast(
    { data: arr1, shape: shape1 },
    { data: arr2, shape: shape2 },
    func
  ) {
  // Determine the shape of the output array
  const outShape = resultingShape(shape1, shape2);
  if (outShape === null) return nullMatrix();

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

function arrayToData(array) {
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

  return {
    data: array.flat(Infinity),
    shape
  }
}

const s0 = arrayToData([
  [ 0, 0 ],
  [ 1, 1 ]
]);

const s1 = arrayToData([ 2, 1 ]);

const result = broadcast(s0, s1, (x, y) => x + y);

console.log({ s0, s1, result });
