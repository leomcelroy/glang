
export const global_state = {
  graph: {
    nodes: {
      "fds": { 
        name:"number", 
        inputs: ["x"],
        outputs: ["x"],
        data: {
          x: 200, 
          y: 94, 
        },
      },
      "fsa": { 
        name:"number", 
        inputs: ["x"],
        outputs: ["x"],
        data: {
          x: 10, 
          y: 94, 
        },
      },
      "dsf": { 
        name:"add", 
        inputs: ["x", "y"],
        outputs: ["sum"],
        data: {
          x: 507, 
          y: 105, 
        },
      },
    },
    edges: {
      "dagesdf": {
        src: { node: "fds", port: 0 }, 
        dst: { node: "dsf", port: 0 },
        data: {},
       },
      "dagesfd": {
        src: { node: "fsa", port: 0 }, 
        dst: { node: "fds", port: 0 },
        data: {},
       },
      "dagesad": {
        src: { node: "fds", port: 0 }, 
        dst: { node: "dsf", port: 1 },
        data: {},
       },
    }
  },
  nodeTypes: {
    "number": { name: "number", inputs: ["x"], outputs: ["x"] },
    "adder": { name: "add", inputs: ["x", "y"], outputs: ["sum"] },
  },
  selectedNodes: [],
  tempEdge: ["", [0 ,0]],
  dataflow: null,
  searchTerm: ""
}