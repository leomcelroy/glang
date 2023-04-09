import { createGraph, addNode, addEdge } from "./crud";
import { traverse_depth_first_forward, traverse_breadth_first_forward, traverse_breadth_first_backward} from "./traversal";
import { topological_sort } from "./topological_sort";
import { makeArithmeticGraph, ArithmeticOperation } from "./examples/arithmetic";

//--------------------------------------------------------------------------------------------------
// Testing construction and traversal of a simple graph.

/*
type NodeData = {
    value: number;
};

type EdgeData = {};

const graph = createGraph<NodeData, EdgeData>();

const node_1 = addNode(graph, {value: 1}, 0, 1);
const node_2 = addNode(graph, {value: 2}, 1, 1);
const node_3 = addNode(graph, {value: 3}, 1, 1);
const node_4 = addNode(graph, {value: 4}, 2, 0);
const node_5 = addNode(graph, {value: 5}, 1, 0);
console.log("node_1", node_1);
console.log("node_2", node_2);
console.log("node_3", node_3);
console.log("node_4", node_4);
console.log("node_5", node_5);

const edge_1 = addEdge(graph, {}, node_1, 0, node_2, 0);
const edge_2 = addEdge(graph, {}, node_1, 0, node_3, 0);
const edge_3 = addEdge(graph, {}, node_2, 0, node_4, 0);
const edge_4 = addEdge(graph, {}, node_3, 0, node_4, 1);
const edge_5 = addEdge(graph, {}, node_2, 0, node_5, 0);

console.log(graph);

console.log("depth first (forward)")
traverse_depth_first_forward(
    graph,
    node_1,
    (node_id, node) => { console.log("entering ", node_id, node.data.value); return false; },
    (node_id, node) => { console.log("exiting ", node_id, node.data.value); },
);
console.log("")

const sorted_node_ids = topological_sort(graph);
console.log("topologically sorted node ids", sorted_node_ids);
console.log("")

console.log("breadth first forward")
traverse_breadth_first_forward(graph, node_1, (graph, node_id, node) => {
    console.log(node_id, node.data.value);
});
console.log("")

console.log("breadth first backward")
traverse_breadth_first_backward(graph, node_4, (graph, node_id, node) => {
    console.log(node_id, node.data.value);
});
console.log("")
*/


//--------------------------------------------------------------------------------------------------
// Testing construction of an arithmetic graph.

const graph = makeArithmeticGraph();
const input_1 = graph.addNode(ArithmeticOperation.Input);
const input_2 = graph.addNode(ArithmeticOperation.Input);
const add = graph.addNode(ArithmeticOperation.Add);
graph.addEdge(input_1, add, 0);
graph.addEdge(input_2, add, 1);
graph.setInputValue(input_1, 2);
graph.setInputValue(input_2, 2);

console.log(`2 + 2 = ${graph.getNode(add).data.value}`);
