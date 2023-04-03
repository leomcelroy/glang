export const nodeTypes = {
  "add": {
    inputs: ["x", "y"],
    outputs: ["sum"]
  },
  "number": {
    inputs: [],
    outputs: ["value"]
  }
}

const fns = {
  "add": (graph, nodeId) => {
    const add = (x, y) => [ x + y ];
    const typeCheck = (x, y) => [ x === "number" && y === "number" ];

    const node = graph.nodes[nodeId];

    // where is this stored
    // when output is retrieved where is it coming from
    const inputTypes = node.data.inputTypes;
    node.data.outputsTypes = typeCheck(inputTypes);

    const inputValues = node.data.inputValues;
    node.data.outputValues = broadcast(...inputValues)(add);

    const viewer = document.querySelector(`${nodeId}`);
    viewer.innerHTML = `<div>The sum is: ${node.data.outputValue}</div>`
   },
  "number": (graph, nodeId) => {

  }
}

/*

every evaluator gets input and output values stored in data

function forms
  - function takes inputs and returns array of outputs
  - function receives generic node/graph object
    - values set manually
    - could be harder to compose things like broadcast this way


add(inputs, graph, id) {
  const [x, y] = inputs;
  return [ x+y ]
}

add(inputs, outputs, id) {
  const [x, y] = inputs;
  outputs[0] = x+y;
}

view = {
  add(inputs, outputs, id) {
    // how to get specific outputs
    // type outputs or value outputs?
    const nodeView = document.querySelector(id);
    node.view.innerHTML = `the value is ${outputs[0]}`;
  }
}

eval(graph, triggers, fns) {
  const topoSortedGroups = topoSortGraph();
  
  topoSortedGroups.forEach(group => {
    group.forEach(nodeId => {
      fns.forEach((fn, i) => {
        const node = graph.nodes[nodeId];
        const inputs = {};
        const outputs = node.data[`outputs_${i}`];

        fn[node.type](inputs, outputs, nodeId);
      })
    })
  })
} 

eval(graph, triggers, [ nodeTypes, nodeFns, nodeViews ]);


typecheck
{
  add(inputs, graph, id) {
    
  },
  number(inputs, graph, id) {
    return [ "number" ]
  }
}

evals
{
  add(inputs, graph, id) {
    return [ x+y ]
  },
  number(inputs, graph, id) {
    return [ x ]
  }
}

views
{
  add(inputs, graph, id) {
    
  },
  number() {
  
  }
}

*/

export function evaluator(graph, triggers, fns) {
  const { nodes, edges } = graph;

  // topologically sort nodes


}


export async function evaluateNode(node, nodes, connections, nodeTypes) {
  // topologically sort the nodes
  // evaluate asynchronously
  // resolve on return or when output is called in node

  function getDepths() {
    const keys = Object.keys(nodes);
    const depths = {};
    keys.forEach(k => depths[k] = -1);
    traverse(depths)(node, 0);

    return depths;
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  const traverse = depths => (n, count) => {
    depths[n] = count++;

    const inputs = connections.filter(([ o, i ]) => {
      return i.includes(n);
    })
      .map( x => x[0].split(":")[0])
      .filter(onlyUnique);

    inputs.forEach(k => traverse(depths)(k, count));
  }

  const getGroups = depths => {
    let depthGroups = [];
    for (const k in depths) {
      const depth = depths[k];
      if (depth < 0) continue;
      while (depthGroups.length <= depth) depthGroups.push([]);
      
      depthGroups[depth].push(k);
    }
    depthGroups = depthGroups.reverse();

    return depthGroups;
  }

  const evalNode = async (n) => {

    const node = nodes[n];
    const type = node.type;
    const nodeType = nodeTypes[type];
    const func = nodeType.func;

    const inputKeys = node.inputs.map((x, i) => {
      return `${n}:in:${i}`;
    })

    const edgeDict = {};
    connections.forEach(c => {
      edgeDict[c[1]] = c[0];
    })

    inputKeys.forEach(k => {
      if (k in edgeDict) {
        const inputIndex = k.split(":")[2];
        const o = edgeDict[k];
        const [outNode, _, index] = o.split(":");
        const val = nodes[outNode].outputs[index];
        node.inputs[inputIndex] = val;
      }
    })

    // const outputs = func.constructor.name === "AsyncFunction" 
    //   ? await func(...node.inputs)
    //   : func(...node.inputs);

    const inputTypes = nodeType.inputs.map(x => x.type);
    node.inputs.forEach((x, i) => {
      if (inputTypes[i] === "number") node.inputs[i] = Number(x);
    });

    const outputs = await func(...node.inputs);
    node.outputs = outputs;

    return outputs;
  }

  const depths = getDepths();

  // const evalOrder = Object.entries(depths)
  //   .filter(x => x[1] > -1)
  //   .sort( (a, b) => b[1] - a[1])
  //   .map(x => x[0])

  const depthGroups = getGroups(depths);


  // topo sort is wrong
  // console.log(depths, depthGroups);

  for (let group of depthGroups) {
    const promises = group.map(evalNode);
    const outputs = await Promise.all(promises);
    
    group.forEach(id => {
      const node = nodes[id];
      const type = node.type;
      const nodeType = nodeTypes[type];
      const func = nodeType.func;

      if (!nodeType.onUpdate) return;

      const view = nodeType.onUpdate(node);
      const container = document.querySelector(`[data-id="${id}"] > .node-view`);

      if (typeof view === "string") {
        container.innerHTML = view;
      } else {
        // container.innerHTML = "";
        while (container.firstChild) {
          container.removeChild(container.lastChild);
        }
        container.append(view);
      }
    })
  }

}