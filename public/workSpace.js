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

//** COORDINATE COLORS OF ELEMENTS WITH THOSE USED IN CHART */
const {PRIMARY_COLOR_RGB,SECONDARY_COLOR_RGB , TERTIARY_COLOR_RGB} = chartColorPalette

const primaryElements = document.getElementsByClassName('primary')
for (let index = 0; index < primaryElements.length; index++) {
  const element = primaryElements[index];
  element.style.backgroundColor = `rgba(${PRIMARY_COLOR_RGB},1)`
}

const secondaryElements = document.getElementsByClassName('secondary')
for (let index = 0; index < secondaryElements.length; index++) {
  const element = secondaryElements[index];
  element.style.backgroundColor = `rgba(${SECONDARY_COLOR_RGB},1)`
}

const tertiaryElements = document.getElementsByClassName('tertiary')
for (let index = 0; index < tertiaryElements.length; index++) {
  const element = tertiaryElements[index];
  element.style.backgroundColor = `rgba(${TERTIARY_COLOR_RGB},1)`
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

