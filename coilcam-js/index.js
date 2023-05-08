import { createGraphUI } from "./createGraphUI/createGraphUI";
import { createGraph } from "./createGraph";

const toolpath = {
  name: "toolpath",
  inputs: [
    [ "radius", "number" ],
    [ "scale", "number" ],
    [ "translate", "number" ],
    [ "rotate", "number" ],
  ],
  outputs: [
    [ "toolpath", "number[]" ]
  ],
  func: (radius, scale, translate, rotate) => {

    return [ toolpath ]
  },
  post: (id, graph) => {

  }
}

const sine = {
  name: "sine",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const linear = {
  name: "linear",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const square = {
  name: "square",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const staircase = {
  name: "staircase",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const exponential = {
  name: "exponential",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const union = {
  name: "union",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const difference = {
  name: "difference",
  inputs: [
    [ "amplitude", "number" ],
    [ "frequency", "number" ],
    [ "offset", "number" ],
    [ "nbLayers", "number" ],
    [ "values0", "number" ],
    [ "mode", "'additive' | 'multiplicative'" ],
  ],
  outputs: [
    [ "out", "number[]" ],
    [ "values", "number[]" ]
  ],
  func: (amplitude, frequency, offset, nbLayers, values0, mode) => {

    return [ out, values ]
  },
  post: (id, graph) => {

  }
}

const nodes = {
  // repeating toolpath
  toolpath,
  // function operators
  linear,
  sine,
  square,
  staircase,
  exponential,
  // booleans
  union,
  difference,
  // intersect,
}


const config = {
  graph: createGraph(),
  addNode,
  evaluate,
  nodes,
  drawNode,
}

// node`
//   toolpath(
//     radius: number, 
//     scale: number, 
//     translate: number, 
//     rotate: number
//   ): number[] {

//     const toolpath = [ radius, scale*translate+rotate ];

//     return toolpath;
//   }
// `





