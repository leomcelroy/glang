import { createGraph, addNode, addEdge } from "./crud";

type NodeData = {
    value: number;
};

type EdgeData = {};

const graph = createGraph<NodeData, EdgeData>();

const node_1 = addNode(graph, {value: 1}, 0, 1);
const node_2 = addNode(graph, {value: 2}, 0, 1);
const node_3 = addNode(graph, {value: 3}, 2, 0);

const edge_1 = addEdge(graph, {}, node_1, 0, node_3, 0);
const edge_2 = addEdge(graph, {}, node_2, 0, node_3, 1);

console.log(graph);
