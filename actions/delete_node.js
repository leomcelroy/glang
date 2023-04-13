import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function delete_node(id) {
  STATE.graph.removeNode(id);
  delete STATE.graphUIData[id];
  STATE.selectedNodes.delete(id);
  render();
}
