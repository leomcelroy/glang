import { example } from "./example.js";


// export function topologicalSort(triggers, graph) {
//   const { nodes, edges } = graph;

//   const depths = {};
//   triggers.forEach(x => getDepths(x, nodes, edges, depths));

//   console.log(graph, depths);
// }

export function topologicalSort(graph, triggerNodes) {
  let visited = new Set();
  let stack = [];
  let depths = {};
  let hasCycle = false;

  for (let triggerNode of triggerNodes) {
    if (!visited.has(triggerNode)) {
      let nodeStack = [{ node: triggerNode, depth: 0, path: new Set() }];

      while (nodeStack.length > 0) {
        let current = nodeStack.pop();

        let currentNode = current.node;
        let currentDepth = current.depth;
        let currentPath = current.path;

        if (!visited.has(currentNode)) {
          visited.add(currentNode);
          stack.push(currentNode);
          depths[currentNode] = currentDepth;

          let neighbors = graph
            .nodes[currentNode]
            .inputs
            .filter(x => x !== null)
            .map(x => graph.edges[x].src.node_id) || [];


          for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              let newPath = new Set(currentPath);
              newPath.add(currentNode);
              nodeStack.push({ node: neighbor, depth: currentDepth + 1, path: newPath });
            } else if (currentPath.has(neighbor) || neighbor === currentNode) {
              hasCycle = true;
              break;
            }
          }
        }

        if (hasCycle) {
          break;
        }
      }
    }

    if (hasCycle) {
      break;
    }
  }

  if (hasCycle) {
    console.warn("Graph contains a cycle!");
    return null;
  }

  return depths;
}

function getDepths(trigger, nodes, edges, depths) {
  const keys = Object.keys(nodes);
  keys.forEach(k => depths[k] = -1);
  
  const stack = [ trigger ];

  let last = -1;
  while (stack.length > 0) {

    const id = stack.pop();
    depths[id] = last + 1;
    last = depths[id];

    if (depths[id] > keys.length) {
      console.log("cycle detected");
      break;
    }

    const inputs = nodes[id].inputs.filter(x => x !== null);

    inputs.forEach(x => {
      stack.push(edges[x].src.node_id);
    });
  }

  return depths;
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