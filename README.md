# glang

## thoughts on writing graph "languages"

statefulness or not

custom ui

include computations within this

break up front end part and evaluation

evaluate dag data-structure

multiple execution programs for different paradigms

broadcasting

types

serialization of types

render to HTML or canvas?

## execution models

- pull
  - when a node is evaluated, we evaluate all nodes in the transitive closure of its inputs in topological order (can be breadth first, depth first, or mixed)
- push
  - when a node's data changes, we evalaute all nodes in the transitive closure of its outputs
- pull with caching
  - when any node is evaluated, we cache the result
  - when a node's data changes, we propagate a signal that invalidates cached results in the transitive closure of its outputs
  - can used cached values when executing a node
- token passing
  - tokens have data and are present or absent
  - needs state on edges
- long running computations
  - show progress bars within nodes, updated with info from an execution engine on a remote server
  - so from the UI's perspective there isn't a coherent execution model -- internal nodes may be updated without push or pull events


## use cases

### mods

- pull-based execution
- types: numbers, raster images, vector geometries, etc.
- start with PCB milling
  - final "pull" comes from machine node

### pure data/maxmsp (real time)

- types: numbers, streams, bangs (?)
- execution model: pull for streams, push for bangs (?)

### combining generative ai models

- pull-based execution but managed by a remote server since execution can run for hours
- types
  - all arrays/tensors at some level
  - could distinguish images, audio, latent space vectors, etc.
  - definitely want to track array shapes at graph construction time to ensure we don't run for hours and then fail on an operation that doesn't make sense
- want progress bars in nodes
- overall this means I want to run some type checks before edges are added, but then there is no execution model as far as the UI is concerned because my nodes should just independently poll the server to update their progress bars

### lambda calculus

- types
  - no types for untyped lambda calculus
  - types are their own graphs for typed versions
- execution model
  - the graphs are the values...
    - could be cool to have a visual representation of beta reduction (moving the argument into the function body)
  - but can also define a function and then use pull semantics to run the reduction behind the scenes and then display the result (either as a graph or interpret the church numeral etc.)
  - getting ahead of myself here, but I'm imagining a functional programming version of [Turing Complete](https://store.steampowered.com/app/1444480/Turing_Complete/)
    - start with untyped lambda calculus, build some abstractions, add simple types, type operators, polymorphism, dependent types, etc.

### frep CSG

- basically a graphical interface for [libfive](https://libfive.com/)
- types: just numbers/vectors
- execution: either push, or pull with caching (triggered every frame in a 3D renderer)

### brep CSG

- types: probably just b-reps, maybe have 1D, 2D, 3D versions
- primitive leaf nodes are cubes, cylinders, etc.
- "compute" nodes are union, intersection, difference, offset, minkowski sum, etc.

### graph CAD

- sketches
  - points, lines, arcs, etc.
  - constraints
- extrusions
  - turns 2D stuff into 3D breps
- assemblies
- execution model: pull with caching

### scene graphs

- execution: pull with caching
- say I'm writing a three.js app, but I have a custom model with a lot of state that gets updated from some set of inputs
- would be nice to build my own model graph, so I know when I need to refresh my vertex buffers etc.
- each frame I'd check if the output is fresh, if not it gets re-evaluated and I update the state of my three.js stuff
- here I might not ever need to visualize the graph
  - but I totally would if it came for free

### ALA

- token passing based logic

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

## prior art

### baklava

- https://github.com/newcat/baklavajs
- the most separation between UI and engine of the projects I've looked at
- nodes consist of inputs, outupts, and options https://newcat.github.io/baklavajs/#/custom-nodes
- execution I think defaults to pull, but can be configured for push https://newcat.github.io/baklavajs/#/plugins/engine

### rete

- the engine can be used without the editor (see top of https://rete.js.org/#/docs/engine)
    - though I can't figure out the execution model from the website
    - the animated gif example is a combination of push/pull that starts from the middle of the graph
- but components are defined with the render and computational logic together (https://rete.js.org/#/docs/components)
- overall this might be workable for my needs

### nice-dag

- https://opensource.ebay.com/nice-dag/
- ebay open source project
- doesn't embed any execution model since its intended use case is defining CI pipelines that are run elsewhere

### nodl

- nodes have named inputs and outputs, and an execution function
- push-based execution model is baked in

    ```
    /**
    * The output of AdditionNode3 will fire with a new sum
    * everytime the inputs of AdditionNode1 and AdditionNode2 changes
    */
    additionNode3.outputs.output.subscribe(console.log);
    ```

    https://github.com/emilwidlund/nodl/tree/main/packages/core

### sigma

- appears that nodes have sets of edges rather than lists of inputs and outputs
