//**----------------------------- */
//** MAIN VIEW                    */
//**----------------------------- */

/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */
const {log} = console

const CHART_LEFT_SIDE_OFFSET = 45
const CHART_TOP_SIDE_OFFSET = 30
const CHART_BOTTOM_SIDE_OFFSET = 50
const CHART_RIGHT_SIDE_OFFSET = 8
const RIGHT_MOUSE_BUTTON_CLICK = 2
const DRAW_CHART_BOUNDRY = false
const CHART_CANVAS_HEIGHT_EXTENTION = 15

const PRIMARY_COLOR_RGB = '0, 100, 130', SECONDARY_COLOR_RGB = '200, 0, 0', TERTIARY_COLOR_RGB = '60, 99, 57'
export const chartColorPalette = {PRIMARY_COLOR_RGB, SECONDARY_COLOR_RGB, TERTIARY_COLOR_RGB }

Chart.defaults.global.elements.point.pointStyle = 'dash'
Chart.defaults.global.defaultFontSize = 8

export function makeChart(inputs){
  const {
    primaryName,
    primaryData,
    secondaryName,
    secondaryData,
    tertiaryName,
    tertiaryData,
    labels,
    rootContainer = container, //document.body,
    onPressSetDateRangeButton = ()=>{},
    exicuteChartResize = ()=>{log('exicuteChartResize')},
  } = inputs

  let chartCanvas  = document.createElement('canvas')
  chartJSContainer.appendChild(chartCanvas)
  chartCanvas.id = 'chartCanvas'

  let ctx = chartCanvas.getContext('2d')
  
  let mouseIsPressedOnChart = false
  let overlayCanvas
  let highlightRangeX = {}
  let dateRangeIndecies = {first:null,second:null}
  let dateArray
  let chartJSInstance
  
  //* DEFINE CHART MOUSE/TOUCH MOUSE DOWN EVENT FUNCTION
  const beginUserSelectRange = (e)=>{ 
    const clientX = function(){
      if(e.touches)return e.touches[0].clientX
      return e.clientX
    }()
    const clientY = function(){
      if(e.touches)return e.touches[0].clientY
      return e.clientY
    }()
    if(e.button === RIGHT_MOUSE_BUTTON_CLICK) {
      hideOverlay()
      return
    }
    if(setNewDateRangeButton)setNewDateRangeButton.hidden = true
    mouseIsPressedOnChart = false
    const box = chartCanvas.getBoundingClientRect()
    const pointIsWithinChartFame = getPointIsWithinChartFrame(
      Math.max(Math.round(clientX - box.x),0), 
      Math.max(Math.round(clientY - box.y),0)
    )
    if(!pointIsWithinChartFame)return 
  
    highlightRangeX = {}
    mouseIsPressedOnChart = true
    highlightRangeX = {firstPoint : showOverlay(clientX)}
    return
  }
  chartCanvas.addEventListener('mousedown',beginUserSelectRange)
  chartCanvas.addEventListener('touchstart', beginUserSelectRange)
  //*                                                     */

  //* ..... MOVE EVENT FUNCTION
  const userDragSelectRange  = (e)=>{ 
    if(!mouseIsPressedOnChart)return
    const clientX = function(){
      if(e.touches)return e.touches[0].clientX
      return e.clientX
    }()
    highlightRangeX.secondPoint = showOverlay(clientX)
    corrdinateDateTagsWithHighlightRange()
  }
  chartCanvas.addEventListener('mousemove',userDragSelectRange)
  chartCanvas.addEventListener('touchmove', userDragSelectRange);
  //*                                                     */

  //* END EVENT FUNCTION
  const endUserSelectRange = (e)=>{ 
    mouseIsPressedOnChart = false
    corrdinateDateTagsWithHighlightRange()
    if(!highlightRangeX.secondPoint)hideOverlay()
    if(Math.abs(highlightRangeX.secondPoint - highlightRangeX.firstPoint) < 10)hideOverlay()
  }
  chartCanvas.addEventListener('mouseup', endUserSelectRange)
  chartCanvas.addEventListener('touchend', endUserSelectRange)
  //*                                                     */
  
  rootContainer.addEventListener('mouseup',(e)=>{ 
    mouseIsPressedOnChart = false
    if(!setNewDateRangeButton)return
    if(setNewDateRangeButton.hidden)return
    setsetNewDateRangeButton()
  })

  function getPointIsWithinChartFrame(x,y){
    const chartAreaBox = getChartAreaBox2()
    if(x < chartAreaBox.left) return false
    if(x > chartAreaBox.right) return false
    if(y < chartAreaBox.top) return false
    if(y > chartAreaBox.bottom) return false
    return true
  }

  function getChartAreaBox2(){
    const chartCanvasBox = chartCanvas.getBoundingClientRect()
    return {
      left: CHART_LEFT_SIDE_OFFSET,
      right : chartCanvasBox.width - CHART_RIGHT_SIDE_OFFSET,
      top : CHART_TOP_SIDE_OFFSET,
      bottom : chartCanvasBox.height - CHART_BOTTOM_SIDE_OFFSET
    }
  }

  function refreshOverlayCanvasSize(){
    const chartCanvasBox = chartCanvas.getBoundingClientRect()
    overlayCanvas.width = chartCanvasBox.width
    overlayCanvas.height = chartCanvasBox.height + CHART_CANVAS_HEIGHT_EXTENTION
  }

  function refreshOverlayCanvas(){
    if(!chartCanvas)return
    const chartCanvasBox = chartCanvas.getBoundingClientRect()
    if(!overlayCanvas){
      overlayCanvas = document.createElement('canvas')
      chartContainer.insertBefore(overlayCanvas, bottomFillStrip)
      overlayCanvas.style.pointerEvents = 'none'
      overlayCanvas.style.marginBottom = '0'
    }
    overlayCanvas.hidden = false
    overlayCanvas.style.marginTop  = (chartCanvasBox.height * -1) + 'px'
    refreshOverlayCanvasSize()
  }

  function truncateDates (dateArray){ 
    return dateArray.map(dateString=>{
      const strArr = dateString.split('-')
      return strArr[1] + '-' + strArr[2]
    })
  }

  function refreshChart() {
    dateArray = labels
    chartJSInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: truncateDates(labels),
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
        responsive : true,
        maintainAspectRatio : false,
        layout: {
          padding: {
            left: 5,
            right: 10,
            top: 0,
            bottom: 3
          }
        },

        scales: {
          yAxes: [{
            ticks: {
              callback: function(value,index,values){
                const prefix = value === 0 ? '----' : ''
                return prefix + value + '%'
              },
            }
          }]
        }
      }
    })
    chartCanvas.style.boxShadow = "8px 8px 8px rgba(0,0,0,.3)"
    chartCanvas.style.backgroundColor = 'white'
    chartCanvas.style.borderRadius = '10px'
  }
 
  function showOverlay(clientX){ 
    overlayCanvas.hidden = false
    if(setNewDateRangeButton && highlightRangeX.secondPoint)setNewDateRangeButton.hidden = false
    if(firstRangeTag) firstRangeTag.hidden = false
    if(secondRangeTag) secondRangeTag.hidden = false
    const chartCanvasBox = chartCanvas.getBoundingClientRect()
    refreshOverlayCanvas()
    const ctx = overlayCanvas.getContext('2d')
    ctx.setLineDash([2, 2])
    ctx.lineWidth = 1
    ctx.beginPath()
    const rangeX = {
      low: CHART_LEFT_SIDE_OFFSET,
      high: overlayCanvas.width - CHART_RIGHT_SIDE_OFFSET
    }

    const x = Math.min( Math.max(clientX - chartCanvasBox.x, rangeX.low), rangeX.high)
    ctx.moveTo(x, 0)
    ctx.lineTo(x, overlayCanvas.height)
    ctx.stroke()

    if(highlightRangeX.firstPoint){
      ctx.moveTo(highlightRangeX.firstPoint, 0)
      ctx.lineTo(highlightRangeX.firstPoint, overlayCanvas.height)
      ctx.stroke()
    }

    if(DRAW_CHART_BOUNDRY) {
      //* DRAW LEFT CHART BOUNDRY
      ctx.moveTo(CHART_LEFT_SIDE_OFFSET, 0)
      ctx.lineTo(CHART_LEFT_SIDE_OFFSET, overlayCanvas.height)
      ctx.stroke()
      //* DRAW RIGHT CHART BOUNDRY
      ctx.moveTo(overlayCanvas.width - CHART_RIGHT_SIDE_OFFSET, 0)
      ctx.lineTo(overlayCanvas.width - CHART_RIGHT_SIDE_OFFSET, overlayCanvas.height)
      ctx.stroke()
      //* DRAW TOP CHART BOUNDRY
      ctx.moveTo(0, CHART_TOP_SIDE_OFFSET)
      ctx.lineTo(overlayCanvas.width, CHART_TOP_SIDE_OFFSET)
      ctx.stroke()
      //* DRAW BOTTOM CHART BOUNDRY
      ctx.moveTo(0, overlayCanvas.height - CHART_BOTTOM_SIDE_OFFSET)
      ctx.lineTo(overlayCanvas.width,  overlayCanvas.height - CHART_BOTTOM_SIDE_OFFSET)
      ctx.stroke()
    }

    if(!highlightRangeX)return x
    ctx.fillStyle = 'rgba(200,0,0,.1)'
    ctx.fillRect(
      highlightRangeX.firstPoint,
      CHART_TOP_SIDE_OFFSET,
      x - highlightRangeX.firstPoint,
      overlayCanvas.height - CHART_BOTTOM_SIDE_OFFSET - CHART_TOP_SIDE_OFFSET
    )
    showRange ()


    bottomFillStrip.style.marginTop = '-20px'
    return x
  }

  function hideOverlay(){
    if(overlayCanvas) overlayCanvas.hidden = true
    if(setNewDateRangeButton)setNewDateRangeButton.hidden = true
    if(firstRangeTag)firstRangeTag.hidden = true
    if(secondRangeTag)secondRangeTag.hidden = true
    bottomFillStrip.style.marginTop = '0'
  }

  let firstRangeTag, secondRangeTag
  let setNewDateRangeButton
  
  function showRange (){ 
    function makeTag(){
      const tag = document.createElement('text')
      chartContainer.insertBefore(tag,bottomFillStrip)
      tag.style.position = 'absolute'
      tag.style.border = 'solid'
      tag.style.pointerEvents = 'none'
      tag.textContent = 'Jan 12, 2016'
      tag.style.border = 'none'
      tag.style.fontFamily = 'Arial, Helvetica, sans-serif'
      tag.style.fontSize = 'x-small'
      tag.style.fontWeight = 'bold'
      tag.style.padding = '2px'
      tag.style.backgroundColor = 'rgba(255,255,255,.4)'
      return tag
    }

    const parentContainerOffsetX = bottomFillStrip.parentElement.getBoundingClientRect().x

    if(!firstRangeTag)firstRangeTag = makeTag()
      else firstRangeTag.hidden = false

    firstRangeTag.style.left = (highlightRangeX.firstPoint - firstRangeTag.getBoundingClientRect().width + parentContainerOffsetX) + 'px'

    if(!secondRangeTag)secondRangeTag = makeTag()
      else secondRangeTag.hidden = false

    secondRangeTag.style.left = (highlightRangeX.secondPoint - secondRangeTag.getBoundingClientRect().width + parentContainerOffsetX) + 'px'
    if(!setNewDateRangeButton){
      setNewDateRangeButton = document.createElement('button')
      chartContainer.insertBefore(setNewDateRangeButton,bottomFillStrip)
      setNewDateRangeButton.style.position = 'absolute'
      setNewDateRangeButton.textContent= 'SET'
      setNewDateRangeButton.style.height = '2.5em'
      setNewDateRangeButton.style.fontFamily = 'Arial, Helvetica, sans-serif'
      setNewDateRangeButton.style.fontSize = 'xx-small'
      setNewDateRangeButton.style.border = 'none'
      setNewDateRangeButton.style.backgroundColor = 'blue'
      setNewDateRangeButton.style.opacity = 0.5
      setNewDateRangeButton.style.color = 'white'
      setNewDateRangeButton.style.marginTop = -1 * setNewDateRangeButton.getBoundingClientRect().height +  'px'
      setNewDateRangeButton.addEventListener('click',()=>{
        const first = Math.min(dateRangeIndecies.first,dateRangeIndecies.second)
        const last = Math.max(dateRangeIndecies.first,dateRangeIndecies.second)
        const firstDay = dateArray[first]
        const lastDay = dateArray[last]
        onPressSetDateRangeButton([firstDay , lastDay])
        hideOverlay()
      })
    }
    setsetNewDateRangeButton ()
  }

  function setsetNewDateRangeButton (){ 
    const parentContainerOffsetX = bottomFillStrip.parentElement.getBoundingClientRect().x
    const rangeWidth = Math.abs(highlightRangeX.firstPoint - highlightRangeX.secondPoint)
    const X1 = Math.min(highlightRangeX.firstPoint, highlightRangeX.secondPoint)
    setNewDateRangeButton.style.left = (X1 + parentContainerOffsetX) + 'px'
    setNewDateRangeButton.style.width = rangeWidth + 'px'
  }
  
  function corrdinateDateTagsWithHighlightRange(){

    function getTimeSpanInDays (date1, date2) {
      const dt1 = new Date(date1);
      const dt2 = new Date(date2);
      return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
    }
    
    function getTimeSpanInYears (date1, date2) {
      return  Math.abs( Math.round(  (getTimeSpanInDays (date1, date2) / 365) * 100 ) / 100)
    }

    const chartWidth = chartCanvas.getBoundingClientRect().width - CHART_LEFT_SIDE_OFFSET - CHART_RIGHT_SIDE_OFFSET
    const firstRatio = (highlightRangeX.firstPoint - CHART_LEFT_SIDE_OFFSET )/ chartWidth
    dateRangeIndecies.first = Math.round(firstRatio * dateArray.length)
    const firstDateString = dateArray[dateRangeIndecies.first]
    if(firstRangeTag)firstRangeTag.textContent = firstDateString + '➞'
    const secondRatio = (highlightRangeX.secondPoint - CHART_LEFT_SIDE_OFFSET )/ chartWidth
    dateRangeIndecies.second = Math.round(secondRatio * (dateArray.length - 1))
    const secondDateString = dateArray[dateRangeIndecies.second]
    if(secondRangeTag)secondRangeTag.textContent = secondDateString + '➞'

    const timeSpan = getTimeSpanInYears(firstDateString,secondDateString) + '\r\nYears'
    setNewDateRangeButton.textContent = timeSpan
  }

  refreshChart()
  refreshOverlayCanvas()
  hideOverlay()

  return {
    get dateRange(){
      return dateArray
    },
    setData : ( inputs )=>{
      const {
        primaryData,
        secondaryData,
        tertiaryData,
        labels
      } = inputs

      if(primaryData)chartJSInstance.data.datasets[0].data = primaryData
      if(secondaryData)chartJSInstance.data.datasets[1].data = secondaryData
      if(tertiaryData)chartJSInstance.data.datasets[2].data = tertiaryData
      if(labels) chartJSInstance.data.labels = truncateDates(labels)

      chartJSInstance.update()
      if(labels) dateArray = labels
    },

    destroy : ()=>{
      if(setNewDateRangeButton)setNewDateRangeButton.remove()
      if(secondRangeTag)secondRangeTag.remove()
      if(firstRangeTag)firstRangeTag.remove()
      if(overlayCanvas)overlayCanvas.remove()
      chartCanvas.remove()
      dateArray = null
    },
    exicuteChartResize

  }
}
