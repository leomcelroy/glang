# glang 
### thoughts on writing graph "languages"

statefulness or not

custom ui

include computations within this

break up front end part and evaluation

evaluate dag data-structure
multiple execution programs for different paradigms

### use cases
mods
pure data/maxmsp (real time)
using for making combos of generative ai models
	- take a long time
	- progress bars in nodes
	- types to let you know if the program makes sense

broadcasting
types

### projects
mods pcb milling 
	- drive machine

real-time?
polling vs events

staleness?

serialization of types

## Possible API

```
const example = {
  name: "adder",
  inputs: [
    { name: "x", type: "number" },
    { name: "y", type: "number" }
  ],
  outputs: [
    { name: "sum", type: "number" }
  ],
  onUpdate(node) {
    node.state = 31;
    return `
      ${box}
      <div>hello world</div>
      <div>the answer is ${node.outputs[0]}</div>
    `
  },
  func: (x, y) => {

    return [x + y];
  }
}


////////////////////////

const example2 = {
  name: "adder",
  inputs: [
    { name: "x", type: "number" },
    { name: "y", type: "number" }
  ],
  outputs: [
    { name: "sum", type: "number" }
  ],
  func(thisNode) {
    const inputs = thisNode.getInputs();
    const [ x, y ] = inputs;

    const sum = x+y;
    this.setOutputs("sum", sum);

    const el = document.createElement("div");
    el.innerHTML = `sum is: ${sum}`
    this.view = el
  }
}

//////////////////////////////

////////////////////////

const example3 = {
  name: "adder",
  inputs: [
    { name: "x", type: "number" },
    { name: "y", type: "number" }
  ],
  outputs: [
    { name: "sum", type: "number" }
  ],
}

//////////////////////////////

/*

nodes are inputs outputs
graph editor
  - created node
  - destroyed node
  - created edge
  - destroyed edge

*/

const graph = new Graph()
const node0 = graph.addNode("adder");
const node1 = graph.addNode("adder");

const edge0 = node0.connectIn(node1.getOutput("sum"), "x")

graph.removeEdge(edge0);

graph.onAddEdge(() => {

})

graph.removeAddEdge(() => {

})
```

graph schema

```
nodes = {
	id: { 
		...anything...
	}
}

edges = {
	"nodeId:port": "nodeId:port"
}

{ nodes, edges }
```

