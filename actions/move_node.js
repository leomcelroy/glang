import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function move_node(id, dx, dy) {
  const node = STATE.nodes[id];
  if (!node) return;
  node.data.x += dx;
  node.data.y += dy;

  render();
}
