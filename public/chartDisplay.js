//**----------------------------- */
//** CHART DISPLAY                */
//**----------------------------- */
import { PenConstruct } from './PenConstruct.js'
/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */
const {
  log
} = console

const CHART_LEFT_SIDE_OFFSET = 53
const CHART_TOP_SIDE_OFFSET = 30
const CHART_BOTTOM_SIDE_OFFSET = 50
const CHART_RIGHT_SIDE_OFFSET = 9
const RIGHT_MOUSE_BUTTON_CLICK = 2

const PRIMARY_COLOR_RGB = '0, 100, 130',
  SECONDARY_COLOR_RGB = '200, 0, 0',
  TERTIARY_COLOR_RGB = '60, 99, 57'
export const chartColorPalette = {
  PRIMARY_COLOR_RGB,
  SECONDARY_COLOR_RGB,
  TERTIARY_COLOR_RGB
}

Chart.defaults.global.elements.point.pointStyle = 'dash'
Chart.defaults.global.defaultFontSize = 10

//** FUNCTIONS */
function getNumberWithinRange(numberToVerify, marginLeftRange){
  const {low,high} = marginLeftRange
  return Math.min( Math.max(low, numberToVerify), high )
}

function getFormattedDate(dateString) {
  var todayTime = new Date(dateString);
  var month = format(todayTime .getMonth() + 1);
  var day = format(todayTime .getDate());
  var year = format(todayTime .getFullYear());
  return month + "/" + day + "/" + year;
}

