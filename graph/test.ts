import { createGraph, addNode, addEdge } from "./crud";
import { traverse_forward_breadth_first, traverse_backward_breadth_first } from "./traversal";
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
const node_2 = addNode(graph, {value: 2}, 0, 1);
const node_3 = addNode(graph, {value: 3}, 2, 1);
const node_4 = addNode(graph, {value: 4}, 1, 0);
const node_5 = addNode(graph, {value: 5}, 1, 0);

const edge_1 = addEdge(graph, {}, node_1, 0, node_3, 0);
const edge_2 = addEdge(graph, {}, node_2, 0, node_3, 1);
const edge_3 = addEdge(graph, {}, node_3, 0, node_4, 0);
const edge_4 = addEdge(graph, {}, node_1, 0, node_5, 0);

console.log("forward")
traverse_forward_breadth_first(graph, node_1, (graph, node_id, node) => {
    console.log(node_id, node.data.value);
});

console.log("backward")
traverse_backward_breadth_first(graph, node_4, (graph, node_id, node) => {
    console.log(node_id, node.data.value);
});

console.log(graph);
*/


//--------------------------------------------------------------------------------------------------
// Testing construction of an arithmetic graph.

const graph = makeArithmeticGraph();
const input_1 = graph.addNode(ArithmeticOperation.Input);
const input_2 = graph.addNode(ArithmeticOperation.Input);
const add = graph.addNode(ArithmeticOperation.Add);
graph.addEdge(input_1, add, 0);
graph.addEdge(input_2, add, 1);
graph.changeInputValue(input_1, 2);
graph.changeInputValue(input_2, 2);
console.log(`2 + 2 = ${graph.getNodeValue(add)}`);