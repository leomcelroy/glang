import { ArithmeticOperation, makeArithmeticGraph } from "./graph/examples/arithmetic.ts";

export const global_state = {
  graph: makeArithmeticGraph(),

  nodeConstructors: {
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
  },

  drawNodeContent: (node) => {
    return node.data.value ?? "null";
  },

  graphUIData: {},
  selectedNodes: [],
  tempEdge: ["", [0 ,0]],
  dataflow: null,
  searchTerm: ""
}
