import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function delete_node(id) {
  for (const key in STATE.graph.edges) {
    const edge = STATE.graph.edges[key];
    if (edge.src.node === id || edge.dst.node === id) delete STATE.graph.edges[key];
  }
  
  delete STATE.graph.nodes[id];
  STATE.selectedNodes = STATE.selectedNodes.filter(x => x !== id);
  
  render();
}