export function makeChart(inputs) { 
  let {
    primaryName,
    primaryData,
    secondaryName,
    secondaryData,
    tertiaryName,
    tertiaryData,
    labels,
    onPressSetDateRangeButton = () => {},
    exicuteChartResize = () => {
      log('exicuteChartResize')
    },
  } = inputs

  const _exicuteChartResize = exicuteChartResize
  exicuteChartResize = ()=>{
    _exicuteChartResize()
    resetDateComponents()
    refreshNewDateRangeComponent()
  }

  let chartCanvas = document.createElement('canvas')
  chartJSContainer.appendChild(chartCanvas)
  chartCanvas.id = 'chartCanvas'

  let ctx = chartCanvas.getContext('2d')
  let dateArray
  let chartJSInstance

  let beginDateComponent, endDateComponent

  if(!beginDateComponent)beginDateComponent = addDateMarker({
    parentContiner: bottomFillStrip,
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
  }) 

  if(!endDateComponent)endDateComponent = addDateMarker({
    parentContiner: bottomFillStrip,
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
  }) 

  //** MOUSE EVENT HANDLING */
  let mouseIsPressed = false
  const sendMousePress = (e)=>{ 
    if (e.button === RIGHT_MOUSE_BUTTON_CLICK)return
    const clientX = function () {
      if (e.touches) return e.touches[0].clientX
      return e.clientX
    }()
    const clientY = function () {
      if (e.touches) return e.touches[0].clientY
      return e.clientY
    }()
    const cartLeftGap = chartCanvas.getBoundingClientRect().x
    const x = Math.round(clientX - cartLeftGap)
    // const x = Math.round(e.clientX - cartLeftGap)
    const cartTopGap = chartCanvas.getBoundingClientRect().y
    // const y = Math.round(e.clientY - cartTopGap)
    const y = Math.round(clientY - cartTopGap)
    pen.sendMousePress({x,y})
    mouseIsPressed = true
  }
  const sendMouseDrag = (e)=>{
    const clientX = function () {
      if (e.touches) return e.touches[0].clientX
      return e.clientX
    }()
    pen.sendMouseDrag({x:clientX})
  }

  const sendMouseRelease = ()=>{
    pen.sendMouseRelease()
    mouseIsPressed = false
  }


//** IMPLIMENT PEN EVENT FLOW HANDLER*/
  const pen = new PenConstruct()
  beginDateComponent.addEventListener('mousedown', ()=>{ 
    mouseIsPressed = true
    pen.sendMousePress(beginDateComponent)
  })

  beginDateComponent.addEventListener('touchstart', ()=>{ 
    pen.sendMousePress(beginDateComponent)
  })

  endDateComponent.addEventListener('mousedown', ()=>{
    mouseIsPressed = true
    pen.sendMousePress(endDateComponent)
  })

  endDateComponent.addEventListener('touchstart', ()=>{
    pen.sendMousePress(endDateComponent)
  })

  beginDateComponent.addEventListener('mouseover', ()=>{
    beginDateComponent.showHighlightLine()
  })
  beginDateComponent.addEventListener('mouseout', ()=>{
    if(mouseIsPressed)return
    beginDateComponent.hideHighlightLine()
  })

  endDateComponent.addEventListener('mouseover', ()=>{
    endDateComponent.showHighlightLine()
  })
  endDateComponent.addEventListener('mouseout', ()=>{
    if(mouseIsPressed)return
    endDateComponent.hideHighlightLine()
  })

  chartCanvas.addEventListener('mousedown', sendMousePress)
  chartCanvas.addEventListener('touchstart', sendMousePress)
  
  window.addEventListener('mouseup', ()=>{
    beginDateComponent.hideHighlightLine()
    endDateComponent.hideHighlightLine()
    pen.sendMouseRelease()
  })

  window.addEventListener('mousemove', sendMouseDrag)
  window.addEventListener('touchmove', sendMouseDrag)

  window.addEventListener('touchend', sendMouseRelease)
  chartCanvas.addEventListener('mouseup', sendMouseRelease)

  pen.mousePressEventStack = {
    mouseClickedOnBeginDateMark : {
      evaluate : (component)=>{
        if(component === beginDateComponent)return true
      },
      exicute : ()=>{
        let startDragBeginX
        let marginLeftAtBeginningOfMove = Number(beginDateComponent.container.style.marginLeft.split('px')[0]) 
        const fontSize = beginDateComponent.textElement.style.fontSize
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragBegin: (mouseDragPoint) => { 
            startDragBeginX = mouseDragPoint.x
            beginDateComponent.showHighlightLine()
            beginDateComponent.textElement.style.fontSize = 'medium'
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragContinue: (mouseDragPoint) => { 
            const moveDistance = mouseDragPoint.x - startDragBeginX
            const marginDist = Math.round(marginLeftAtBeginningOfMove + moveDistance)
            const marginNumber = getNumberWithinRange(marginDist, marginLeftRange)
            beginDateComponent.container.style.marginLeft = marginNumber + 'px'
            setDateString(beginDateComponent)
            refreshNewDateRangeComponent()
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseRelease: () => { 
            beginDateComponent.hideHighlightLine()
            beginDateComponent.textElement.style.fontSize = fontSize
          }
        })
      }
    },
    mouseClickedOnEndDateMark : { 
      evaluate : (component)=>{
        if(component === endDateComponent)return true
      },
      exicute : ()=>{
        let startDragBeginX
        let marginLeftAtBeginningOfMove = Number(endDateComponent.container.style.marginLeft.split('px')[0]) 
        const fontSize = endDateComponent.textElement.style.fontSize
       
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragBegin: (mouseDragPoint) => { 
            startDragBeginX = mouseDragPoint.x
            endDateComponent.showHighlightLine()
            endDateComponent.textElement.style.fontSize = 'medium'
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragContinue: (mouseDragPoint) => { 
            const moveDistance = mouseDragPoint.x - startDragBeginX
            const marginDist = Math.round(marginLeftAtBeginningOfMove + moveDistance)
            const marginNumber = getNumberWithinRange(marginDist, marginLeftRange)
            endDateComponent.container.style.marginLeft = marginNumber + 'px'
            setDateString(endDateComponent)
            refreshNewDateRangeComponent()
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseRelease: () => { 
            endDateComponent.hideHighlightLine()
            endDateComponent.textElement.style.fontSize = fontSize
          }
        })
      }
    },


    mouseClickedBetweenDateMarksWhileEditIsActive: {
      evaluate: (mousePressPoint,
        _timeSpanEditIsActive = timeSpanEditIsActive,
      ) => { 
        if (!_timeSpanEditIsActive) return
        if (mousePressPoint.x < beginDateComponent.x) return
        if (mousePressPoint.x > endDateComponent.x) return
        return true
      },
      exicute: () => {
        const firstDay = dateArray[ beginDateComponent.dateIndex]
        const lastDay = dateArray[ endDateComponent.dateIndex]
        onPressSetDateRangeButton([firstDay, lastDay])
        delete beginDateComponent.dateIndex
        delete endDateComponent.dateIndex
        resetDateComponents()
        // endDateComponent.hideHighlightLine()
      }
    },
    
    mouseClickedOnChartAreaDurringTimeSpanEditIsActive: { 
      evaluate: (mousePressPoint,
        _timeSpanEditIsActive = timeSpanEditIsActive,
        chartLeftOffset = CHART_LEFT_SIDE_OFFSET,
        chartRightOffset = chartContainer.getBoundingClientRect().width - CHART_RIGHT_SIDE_OFFSET,
      ) => {
        if (!_timeSpanEditIsActive) return
        if (mousePressPoint.x < chartLeftOffset) return
        if (mousePressPoint.x > chartRightOffset) return
        return true
      },
      exicute: () => { //log('mouseClickedOnChartAreaDurringTimeSpanEditIsActive')
        resetDateComponents()
      }
    },
    mouseClickedOnChartArea: { 
      evaluate: (
        mousePressPoint,
        chartLeftOffset = CHART_LEFT_SIDE_OFFSET,
        chartRightOffset = chartContainer.getBoundingClientRect().width - CHART_RIGHT_SIDE_OFFSET,
      ) => {
        if (mousePressPoint.x < chartLeftOffset) return
        if (mousePressPoint.x > chartRightOffset) return
        return {mousePressPoint}
      },
      exicute: (mousePressInfo) => {  log('mouseClickedOnChartArea')

        const {mousePressPoint} = mousePressInfo
        let startDragBeginX
        const chartRightGap = chartContainer.getBoundingClientRect().x
        let moveCount = 0
        let firstNewMargin

        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragBegin: (mouseDragPoint) => { 
            startDragBeginX = mousePressPoint.x
            firstNewMargin = startDragBeginX - beginDateComponent.x
            beginDateComponent.container.style.marginLeft = firstNewMargin + 'px'
            setDateString(beginDateComponent)
            refreshNewDateRangeComponent()
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseDragContinue: (mouseDragPoint) => { 
            const secondNewMargin = getNumberWithinRange(mouseDragPoint.x - chartRightGap - CHART_LEFT_SIDE_OFFSET, marginLeftRange)
            let thisDateComponent = endDateComponent
            if(firstNewMargin > secondNewMargin){
              thisDateComponent = beginDateComponent
              endDateComponent.container.style.marginLeft = firstNewMargin + 'px'
            } else{
              beginDateComponent.container.style.marginLeft = firstNewMargin + 'px'
            }
            thisDateComponent.container.style.marginLeft = secondNewMargin + 'px'
            setDateString(thisDateComponent)
            refreshNewDateRangeComponent()
            moveCount++
          }
        })
        pen.defineEventFunction({
          //** EVENT-----*/
          mouseRelease: () => { 
            if(moveCount < 10) resetDateComponents()
            beginDateComponent.hideHighlightLine()
            endDateComponent.hideHighlightLine()
          }
          
        })
      }
    }
  }


  function getPointIsWithinChartFrame(x, y) {
    const chartAreaBox = getChartAreaBox()
    if (x < chartAreaBox.left) return false
    if (x > chartAreaBox.right) return false
    if (y < chartAreaBox.top) return false
    if (y > chartAreaBox.bottom) return false
    return true
  }

  function getChartAreaBox() {
    const chartCanvasBox = chartCanvas.getBoundingClientRect()
    return {
      left: CHART_LEFT_SIDE_OFFSET,
      right: chartCanvasBox.width - CHART_RIGHT_SIDE_OFFSET,
      top: CHART_TOP_SIDE_OFFSET,
      bottom: chartCanvasBox.height - CHART_BOTTOM_SIDE_OFFSET
    }
  }

  let marginLeftRange = { low : 0, high : 0}

  function resetDateComponents (){ 
    beginDateComponent.height = chartJSContainer.getBoundingClientRect().height
    endDateComponent.height = chartJSContainer.getBoundingClientRect().height
    const chartWidth = chartJSContainer.getBoundingClientRect().width
    marginLeftRange.high =  chartWidth - CHART_RIGHT_SIDE_OFFSET - CHART_LEFT_SIDE_OFFSET

    //* TODO FIX AMIMATION BELOW (DO NOT DELETE)   */
    // function animateMarginChange (container, destination){
    //   const currentMargin = Number(container.style.marginLeft.split('px')[0])
    //   let moveIncriment = Math.abs(currentMargin - destination)
    //   let loopMove = setInterval(() => {
    //     if(moveIncriment <= 0){
    //       clearInterval(loopMove);
    //       container.style.marginLeft = destination + 'px'
    //       // endDateComponent.container.style.marginLeft = marginLeftRange.high + 'px'
    //       setDateString(beginDateComponent)
    //       setDateString(endDateComponent)
    //       refreshNewDateRangeComponent()
    //     } else  container.style.marginLeft = (destination + moveIncriment) + 'px'
    //     moveIncriment -= 8
    //   }, 1);
    // }
    // animateMarginChange(beginDateComponent.container, 0)
    //*  AMIMATION TO REPLACE BELOW */
    endDateComponent.container.style.marginLeft = marginLeftRange.high + 'px'
    beginDateComponent.container.style.marginLeft = '0px'
    setDateString(beginDateComponent)
    setDateString(endDateComponent)
    refreshNewDateRangeComponent()
  }

  function setDateString(component){
    const fullLength = chartJSContainer.getBoundingClientRect().width - CHART_LEFT_SIDE_OFFSET - CHART_RIGHT_SIDE_OFFSET
    const marginNumber = Number(component['container'].style.marginLeft.split('px')[0])
    const fraction = marginNumber / fullLength
    const index = Math.round( fraction * formatedDateArray.length)
    const dateStr = formatedDateArray[index]
    component.dateIndex = index
    if(dateStr)component.textElement.textContent = dateStr
  }

  function getTimeSpanInDays(date1, date2) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
  }
  function getTimeSpanInYears(date1, date2) {
    return Math.abs(Math.round((getTimeSpanInDays(date1, date2) / 365) * 100) / 100)
  }

  function refreshNewDateRangeComponent(){
    if (!newDateRangeContainer) {
      newDateRangeContainer = document.createElement('div')
      chartContainer.insertBefore(newDateRangeContainer, bottomFillStrip)
      newDateRangeContainer.style.position = 'absolute'
      // newDateRangeContainer.style.height = '1.5em'
      newDateRangeContainer.style.fontSize = 'x-small'
      newDateRangeContainer.style.border = 'none'
      newDateRangeContainer.style.textAlign = 'center'
      // newDateRangeContainer.style.marginTop = -1 * newDateRangeContainer.getBoundingClientRect().height + 'px'
      newDateRangeContainer.style.pointerEvents = 'none'
      newDateRangeContainer.addEventListener('click', () => {
      })
      //** ---------------------- */
      setRangeLabel = document.createElement('text')
      newDateRangeContainer.append(setRangeLabel)
      setRangeLabel.style.position = 'absolute'
      setRangeLabel.textContent = 'SET RANGE'
      setRangeLabel.style.fontSize = 'small'
      setRangeLabel.style.border = 'none'
      setRangeLabel.style.marginLeft = '-1em'
      setRangeLabel.style.whiteSpace = 'nowrap'
      setRangeLabel.style.marginLeft = '-35px'
      setRangeLabel.style.color = 'purple'
      setRangeLabel.style.fontWeight = 'bold'
      //** ---------------------- */
      timeSpanText = document.createElement('text')
      timeSpanText.style.position = 'absolute'
      timeSpanText.style.whiteSpace = 'nowrap'
      newDateRangeContainer.append(timeSpanText)
    }
    if(!beginDateComponent.dateIndex)beginDateComponent.dateIndex = 0
    if(!endDateComponent.dateIndex)endDateComponent.dateIndex = dateArray.length - 1
    if(!dateArray[endDateComponent.dateIndex])endDateComponent.dateIndex--
    const atFullRange = (beginDateComponent.dateIndex === 0 && endDateComponent.dateIndex === dateArray.length - 1)
    if(atFullRange){
      timeSpanEditIsActive = false
      newDateRangeContainer.style.backgroundColor = ''
      setRangeLabel.hidden = true
    } else {
      timeSpanEditIsActive = true
      newDateRangeContainer.style.backgroundColor = 'rgba(255,0,0,0.1)'
      newDateRangeContainer.style.height = chartJSContainer.getBoundingClientRect().height + 'px'
      newDateRangeContainer.style.marginTop = (chartJSContainer.getBoundingClientRect().height * -1) + 'px'
      setRangeLabel.hidden = false
    }
    const timeSpan = getTimeSpanInYears(dateArray[beginDateComponent.dateIndex], dateArray[endDateComponent.dateIndex])
    timeSpanText.textContent = timeSpan + ' Years'
    timeSpanText.style.marginTop = (chartJSContainer.getBoundingClientRect().height - 16 ) + 'px'
    timeSpanText.style.marginLeft = ((timeSpanText.getBoundingClientRect().width / 2.5) * -1 ) + 'px'
    
    const rangeWidth = Math.abs(beginDateComponent.x - endDateComponent.x)
    newDateRangeContainer.style.marginLeft = beginDateComponent.x + 'px'
    newDateRangeContainer.style.width = rangeWidth + 'px'
  }

  let formatedDateArray
  function formatDates(dateArray) {
    formatedDateArray = dateArray.map(dateString => {
      const date = new Date(dateString)
      const dateArr = date.toDateString().split(' ')
      dateArr.shift()
      return dateArr.join(' ')
    })
    return formatedDateArray
  }

  function refreshChart() {
    dateArray = labels
    chartJSInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formatDates(labels),
        datasets: [{
            label: primaryName,
            lineTension: 0,
            data: primaryData,
            borderColor: [`rgba(${PRIMARY_COLOR_RGB},1)`],
            borderWidth: 1
          },
          {
            label: secondaryName,
            lineTension: 0,
            data: secondaryData,
            fill: false,
            borderColor: [`rgba(${SECONDARY_COLOR_RGB},1)`],
            borderWidth: 1
          },
          {
            label: tertiaryName,
            lineTension: 0,
            data: tertiaryData,
            borderColor: [`rgba(${TERTIARY_COLOR_RGB},1)`],
            borderWidth: 1
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 0,
            right: 10,
            top: 10,
            bottom: 0
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
            },
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              callback: function (value, index, values) {
                const prefix = value === 0 ? '------' : ''
                return prefix + value + '%'
              },
            },
          }]
        }
      }
    })

    //*  RESET DATE MARKERS BY TIME LOOP...CHECK WHEN CHART-JS IS LOADED
    let timeCount = 0
    const initialHeight = chartJSContainer.getBoundingClientRect().height
    let loopToCheckChartDidLoad = setInterval(() => {
      const currentHeight = chartJSContainer.getBoundingClientRect().height
      if(currentHeight !== initialHeight){
        clearInterval(loopToCheckChartDidLoad);
        resetDateComponents ()
      }
      if (timeCount === 20) {
        //* END LOOP AND EXICUTE AFTER TIME LIMIT EXPIRES
        clearInterval(loopToCheckChartDidLoad);
        resetDateComponents ()
      }
      timeCount++
    }, 100);
    const SHADOW_DIM = 16
    chartCanvas.style.boxShadow = `${SHADOW_DIM}px ${SHADOW_DIM}px ${SHADOW_DIM}px rgba(0,0,0,.3)`
    chartCanvas.style.backgroundColor = 'white'
    chartCanvas.style.borderRadius = '0px'
  }

  let newDateRangeContainer, setRangeLabel, timeSpanText, timeSpanEditIsActive = false

  refreshChart()
  let showPrimary = true,
    showSecondary = true,
    showTertiary = true

  return {
    get dateRange() {
      return dateArray
    },
    setData: (inputs) => {
      const {
        primaryData,
        secondaryData,
        tertiaryData,
        labels
      } = inputs
      if (primaryData) chartJSInstance.data.datasets[0].data = primaryData
      if (secondaryData) chartJSInstance.data.datasets[1].data = secondaryData
      if (tertiaryData) chartJSInstance.data.datasets[2].data = tertiaryData
      if (labels) chartJSInstance.data.labels = formatDates(labels)
      chartJSInstance.update()
      if (labels) { 
        dateArray = labels
      }
    },

    destroy: () => {
      if (newDateRangeContainer) newDateRangeContainer.remove()

      if (beginDateComponent) beginDateComponent.delete()
      if (endDateComponent) endDateComponent.delete()
      chartCanvas.remove()
      dateArray = null
    },
    exicuteChartResize,

    toggleShowPrimary: (ON_OFF = null) => { 
      if (ON_OFF === null) showPrimary = 1 - showPrimary
      else showPrimary = ON_OFF + 0
      chartJSInstance.getDatasetMeta(0).hidden = showPrimary ? false : true;
      chartJSInstance.update()
      return showPrimary ? true : false
    },

    toggleShowSecondary: (ON_OFF = null) => {
      if (ON_OFF === null) showSecondary = 1 - showSecondary
      else showSecondary = ON_OFF + 0
      chartJSInstance.getDatasetMeta(1).hidden = showSecondary ? false : true;
      chartJSInstance.update()
      return showSecondary ? true : false
    },

    toggleShowTertiary: (ON_OFF = null) => {
      if (ON_OFF === null) showTertiary = 1 - showTertiary
      else showTertiary = ON_OFF + 0
      chartJSInstance.getDatasetMeta(2).hidden = showTertiary ? false : true;
      chartJSInstance.update()
      return showTertiary ? true : false
    },

  }
}

