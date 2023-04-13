import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function add_node(typeToAdd) {
  const constructorArg = STATE.nodeConstructors[typeToAdd];

  const id = STATE.graph.addNode(constructorArg);

  STATE.graphUIData[id] = {
    x: -1000000,
    y: -1000000
  };

  render();

  STATE.graph.evaluate(id);

  return id;
}