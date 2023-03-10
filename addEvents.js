import { addPanZoom } from "./addPanZoom.js";
import { addSelectBox } from "./addSelectBox.js";
import { addDropUpload } from "./addDropUpload.js";
import { addNodeAdding } from "./addNodeAdding.js";

import { add_connection } from "./actions/add_connection.js";
import { remove_connection } from "./actions/remove_connection.js";
import { move_node } from "./actions/move_node.js";


const trigger = e => e.composedPath()[0];
const matchesTrigger = (e, selectorString) => trigger(e).matches(selectorString);
const pathContains = (e, selectorString) => e.composedPath().some(el => el.matches && el.matches(selectorString));
// create on listener
const createListener = (target) => (eventName, selectorString, event) => { // focus doesn't work with this, focus doesn't bubble, need focusin
  target.addEventListener(eventName, (e) => {
    e.trigger = trigger(e); // Do I need this? e.target seems to work in many (all?) cases
    if (selectorString === "" || matchesTrigger(e, selectorString)) event(e);
  })
}

function pauseEvent(e) {
  if(e.stopPropagation) e.stopPropagation();
  if(e.preventDefault) e.preventDefault();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
}

function getRelative(selector0, selector1) {
  // Get the top, left coordinates of two elements
  const el0 = document.querySelector(selector0);
  const el1 = document.querySelector(selector1);
  const eleRect = el0.getBoundingClientRect();
  const targetRect = el1.getBoundingClientRect();

  // Calculate the top and left positions
  const top = eleRect.top - targetRect.top;
  const left = eleRect.left - targetRect.left;

  return [ left, top ];
}

const getXY = (e, selector) => {
  let rect = document.querySelector(selector).getBoundingClientRect();
  let x = e.clientX - rect.left; //x position within the element.
  let y = e.clientY - rect.top;  //y position within the element.

  return [ x, y ];
}

function addWireManipulation(listen, state) {
  let from = "";
  let to = "";
  let currentIndex = "";

  listen("mousedown", ".node-input-circle", e => {
    // if connected clickedKey is current input
    const [ node, _inOut, port ] = e.target.dataset.id.split(":");

    // check if input is destination
    for (const key in state.edges) {
      const edge = state.edges[key];
      if (edge.dst.node === node && Number(port) === edge.dst.port) {
        currentIndex = key;
      }
    }

    if (currentIndex !== "") {
      const src = state.edges[currentIndex].src
      from = `${src.node}:out:${src.port}`;
    }
  })

  listen("mousedown", ".node-output-circle", e => {
    from = e.target.dataset.id;
  })

  listen("mouseup", ".node-input-circle", e => {
    to = e.target.dataset.id;
  })

  listen("mousemove", "", e => {
    if (from !== "") {
      const rect = document.querySelector(`[data-id="${from}"]`).getBoundingClientRect();
      const [ rx, ry ] = getRelative(`[data-id="${from}"]`, ".dataflow");
      state.tempEdge = [
        from,
        getXY(e, ".dataflow")
      ];
      
    }

    if (currentIndex !== "") {
      remove_connection(currentIndex);
      currentIndex = "";
    }
  })


  listen("mouseup", "", e => {
    if (from === "") return;

    if (from !== "" && to !== "") {

      const [ node, _inOut, port ] = to.split(":");

      // check if input is destination
      for (const key in state.edges) {
        const edge = state.edges[key];
        if (edge.dst.node === node && Number(port) === edge.dst.port) {
          currentIndex = key;
        }
      }
      // console.log("add", from, to);

      if (currentIndex !== "") remove_connection(currentIndex);
      
      add_connection(from, to);
    }

    from = "";
    to = "";
    currentIndex = "";

    state.tempEdge = ["", [0, 0]];
    
  })

}

function addNodeDragging(listen, state) {
  let nodeClicked = false;
  let nodeId = "";
  let moved = false;

  listen("mousedown", "", e => {

    document.body.classList.add("no-select");
    const path = e.composedPath();
    if (path.some(div => div.matches && div.matches(".socket"))) {
      state.dataflow.togglePanZoom(true);
      return;
    }

    if (!pathContains(e, ".dataflow")) return;

    nodeClicked = path.find(div => div.matches && div.matches(".node"));

    if (nodeClicked) {
      state.dataflow.togglePanZoom(true);
      nodeId = nodeClicked.dataset.id;
      const selected = state.selectedNodes.includes(nodeId);
      if (selected && e.detail === 2) { // if selected how to remove
        state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
      } else if (!state.selectedNodes.includes(nodeId) && !e.shiftKey){
        state.selectedNodes = [nodeId];
      } else if (!state.selectedNodes.includes(nodeId) && e.shiftKey) {
        state.selectedNodes.push(nodeId);
      }
    } else if (!e.shiftKey) {
      state.selectedNodes = [];
    }

    // hacky bug fix, for some reason input views intefere with each other
    const tempSelected = state.selectedNodes;
    state.selectedNodes = [];
    

    state.selectedNodes = tempSelected;
    
  })

  listen("mousemove", "", e => {
    if (!nodeClicked) return

    moved = true;

    const scale = state.dataflow.scale()
    state.selectedNodes.forEach(id => {
      move_node(
        id,
        e.movementX/scale,
        e.movementY/scale
      );
    })

    

  })

  listen("mouseup", "", e => {
    // TODO: if over toolbox then delete node

    document.body.classList.remove("no-select");

    // if (state.selectedNodes.length === 1 && moved) {
    //   state.selectedNodes = [];
    //   
    // }

    nodeClicked = false;
    nodeId = "";
    state.dataflow.togglePanZoom(false);
    moved = false;

  })
}

export function addEvents(state) {

  const dataflow = document.querySelector(".dataflow");
  state.dataflow = addPanZoom(dataflow);

  const body = document.querySelector("body");
  const listenBody = createListener(body);

  addNodeDragging(listenBody, state);
  addWireManipulation(listenBody, state);
  addSelectBox(listenBody, state);
  addDropUpload(listenBody, state);

  addNodeAdding(body, state);

  body.addEventListener("keydown", e => {
    if (e.keyCode === 191) {
      // const container = body.querySelector(".dropdown-container");
      // global_state.openSearch = true;
      e.preventDefault();
    }
  })
}
