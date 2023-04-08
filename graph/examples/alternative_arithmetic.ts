import { traverse_forward_breadth_first } from "../traversal";
import { createGraph } from "../createGraph";

const graphConfig = {
    "INPUT": {
        inputNames: [],
        outputNames: ["value"],
        data: {
            value: 0,
            op: "INPUT"
        }
    },
    "ADD": {
        inputNames: ["x", "y"],
        outputNames: ["value"],
        data: {
            value: 0,
            op: "ADD"
        }
    },
    "SUBTRACT": {
        inputNames: ["x", "y"],
        outputNames: ["value"],
        data: {
            value: 0,
            op: "SUBTRACT"
        }
    },
    "MULTIPLY": {
        inputNames: ["x", "y"],
        outputNames: ["value"],
        data: {
            value: 0,
            op: "MULTIPLY"
        }
    },
    "DIVIDE": {
        inputNames: ["x", "y"],
        outputNames: ["value"],
        data: {
            value: 0,
            op: "DIVIDE"
        }
    },
}

function makeArithmeticGraph() {
    const graph = createGraph();
    
    const doMoreFns = [recompute_value, update_ui];

    const setValue = (node_id, value) => {
        const node = graph.getNode(node_id);
        node.data.value = value;

        const sortedGroups = topoSortAndGroup([ node_id ], graph);

        sortedGroups.forEach(group => {
            group.forEach(id => {
                typeCheck(id, graph);
            })
        })

        sortedGroups.forEach(group => {
            group.forEach(id => {
                doMoreFns.forEach(fn => {
                    fn(id, graph);
                })
            })
        })
    }

    const addSetValueListener = (fn) => {
        doMoreFns.push(fn);
    }

    return { graph, setValue, addSetValueListener, graphConfig };
}

function recompute_value(node_id: string, graph) {
    const node = graph.getNode(node_id);
    // There's nothing to compute for input nodes.
    if (node.data.op === "Input") {
        return;
    }

    const [ lhs_value, rhs_value ] = graph.getInputValues(
        node_id, 
        "value"
    );

    if (lhs_value === null || rhs_value === null) {
        node.data.value = null;
        return;
    }

    // If both inputs are connected and defined, we can actually do some math.
    switch (node.data.op) {
        case "ADD":
            node.data.value = lhs_value + rhs_value;
            break;
        case "SUBTRACT":
            node.data.value = lhs_value - rhs_value;
            break;
        case "MULTIPLY":
            node.data.value = lhs_value * rhs_value;
            break;
        case "DIVIDE":
            node.data.value = lhs_value / rhs_value;
            break;
    }
}

function update_ui(node_id: string, graph) {
    const node = graph.getNode(node_id);
    drawNode(node_id, node.data);
}

export { makeArithmeticGraph };
