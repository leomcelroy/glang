import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function add_connection(from, to) {
  const [srcNode, _inOut0, srcPort ] = from.split(":");
  const [dstNode, _inOut1, dstPort ] = to.split(":");

  STATE.graph.addEdge(srcNode, Number(srcPort), dstNode, Number(dstPort))

  render();
}
