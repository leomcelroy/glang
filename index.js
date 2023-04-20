import { html, render } from "lit-html";
import { ArithmeticOperation, makeArithmeticGraph } from "./graph/examples/arithmetic.ts";
import { createGraphUI } from "./createGraphUI.js";

const config = {
  graph: makeArithmeticGraph(),
  nodeConstructors: { // map new menu option to add node args, know what addNode signature is
    "Input": ArithmeticOperation.Input,
    "Add": ArithmeticOperation.Add,
    "Subtract": ArithmeticOperation.Subtract,
    "Multiply": ArithmeticOperation.Multiply,
    "Divide": ArithmeticOperation.Divide,
  },
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
  }
}



const state1 = createGraphUI(document.querySelector(".graph-1"), config);
const state2 = createGraphUI(document.querySelector(".graph-2"), config);

function addNodeRender(state) {
  state.graph.addEvalListener(id => {
    const graph = state.graph;
    const nodeDOM = state.domNode.querySelector(`#ID${id}`);
    if (!nodeDOM) return;
    const node = graph.getNode(id);
    
    if (node.data.op === ArithmeticOperation.Input) {
      const frag = html`
        The value is: <input type="number" @input=${e => {
          const newVal = Number(e.target.value);
          graph.setInputValue(id, newVal);
        }}/>
      `;

      render(frag, nodeDOM)
    } else {
      nodeDOM.innerHTML = `My value is: ${node.data.value}`;
    }
  })
}

addNodeRender(state1);
addNodeRender(state2);


