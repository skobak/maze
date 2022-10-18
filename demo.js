// DOM references
let complexityInput
let speedInput
let rowsInput
let columnsInput
let gridDiv
let stepCountDiv
let deadEndsCountDiv
let resultDiv

// Temprorary variables
let timeoutRef = null
let maxC = 30
let maxR = 30
let width = 10
let height = 10
let steps = [] // [ {r,c} ]
let speedMls = 20
let complexity = 7 // 0 - 10
let stepCount = 0
let deadEndsCount = 0

// Drawing part
function getCellComponent(isBlock, r, i) {
  const div = document.createElement('div')
  div.style.width = width + 'px'
  div.style.height = height + 'px'
  div.style.border = '1px solid black'
  div.style.display = 'inline-block'
  div.style.margin = '0px'
  div.setAttribute('id', 'r' + r + 'c' + i)
  div.setAttribute('class', isBlock ? 'block' : 'empty')
  return div
}

function drawRow(r, c) {
  const rowDiv = document.createElement('div')
  rowDiv.style.height = height+ 'px'
  for (let i = 0; i < c; i++) {
    let isBlock =
      (r === 0 && i == 0) || (r === maxR - 1 && i === maxC - 1)
        ? 0
        : Math.round(Math.random() * (11 - complexity)) === 1
    rowDiv.appendChild(getCellComponent(!!isBlock, r, i))
  }
  return rowDiv
}

function drawGrip(r, c) {
  gridDiv.innerHTML = ''
  for (let i = 0; i < r; i++) {
    gridDiv.appendChild(drawRow(i, c))
  }
}

function updateCounts() {
  stepCountDiv.innerHTML = stepCount
  deadEndsCountDiv.innerHTML = deadEndsCount
}

function drawPathSeeker(r, c) {
  stepCount++
  updateCounts()
  removePathSeekerFromGrid()
  const square = document.getElementById('r' + r + 'c' + c)
  const pathSeeker = document.createElement('div')
  pathSeeker.style.width = width / 2 + 'px'
  pathSeeker.style.height = height / 2 + 'px'
  pathSeeker.style.margin = width / 4 + 'px ' + height / 4 + 'px'
  pathSeeker.setAttribute('id', 'pathSeeker')
  pathSeeker.setAttribute('class', 'pathSeeker')
  square.classList.add('trace')
  square.appendChild(pathSeeker)
}

function markAsDeadEnd(r, c) {
  deadEndsCount++
  const suqare = document.getElementById('r' + r + 'c' + c)
  suqare.classList.add('dead-end')
}

function printResult(text) {
  resultDiv.innerHTML = text
}

// Cleaning part
function removePathSeekerFromGrid() {
  const pathSeekers = document.getElementsByClassName('pathSeeker')
  for (let i = 0; i < pathSeekers.length; i++) {
    pathSeekers[i].remove()
  }
}

function removeAllTraces() {
  const traces = document.getElementsByClassName('empty')
  for (let i = 0; i < traces.length; i++) {
    traces[i].attributes['class'].value = 'empty'
  }
}

// Main logic
// We start at certain point and try to go right or down. If that not possible
// we go back to a stack of steps and try again, if next move has not been mark as traced
// if history of steps is empty = we are done without success
// if we reach the left bottom corner = we are done with success
function findPath(r, c) {
  drawPathSeeker(r, c)
  if (r == maxR - 1 && c == maxC - 1) {
    printResult('bingo')
    return
  }
  let rightSquare = document.getElementById('r' + r + 'c' + (c + 1))
  let bottomSquare = document.getElementById('r' + (r + 1) + 'c' + c)

  if (
    rightSquare &&
    rightSquare.classList.contains('empty') &&
    !rightSquare.classList.contains('dead-end')
  ) {
    timeoutRef = setTimeout(() => findPath(r, c + 1), speedMls)
    steps.push({
      r,
      c,
    })
  } else if (
    bottomSquare &&
    bottomSquare.classList.contains('empty') &&
    !bottomSquare.classList.contains('dead-end')
  ) {
    timeoutRef = setTimeout(() => findPath(r + 1, c), speedMls)
    steps.push({
      r,
      c,
    })
  } else {
    markAsDeadEnd(r, c)
    if (steps.length > 0) {
      const lastStep = steps.pop()
      timeoutRef = setTimeout(() => findPath(lastStep.r, lastStep.c), speedMls)
    } else {
      printResult('no way')
      return
    }
  }
}

function startAgain() {
  if (timeoutRef !== null) {
    clearTimeout(timeoutRef)
  }
  stepCount = 0
  deadEndsCount = 0
  steps = []
  printResult('')
  removeAllTraces()
  findPath(0, 0)
}

function initDomElement() {
  gridDiv = document.getElementById('grid')
  complexityInput = document.getElementById('complexityInput')
  speedInput = document.getElementById('speedInput')
  rowsInput = document.getElementById('rowsInput')
  columnsInput = document.getElementById('columnsInput')
  stepCountDiv = document.getElementById('stepCount')
  deadEndsCountDiv = document.getElementById('deadEndsCount')
  resultDiv = document.getElementById('result')
}

function initZoomLevel() {
  width = window.outerWidth / 3 / maxR
  height = window.outerWidth / 3 / maxC
}

function setParams() {
  if (complexityInput.value === '') {
    complexityInput.value = complexity
  } else {
    complexity = parseInt(complexityInput.value)
  }
  if (speedInput.value === '') {
    speedInput.value = speedMls
  } else {
    speedMls = parseInt(speedInput.value)
  }
  if (rowsInput.value === '') {
    rowsInput.value = maxR
  } else {
    maxR = parseInt(rowsInput.value)
  }
  if (columnsInput.value === '') {
    columnsInput.value = maxC
  } else {
    maxC = parseInt(columnsInput.value)
  }
}

function reBuild() {
  setParams()
  initZoomLevel()
  drawGrip(maxR, maxC)
  startAgain()
}

function stop() {
  if (timeoutRef !== null) {
    clearTimeout(timeoutRef)
  }
}

window.onload = function () {
  initDomElement()
  reBuild()
}
