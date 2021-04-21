//**----------------------------- */
//** WORK SPACE / CONROLLER       */
//**----------------------------- */

/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */

import { ETFBackTestModel } from './model.js'
import { makeChart } from './chartDisplay.js'
import { chartColorPalette } from './chartDisplay.js'

const {log} = console

const DEVELOPER_MODE = false


//** GLOBALLY ACCESSABLE FUNCTIONS */
window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};



//** COORDINATE COLORS OF ELEMENTS WITH THOSE USED IN CHART */
const {PRIMARY_COLOR_RGB,SECONDARY_COLOR_RGB , TERTIARY_COLOR_RGB} = chartColorPalette

const primaryElements = document.getElementsByClassName('primary')
for (let index = 0; index < primaryElements.length; index++) {
  const element = primaryElements[index];
  element.style.backgroundColor = `rgba(${PRIMARY_COLOR_RGB},1)`
  element.style.borderColor = `rgba(${PRIMARY_COLOR_RGB},1)`
}

const secondaryElements = document.getElementsByClassName('secondary')
for (let index = 0; index < secondaryElements.length; index++) {
  const element = secondaryElements[index];
  element.style.backgroundColor = `rgba(${SECONDARY_COLOR_RGB},1)`
  element.style.borderColor = `rgba(${SECONDARY_COLOR_RGB},1)`
}

