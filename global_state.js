import { ArithmeticOperation, makeArithmeticGraph } from "./graph/examples/arithmetic.ts";
import { html, render as urender } from "./uhtml";
import { render } from "./actions/render.js";

const graph = makeArithmeticGraph();

graph.addEvalListener(id => {
  const nodeDOM = document.querySelector(`#ID${id}`);
  if (!nodeDOM) return;
  const node = graph.getNode(id);
  
  if (node.data.op === ArithmeticOperation.Input) {
    const frag = html`
      The value is: <input type="number" @input=${e => {
        const newVal = Number(e.target.value);
        graph.setInputValue(id, newVal);
      }}/>
    `;

    urender(nodeDOM, frag)
  } else {
    nodeDOM.innerHTML = `My value is: ${node.data.value}`;
  }
})

/*
const NODE_CONFIG = {
  "ADD": {
    name: "hello",
    inputNames: ["x", "y"],
    outputNames: ["z"]
  }
}

// every other function takes "id"
const getNodeName = (node) => NODE_CONFIG[node.data.type].name;
const getInputNames = (node) => NODE_CONFIG[node.data.type].inputNames;
const getOutputNames = (node) => NODE_CONFIG[node.data.type].outputNames;
*/

export const global_state = {
  graph: graph,

  nodeConstructors: { // map new menu option to add node args, know what addNode signature is
    "Input": ArithmeticOperation.Input,
    "Add": ArithmeticOperation.Add,
    "Subtract": ArithmeticOperation.Subtract,
    "Multiply": ArithmeticOperation.Multiply,
    "Divide": ArithmeticOperation.Divide,
  },
  /*
  nodeConstructors: { // map new menu option to add node args, know what addNode signature is
    "Input": {
      data: { 
        // name
        // inputNames
        // outNames
        op: "Input", 
        value: 0
      }, 
      numOfInputs: 0, 
      numOfInputs: 1
    },
    "Add": ArithmeticOperation.Add,
    "Subtract": ArithmeticOperation.Subtract,
    "Multiply": ArithmeticOperation.Multiply,
    "Divide": ArithmeticOperation.Divide,
  },

  what of

  edgeConstructors
  */
  getNodeName: (node) => {
    switch (node.data.op) {
      case ArithmeticOperation.Input:
        return "Input";
      case ArithmeticOperation.Add:
        return "Add";
      case ArithmeticOperation.Subtract:
        return "Subtract";
      case ArithmeticOperation.Multiply:
        return "Multiply";
      case ArithmeticOperation.Divide:
        return "Divide";
    }
  },

  getInputNames: (node) => {
    if (node.data.op === ArithmeticOperation.Input) {
      return [];
    } else {
      return ["x", "y"];
    }
  },

  getOutputNames: (node) => {
    return ["value"];
  },
  graphUIData: {},
  selectedNodes: [],
  tempEdge: ["", [0 ,0]],
  dataflow: null,
  searchTerm: ""
}