function addDateMarker(inputs){ 
  const {
    parentContiner, 
    textContent =`Feb-23-2020`,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderTopRightRadius,
    borderTopLeftRadius,
  } = inputs
  const TICK_MARK_OFFSET = 46
  
  const container = document.createElement('div')
  parentContiner.append(container)
  container.style.width = 'auto'

  const textElement = document.createElement('div')
  let height = 13
  container.append(textElement)
  textElement.style.pointerEvents = 'none'
  textElement.textContent = textContent 
  textElement.style.border = 'none'
  textElement.style.paddingLeft = '2px'
  textElement.style.paddingRight = '2px'
  textElement.style.fontSize = 'x-small'
  container.style.pointerEvents = 'none'

  if(borderBottomLeftRadius)textElement.style.borderBottomLeftRadius = borderBottomLeftRadius + 'px'
  if(borderBottomRightRadius)textElement.style.borderBottomRightRadius = borderBottomRightRadius + 'px'
  if(borderTopLeftRadius)textElement.style.borderTopLeftRadius = borderTopLeftRadius + 'px'
  if(borderTopRightRadius)textElement.style.borderTopRightRadius = borderTopRightRadius + 'px'

  textElement.style.backgroundColor = 'rgba(255,255,255,1)'
  textElement.style.textAlign = 'right'
  textElement.style.display = 'inline'
  textElement.style.whiteSpace = 'nowrap'
  container.style.width = '58px'
  container.style.minWidth = '58px'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', 8);
  svg.setAttribute('height', 20);

  svg.style.pointerEvents= 'auto'

  function MakeLine(obj) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    for (let prop in obj) {
      line.setAttribute(prop, obj[prop])
    }
    svg.append(line);
    container.append(svg)
    return line
  }

  let highlightLine = null
  let line = MakeLine({
    'x1': 0,
    'y1': 0,
    'x2': 0,
    'y2': height,
    'stroke': 'red',
    'stroke-width': 3
  })
  const parentContinerHeight = parentContiner.getBoundingClientRect().height
  parentContiner.style.height = parentContinerHeight + 'px'
  svg.style.marginLeft = '50px'
  container.style.position = 'absolute'

  return {
    textElement,
    container,
    svg,
    line,
    set height(newHeight = 0){
      height = newHeight
      line.remove()
      line = MakeLine({
        'x1': 3,
        'y1': 0,
        'x2': 3,
        'y2': height,
        'stroke': 'black',
        'stroke-width': 1,
        'stroke-dasharray':"4,4",
      })
      svg.append(line)
      const move = height + 16
      svg.style.transform = `translatey(-${move}px )`
      svg.setAttribute('height', height)
    },
    get height(){
      return height
    },
    get x(){
      const textElementOffset = container.getBoundingClientRect().x - chartCanvas.getBoundingClientRect().x
      return textElementOffset + TICK_MARK_OFFSET + 8
    },
    addEventListener : (kind,func)=>{ 
      svg.addEventListener(kind,func)
    },
    delete:()=>{
      container.remove()
    },
    showHighlightLine : ()=>{ 
      if(highlightLine)return
      highlightLine = MakeLine({
        'x1': 3,
        'y1': 0,
        'x2': 3,
        'y2': height,
        'stroke': 'rgba(255,9,0,0.3)',
        'stroke-width': 4,
      })
      highlightLine.style.pointerEvents = 'none'
    },
    hideHighlightLine : ()=>{ 
      if(highlightLine) highlightLine.remove()
      highlightLine = null
    },
    show: ()=>{
      container.hidden = false
    },
    hide: ()=>{
      container.hidden = true
    },
  }
}