import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function remove_connection(index) {
  STATE.graph.removeEdge(index);
  
  render();
}
