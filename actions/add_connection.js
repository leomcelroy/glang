import { global_state as STATE } from "../global_state.js";
import { render } from "./render.js";

export function add_connection(from, to) {
  const [srcNode, _inOut0, srcPort ] = from.split(":");
  const [dstNode, _inOut1, dstPort ] = to.split(":");

  STATE.graph.edges[crypto.randomUUID()] = {
    src: { node: srcNode, port: Number(srcPort) }, 
    dst: { node: dstNode, port: Number(dstPort) },
    data: {},
  };
  
  render();
}
