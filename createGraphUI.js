import { addEvents } from "./addEvents.js";

export function createGraphUI(domNode, config) {
  const componentState = initState(config);

  const r = (time) => {
    render();
    requestAnimationFrame(r);
  };
    

  render();
  addEvents(domNode, componentState);

  requestAnimationFrame(r);
}

function initState(config) {
  return {
    graph: config.graph,
    nodeConstructors: config.nodeConstructors,
    getNodeName: config.getNodeName,
    getInputNames: config.getInputNames,
    getOutputNames: config.getOutputNames,
    graphUIData: {},
    selectedNodes: [],
    tempEdge: ["", [0 ,0]],
    dataflow: null,
    searchTerm: ""
  }
}