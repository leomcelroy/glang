import { render, html, svg } from './uhtml.js';
import { delete_node } from "./actions/delete_node.js";

const drawNodeInput = (k, index, name) => html`
  <div class="node-input">
    <div
      class=${[
        "node-input-circle", 
        "socket"
      ].join(" ")}
      data-id=${`${k}:in:${index}`}></div>
    <div class="node-input-name">${name}</div>
  </div>
`

const drawNodeOutput = (k, index, name) => html`
  <div class="node-output">
    <div class="node-output-name">${name}</div>
    <div
      class="node-output-circle socket"
      data-id=${`${k}:out:${index}`}></div>
  </div>
`

const drawNode = (item, state) => { // TODO: make this a keyed-render
  const [ k, node ] = item;

  const selected = state.selectedNodes.includes(k);

  return html.for(node, k)`
    <div
      class=${["node", selected ? "selected-node" : ""].join(" ")}
      data-id=${k}
      style=${`left: ${node.data.x}px; top: ${node.data.y}px;`}>
      <div class="node-title">
        <div class="node-name">${node.type}</div>
      </div>
      ${node.inputs.map((x, i) => drawNodeInput(k, i, x))}
      ${node.outputs.map((x, i) => drawNodeOutput(k, i, x))}
      <div class="node-view" id=${k}></div>
    </div>
  `
}


function getRelative(selector0, selector1) {
  // Get the top, left coordinates of two elements
  const el0 = document.querySelector(selector0);
  const el1 = document.querySelector(selector1);
  const eleRect = el0?.getBoundingClientRect() || { top: 0, left: 0 };
  const targetRect = el1?.getBoundingClientRect() || { top: 1, left: 1 };

  // Calculate the top and left positions
  const top = eleRect.top - targetRect.top;
  const left = eleRect.left - targetRect.left;

  return [ left, top ];
}

function drawEdge(edge, state) { // there muse be a better way to do this
  const { nodes } = state;
  const outNode = edge.src.node;
  const inNode = edge.dst.node;

  if (!document.querySelector(".socket") || state.dataflow === null) return "";

  const offset0 = getRelative(`[data-id="${edge.src.node}:out:${edge.src.port}"]`, `.dataflow`);
  const offset1 = getRelative(`[data-id="${edge.dst.node}:in:${edge.dst.port}"]`, `.dataflow`);
  const rect0 = document.querySelector(`[data-id="${edge.src.node}:out:${edge.src.port}"]`)?.getBoundingClientRect() || { top: 0, left: 0 };
  const rect1 = document.querySelector(`[data-id="${edge.dst.node}:in:${edge.dst.port}"]`)?.getBoundingClientRect() || { top: 0, left: 0 };

  const x0 = offset0[0]+rect0.width/2;
  const y0 = offset0[1]+rect0.height/2;
  const x1 = offset1[0]+rect1.width/2;
  const y1 = offset1[1]+rect1.height/2;


  let xDist = Math.abs(x0 - x1);
  xDist = xDist/1.3;

  const data = `M ${x0} ${y0} C ${x0 + xDist} ${y0}, ${x1 - xDist} ${y1}, ${x1} ${y1}`;

  return svg`
    <path class="edge" stroke-width=${`${3*state.dataflow.scale()}px`} vector-effect="non-scaling-stroke" d=${data}/>
  `
}

function drawTempEdge(edge, state) {
  if (!document.querySelector(".socket")) return;

  const [ from, [x1, y1] ] = edge;

  if (from === "" || state.dataflow === null) return svg``;

  const offset0 = getRelative(`[data-id="${from}"]`, `.dataflow`);

  const x0 = offset0[0]+document.querySelector(`[data-id="${from}"]`).getBoundingClientRect().width/2;
  const y0 = offset0[1]+document.querySelector(`[data-id="${from}"]`).getBoundingClientRect().height/2;

  let xDist = Math.abs(x0 - x1);
  xDist = xDist/1.3;

  const data = `M ${x0} ${y0} C ${x0 + xDist} ${y0}, ${x1 - xDist} ${y1}, ${x1} ${y1}`;

  return svg`
    <path class="edge" stroke-width=${`${3*state.dataflow.scale()}px`} vector-effect="non-scaling-stroke" d=${data}>
  `
}

const drawSelectBox = box => {
  if (!box || !box.start || !box.end) return "";

  return html`
    <div
      class="select-box"
      style=${`
        background: blue;
        opacity: 0.1;
        z-index: 100;
        position: absolute;
        left: ${box.start[0]}px;
        top:${box.start[1]}px;
        width: ${Math.abs(box.end[0] - box.start[0])}px;
        height:${Math.abs(box.end[1] - box.start[1])}px;
      `}>
    </div>
  `
}

const dropdown = (state) => {
  const searchQuery = state.searchTerm.toLowerCase();
  const nts = Object.entries(state.nodeTypes);
  const filteredNodes = nts.filter(( [ key, value] ) => key.toLowerCase().includes(searchQuery));

  return html`
    <div class="menu-item dropdown-container">
      <i class="fa-solid fa-bars" style="padding-right: 10px;"></i>
      add node
      <div class="dropdown-list node-toolbox">
        <input class="node-search" .value=${state.searchTerm} @input=${e => {
          state.searchTerm = e.target.value;
        }}/>
        ${filteredNodes.map(([ key, value ]) => html`
            <div class="menu-item node-type" data-type=${key}>${key}</div>
          `)}
      </div>
    </div>
  ` 
}

export function view(state) {
  const x = state.dataflow ? state.dataflow.x() : 0;
  const y = state.dataflow ? state.dataflow.y() : 0;
  const scale = state.dataflow ? state.dataflow.scale() : 1;

  return html`
    <div class="root">
      <div class="menu">
        <div class="menu-item" @click=${() => { } }}>
          <i class="fa-solid fa-play" style="padding-right: 10px;"></i>
          run
        </div>
        <div class="menu-item" @click=${() => { console.log(state.graph) }}>
          <i class="fa-solid fa-print" style="padding-right: 10px;"></i>
          print graph
        </div>
        <div class="menu-item" @click=${() => {
          state.selectedNodes.forEach(delete_node);
        }}>
          <i class="fa-solid fa-trash" style="padding-right: 10px;"></i>
          delete
        </div>
        ${dropdown(state)}

        <div class="menu-item-no-hover" style="position:absolute; right: 40px;">selected: ${state.selectedNodes.length}</div>
        <a class="github-logo" href="https://github.com/leomcelroy/glang">
          <i class="fa-brands fa-github" style="font-size:24px"></i>
        </a>
      </div>
   
      <div class="dataflow">
        <canvas
          id="background"
          style=${`--offset-x: ${x}px;--offset-y: ${y}px;--scale: ${scale}`}>
          </canvas>

        <svg class="edges">
          <g>
            ${Object.values(state.graph.edges).map(x => drawEdge(x, state))}
            ${drawTempEdge(state.tempEdge, state)}
          </g>
        </svg>
        
        <div class="nodes">
          <div class="transform-group">
            ${Object.entries(state.graph.nodes).map(e => drawNode(e, state))}
            ${drawSelectBox(state.selectBox)}
          </div>
        </div>
      </div>
    

    </div>
  `
}
