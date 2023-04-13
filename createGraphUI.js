import { addEvents } from "./addEvents.js";

export function createGraphUI(domNode, config) {
  const componentState = initState(config);

  const mutatationActions = createMutationActions(domNode, componentState);

  componentState.mutationActions = mutationActions;

  mutatationActions.render();
  addEvents(domNode, componentState);

  const r = (time) => {
    mutatationActions.render();
    requestAnimationFrame(r);
  };

  requestAnimationFrame(r);
}

function createMutationActions(domNode, state) {
  return {
    render() {
      r(domNode, view(state));
    },
    add_node(menuString) {
      const constructorArg = state.nodeConstructors[menuString];
      const id = state.graph.addNode(constructorArg);

      state.graphUIData[id] = {
        x: -1000000,
        y: -1000000
      };

      this.render();

      state.graph.evaluate(id);

      return id;
    },
    delete_node(id) {
      state.graph.removeNode(id);
      delete state.graphUIData[id];
      state.selectedNodes.delete(id);
      this.render();
    },
    move_node(id, dx, dy) {
      const node = state.graphUIData[id];
      if (!node) return;
      node.x += dx;
      node.y += dy;

      this.render();
    },
    add_connection(from, to) {
      const [srcNode, _inOut0, srcPort ] = from.split(":");
      const [dstNode, _inOut1, dstPort ] = to.split(":");

      state.graph.addEdge(srcNode, Number(srcPort), dstNode, Number(dstPort))

      this.render();
    },
    remove_connection(index) {
      state.graph.removeEdge(index);
      
      this.render();
    }
  }
}

function initState(config) {
  return {
    graph: config.graph,
    nodeConstructors: config.nodeConstructors,
    getNodeName: config.getNodeName,
    getInputNames: config.getInputNames,
    getOutputNames: config.getOutputNames,
    graphUIData: {},
    selectedNodes: new Set(),
    tempEdge: ["", [0 ,0]],
    dataflow: null,
    searchTerm: "",
    mutationActions: null
  }
}