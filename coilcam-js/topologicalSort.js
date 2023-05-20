import { example } from "./example.js";

export function topologicalSort(graph, triggerNodes, backward = true) {
  const depthMaps = triggerNodes.map(x => getDepths(graph, x, backward));

  const finalDepthMap = {};

  depthMaps.forEach(depths => {
    for (const id in depths) {
      if (id in finalDepthMap) {
        finalDepthMap[id] = Math.max(depths[id], finalDepthMap[id]);
      } else {
        finalDepthMap[id] = depths[id];
      }
    }
  })


  const grouping = getGroups(finalDepthMap);

  return grouping;
}

// export function topologicalSort(graph, triggerNodes) {
//   let stack = [];
//   let depths = {};
//   let hasCycle = false;

//   for (let triggerNode of triggerNodes) {
//     let nodeStack = [{ node: triggerNode, depth: 0, path: new Set() }];

//     while (nodeStack.length > 0) {
//       let current = nodeStack.pop();

//       let currentNode = current.node;
//       let currentDepth = current.depth;
//       let currentPath = current.path;

//       if (!currentPath.has(currentNode)) {
//         stack.push(currentNode);
//         depths[currentNode] = currentDepth;
        
//         let neighbors = graph
//           .nodes[currentNode]
//           .inputs
//           .filter(x => x !== null)
//           .map(x => graph.edges[x].src.node_id) || [];

//         for (let neighbor of neighbors) {
//           if (!currentPath.has(neighbor)) {
//             let newPath = new Set(currentPath);
//             newPath.add(currentNode);
//             nodeStack.push({ node: neighbor, depth: currentDepth + 1, path: newPath });
//           } else {
//             console.warn("Graph contains a cycle!");
//             return null;
//           }
//         }
//       }
//     }
//   }

//   console.log(depths);

//   const groups = getGroups(depths);

//   return groups;
// }

/*
          let neighbors = graph
            .nodes[currentNode]
            .inputs
            .filter(x => x !== null)
            .map(x => graph.edges[x].src.node_id) || [];
*/

function getDepths(graph, node, backward) {
  const keys = Object.keys(graph.nodes);
  const depths = {};
  keys.forEach(k => depths[k] = -1);
  traverse(depths, graph, node, 0, backward);

  return depths;
}

const traverse = (depths, graph, id, count, backward) => {
  depths[id] = count++;

  if (depths[id] > Object.keys(graph.nodes).length) {
    console.warn("cycle detected in graph");
    return null;
  }

  let neighbors = graph
    .nodes[id]
    [backward ? "inputs" : "outputs"];

  if (!backward) neighbors = neighbors.flat();

  neighbors = neighbors
    .filter(x => x !== null)
    .map(x => graph.edges[x][backward ? "src" : "dst"].node_id) || [];

  neighbors.forEach(i => traverse(depths, graph, i, count, backward));
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