const tertiaryElements = document.getElementsByClassName('tertiary')
for (let index = 0; index < tertiaryElements.length; index++) {
  const element = tertiaryElements[index];
  element.style.backgroundColor = `rgba(${TERTIARY_COLOR_RGB},1)`
  element.style.borderColor = `rgba(${TERTIARY_COLOR_RGB},1)`
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function convertFloatToPercentageString(num){
  const numStr = numberWithCommas(Math.round(num * 10000) / 100)
  return numStr + '%'
}

function objectToString (object){
  const key = Object.keys(object)[0]
  return key +  ': ' + object[key]
}

let chartAssembly
let backTestModel

function createETFReview(pairString = etfList.value) {
  if(DEVELOPER_MODE)return
  const stringToArray = pairString.split('|')
  const leveragedETF = stringToArray[0]
  const nonLeveragedETF = stringToArray[1]
  tableContainer.hidden = true
  spinner.style.display = 'flex'
  spinner.hidden = false

  if(chartAssembly){
    window.removeEventListener('resize',chartAssembly.exicuteChartResize)
    chartAssembly.destroy()
    chartAssembly = null
  }
  backTestModel = ETFBackTestModel({
    primarySymbol: leveragedETF,
    secondarySymbol: nonLeveragedETF,
    onFetchingDataCompleted: () => {
      chartAssembly = makeChart({
        primaryName: backTestModel.primarySymbol,
        primaryData: backTestModel.primaryWeeklyClosingPrices,
        secondaryName: backTestModel.secondarySymbol,
        secondaryData: backTestModel.secondaryWeeklyClosingPrices,
        tertiaryName: '50:50',
        tertiaryData: backTestModel.cashWeightedWeeklyClosingPrices,
        labels: backTestModel.dateList,
        onPressSetDateRangeButton: (dateStringArray) => { 
          backTestModel.beginWeeklyDateString = dateStringArray[0]
          backTestModel.endWeeklyDateString = dateStringArray[1]
          chartAssembly.setData({
            primaryData : backTestModel.primaryWeeklyClosingPrices,
            secondaryData : backTestModel.secondaryWeeklyClosingPrices,
            tertiaryData : backTestModel.cashWeightedWeeklyClosingPrices,
            labels : backTestModel.dateList
          })
          coordinateTableCellsWithModel()
          resetTimelineButton.disabled = false
          tableHeadingTimeline.textContent = objectToString(backTestModel.timeSpan)
        },
        exicuteChartResize : ()=>{ 
          //* FUNCTION TO RESIZE CHART BASED ON LAYOUT
          const bottom = tableContainer.getBoundingClientRect().y + table1.getBoundingClientRect().height
          const rootContainerbottom = container.getBoundingClientRect().height + container.getBoundingClientRect().y
          const ChartJSContainerHeight  = chartJSContainer.getBoundingClientRect().height
          const gap = rootContainerbottom - bottom
          const chartHeightMinimum  = 120
          chartJSContainer.style.height = Math.max(chartHeightMinimum, ChartJSContainerHeight + gap) + 'px'
        }
      })

      function coordinateTableCellsWithModel() {
        tableHeading.innerHTML = `Performance from <u>${backTestModel.dateList[0]}</u> to <u>${backTestModel.dateList[backTestModel.dateList.length - 1]}</u>`

        primarySymbol.textContent = backTestModel.primarySymbol
        primaryTotalReturn.textContent = numberWithCommas(backTestModel.primaryTotalReturn) + '%'
        primaryAnnualizedReturn.textContent = convertFloatToPercentageString(backTestModel.primaryAnnualizedReturn)
        primaryMaxDrawdown.textContent = convertFloatToPercentageString(backTestModel.primaryMaxDrawdown)
        primaryMaxDrawdownOnPrincipal.textContent = convertFloatToPercentageString(backTestModel.primaryMaxDrawdownOnPrincipal)
        primarySharpeRatio.textContent = backTestModel.primarySharpeRatio.toFixed(2)

        secondarySymbol.textContent = backTestModel.secondarySymbol

// const btn = document.createElement('button')
// btn.textContent = 'btm'
// // btn.appendChild
// secondarySymbol.appendChild(secondarySymbol)
// log(secondarySymbol)

        secondaryTotalReturn.textContent = numberWithCommas(backTestModel.secondaryTotalReturn) + '%'
        secondaryAnnualizedReturn.textContent = convertFloatToPercentageString(backTestModel.secondaryAnnualizedReturn)
        secondaryMaxDrawdown.textContent = convertFloatToPercentageString(backTestModel.secondaryMaxDrawdown)
        secondaryMaxDrawdownOnPrincipal.textContent = convertFloatToPercentageString(backTestModel.secondaryMaxDrawdownOnPrincipal)
        secondarySharpeRatio.textContent = backTestModel.secondarySharpeRatio.toFixed(2)
        cashRatio.value = backTestModel.cashRatio * 100

        tertiaryTotalReturn.textContent = numberWithCommas(backTestModel.cashWeightedTotalReturn) + '%'
        tertiaryAnnualizedReturn.textContent = convertFloatToPercentageString(backTestModel.cashWeightedAnnualizedReturn)
        tertiaryMaxDrawdown.textContent = convertFloatToPercentageString(backTestModel.cashWeightedMaxDrawdown)
        tertiaryMaxDrawdownPrincipal.textContent = convertFloatToPercentageString(backTestModel.cashWeightedMaxDrawdownOnPrincipal)
        tertiarySharpeRatio.textContent = backTestModel.cashWeightedSharpeRatio.toFixed(2)
      }

      resetTimelineButton.addEventListener('click',()=>{ 
        backTestModel.beginDateSetToBegining = true
        backTestModel.endDateSetToPresentDay = true
        chartAssembly.setData({
          primaryData : backTestModel.primaryWeeklyClosingPrices,
          secondaryData : backTestModel.secondaryWeeklyClosingPrices,
          tertiaryData : backTestModel.cashWeightedWeeklyClosingPrices,
          labels : backTestModel.dateList
        })
        coordinateTableCellsWithModel()
        resetTimelineButton.disabled = true
        tableHeadingTimeline.textContent = objectToString(backTestModel.timeSpan)
      })

      tableContainer.hidden = false
      spinner.style.display = 'none'
      spinner.hidden = true
      coordinateTableCellsWithModel()

      tableHeadingTimeline.textContent = objectToString(backTestModel.timeSpan)
      window.addEventListener('resize',chartAssembly.exicuteChartResize)
      chartAssembly.exicuteChartResize()
    }
  })

  tertiarySymbol.textContent = `${leveragedETF}`

  cashRatioText.textContent = 100 - (backTestModel.cashRatio * 100) + '%'
  investmentRatioText.textContent = (backTestModel.cashRatio * 100) + '%'
}

createETFReview()

etfList.addEventListener('change',()=>{createETFReview()})

cashRatio.addEventListener('input',()=>{
  backTestModel.cashRatio = Number(cashRatio.value) / 100
  investmentRatioText.textContent = cashRatio.value + '%'
  cashRatioText.textContent = 100 - Number(cashRatio.value) + '%'
  chartAssembly.setData({
    tertiaryData : backTestModel.cashWeightedWeeklyClosingPrices,
  })
  tertiaryTotalReturn.textContent = backTestModel.cashWeightedTotalReturn + '%'
  tertiaryAnnualizedReturn.textContent = convertFloatToPercentageString(backTestModel.cashWeightedAnnualizedReturn)
  tertiaryMaxDrawdown.textContent = convertFloatToPercentageString(backTestModel.cashWeightedMaxDrawdown)
  tertiaryMaxDrawdownPrincipal.textContent = convertFloatToPercentageString(backTestModel.cashWeightedMaxDrawdownOnPrincipal)
  tertiarySharpeRatio.textContent = backTestModel.cashWeightedSharpeRatio.toFixed(2)
})



function primaryToggleFunction(){ 
  const isOn = chartAssembly.toggleShowPrimary()
  toggleCoordinateStyle(primaryToggleLabelContainer, isOn, 'primaryCell')
}
// log(primaryToggle)
primaryToggle.addEventListener('click', primaryToggleFunction)
primarySymbol.addEventListener('click', primaryToggleFunction)



function secondaryToggleFunction(){
  const isOn = chartAssembly.toggleShowSecondary()
  toggleCoordinateStyle(secondaryToggleLabelContainer, isOn, 'secondaryCell')
}
secondaryToggle.addEventListener('click',secondaryToggleFunction)
secondarySymbol.addEventListener('click', secondaryToggleFunction)

function tertiaryToggleFunction(){
  const isOn = chartAssembly.toggleShowTertiary()
  toggleCoordinateStyle(tertiaryToggleLabelContainer, isOn , 'tertiaryCell')
  toggleCoordinateStyle(tertiarySliderContainer, isOn)
  cashRatio.disabled = isOn ? false : true
  cashRatio.style.opacity = isOn ? 1 : 0.3
}
tertiaryToggle.addEventListener('click',tertiaryToggleFunction)
tertiarySymbol.addEventListener('click', tertiaryToggleFunction)


function toggleCoordinateStyle (container, isOn, cellClass){
  const grayBackground = 'rgba(190,190,190,.7)'
  //* MAKE RECORD OF BACKGROUND COLOR IF NOT DONE
  if(!container.toggleOnBackgroundColor)container.toggleOnBackgroundColor = container.style.backgroundColor
  //* SET BACKGROUND COLOR
  container.style.backgroundColor = isOn ? container.toggleOnBackgroundColor : grayBackground
  //* SET TEXT COLOR
  container.style.color = isOn ? 'white' : container.toggleOnBackgroundColor//'light-gray'
  // * SET TOGGLE COLOR
  const toggleElement = container.children[0]
  if(cellClass){
    
    const cells = document.getElementsByClassName(cellClass)
    for (let index = 0; index < cells.length; index++) {
      const element = cells[index];
      element.style.backgroundColor = isOn ? 'white' : grayBackground
    
    }
  }

  if(toggleElement.tagName !== 'DIV')return
  toggleElement.style.backgroundColor = isOn ? 'white' : container.toggleOnBackgroundColor
}

