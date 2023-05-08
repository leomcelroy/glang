import { html } from "lit-html";
import { createGraphUI } from "./createGraphUI/createGraphUI";
import { createGraph } from "./createGraph";
import { topologicalSort } from "./topologicalSort";

const toolpath = {
  name: "toolpath",
  inputs: [
    [ "radius", "number" ],
    [ "scale", "number" ],
    [ "translate", "number" ],
    [ "rotate", "number" ],
  ],
  outputs: [
    [ "toolpath", "number[]" ]
  ],
  func: (radius, scale, translate, rotate) => {

    return [ toolpath ]
  },
  post: (id, graph) => {

  }
}

const sine = {
  name: "sine",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const linear = {
  name: "linear",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const square = {
  name: "square",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const staircase = {
  name: "staircase",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const exponential = {
  name: "exponential",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const union = {
  name: "union",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const difference = {
  name: "difference",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const nodes = {
  // repeating toolpath
  toolpath,
  // function operators
  linear,
  sine,
  square,
  staircase,
  exponential,
  // booleans
  union,
  difference,
  // intersect,
}

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
  const inputNames = master.inputs.map(x => x[0]);
  const outputNames = master.outputs.map(x => x[0]);

  // console.log(state.selectedNodes);
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
  // topo sort and run
  console.log(nodeIds);

  const graph = config.graph.getGraph();

  topologicalSort(graph, nodeIds);
}

function addNode(menuString) {
  const master = config.nodes[menuString];
  const data = {
    master,
    outputValues: master.outputs.map(x => 0)
  };

  const id = config.graph.addNode(data, master.inputs.length, master.outputs.length);
  return id;

}


const state = createGraphUI(document.body, config);
const id = state.mutationActions.add_node("toolpath");
const nodeXY = state.graphUIData[id];
nodeXY.x = 100;
nodeXY.y = 100;

