import { createListener } from "./createListener.js";

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
  let typeToAdd = "";

  listen("mousedown", ".node-type", e => {
    typeToAdd = e.target.dataset.type;
    dragging = true;
    id = crypto.randomUUID();
  })

  listen("mousemove", "", e => {
    if (!dragging) return;

    const [ x, y ] = state.dataflow.getPoint(...getXY(e, ".dataflow"));

    const node = JSON.parse(JSON.stringify(state.nodeTypes[typeToAdd]));

    // TODO: get default values from types
    state.graph.nodes[id] = {
      ...node,
      data: {
        x,
        y
      }
    }
  })

  listen("mouseup", ".node-toolbox", () => {
    if (dragging) delete state.nodes[id];
  })

  listen("mouseup", "", e => {
    id = "";
    dragging = false;
  })
}
