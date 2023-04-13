import { createListener } from "./createListener.js";
import { render } from "./actions/render.js";
import { add_node } from "./actions/add_node.js";

function getXY(e, selector) {
  let rect = document.querySelector(selector).getBoundingClientRect();
  let x = e.clientX - rect.left; //x position within the element.
  let y = e.clientY - rect.top;  //y position within the element.

  return [ x, y ];
}

export function addNodeAdding(el, state) {
  const listen = createListener(el);

  let dragging = false;
  let id = "";

  listen("mousedown", ".node-type", e => {
    dragging = true;
    const typeToAdd = e.target.dataset.type;

    id = add_node(typeToAdd);
  })

  listen("mousemove", "", e => {
    if (!dragging) return;

    const [ x, y ] = state.dataflow.getPoint(...getXY(e, ".dataflow"));

    state.graphUIData[id].x = x;
    state.graphUIData[id].y = y;
  })

  listen("mouseup", ".node-toolbox", () => {
    if (dragging) {
      state.graph.removeNode(id);
    }
  })

  listen("mouseup", "", e => {
    id = "";
    dragging = false;
  })
}
