//**------------------------------------- */
//** ETF PERFORMANCE BACK TEST MODEL      */
//**------------------------------------- */

/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */

const {log} = console
let socket = io() //background: linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%);

//TODO RENAME "secondary" TO "benchmarkETF"
//TODO RENAME "primary" TO "leveragedETF"
//TODO RENAME "cashWeighted" TO "partInvested"

function getStandardDeviation (closing) {
  const arrayAverage = arr => arr.reduce((sum, x) => sum + x, 0) / arr.length
  const mean = arrayAverage(closing)
  const differences = closing.map(x => x - mean).map(x => x * x)
  const varience = arrayAverage(differences)
  const standardDeviation = Math.sqrt(varience)
  return standardDeviation
}

function getCAGR (beginValue,endValue,yearsHeld){
  return Math.pow(endValue / beginValue , 1 / yearsHeld) - 1
}

function getTimeSpanInDays (date1, date2) {
  const dt1 = new Date(date1);
  const dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}

function getTimeSpanInYears (date1, date2) {
  return  Math.round(  (getTimeSpanInDays (date1, date2) / 365) * 100 ) / 100
}

export const ETFBackTestModel = function (inputs) {
  let {
    primarySymbol,
    secondarySymbol,
    onFetchingDataCompleted = () => {log('onFetchingDataCompleted')},
    cashRatio = 0.5
  } = inputs

  let beginWeeklyIndex = null, endWeeklyIndex = null
  let weeklyIndices //, dateRangeIndices = null
  let dayEndingIndexToWeekIndex  // EXAMPLE: {DAY-INDEX : WEEK-ENDING-INDEX}

  function setWeeklyIndices(data = rawData[primarySymbol]) {
    dayEndingIndexToWeekIndex = {}
    let previousEndOfWeekday = new Date(data[0].date).getDay() + 1
    let previousDay = previousEndOfWeekday
    const endOfWeekdayDataIndices = new Set()
    data.forEach((marketDay, thisMarketDayIndex) => {
      if (thisMarketDayIndex === 0) return
      const thisDayOfTheWeek = new Date(marketDay.date).getDay() + 1
      const newWeekJustStarted = previousDay > thisDayOfTheWeek
      if (newWeekJustStarted) {
        //* NOW RECORD PREVIOUS DAY AS END OF WEEK DAY
        endOfWeekdayDataIndices.add(thisMarketDayIndex - 1)
        dayEndingIndexToWeekIndex[thisMarketDayIndex - 1] = endOfWeekdayDataIndices.size - 1
      }
      previousDay = thisDayOfTheWeek
    })
    //* ADD MOST RECENT DAY
    const lastDay = data.length - 1
    endOfWeekdayDataIndices.add(lastDay)
    dayEndingIndexToWeekIndex[lastDay] = endOfWeekdayDataIndices.size - 1
    weeklyIndices = [...endOfWeekdayDataIndices]
  }

  const rawData = {}
  function fetchDataFromYahooFinance(tickerSymbol) {
    //TODO: refactor
    socket = io.connect()
    socket.emit('fetchHistoricalData', tickerSymbol)
    socket.on('returnHistoricalData', function (data) { 
      rawData[tickerSymbol] = data
      const fetchingIsComplete = Object.keys(rawData).length === 2
      if(fetchingIsComplete){
        alignDates()
        setWeeklyIndices()
        onFetchingDataCompleted()
      }
    })
  }

  function alignDates (){ 
    if(Object.keys(rawData).length < 2) return
    const primaryDataLength = rawData[primarySymbol].length 
    const secondaryDataLength = rawData[secondarySymbol].length
    const primaryIsLongest = primaryDataLength > secondaryDataLength
    const secondaryIsLongest = primaryDataLength < secondaryDataLength
    if(primaryIsLongest){
      let diff = primaryDataLength - secondaryDataLength
      while (diff) {
        rawData[primarySymbol].shift()
        diff--
      }
    }
    if(secondaryIsLongest){
      let diff = secondaryDataLength - primaryDataLength 
      while (diff) {
        rawData[secondarySymbol].shift()
        diff--
      }
    }
  }

  fetchDataFromYahooFinance(primarySymbol)
  fetchDataFromYahooFinance(secondarySymbol)

  function getWeeklyIndexFromDateString(dateString){
    let foundIndex
    weeklyIndices.forEach(index => {
      const thisDateString = rawData[primarySymbol][index].date.split('T')[0]
      if (thisDateString === dateString) foundIndex = index
    })
    return dayEndingIndexToWeekIndex[foundIndex]
  }

  function getMarkToMarketPnLPercentage(principal, markValue ){
    const num = (markValue / principal) - 1
    return Math.round( num * 100 + Number.EPSILON )
  }

  function setPriceTracker(closingPrice, priceTracker){ //log('setPriceTracker')
    if(closingPrice < priceTracker.lowestPrice)priceTracker.lowestPrice = closingPrice
    if(!priceTracker.currentHighPrice){ 
      //* INITIALIZE FIRST
      priceTracker.currentHighPrice = closingPrice
      return
    }
    if(closingPrice > priceTracker.currentHighPrice){ 
      //* IF NEW HIGH HAS BEEN MADE 
      priceTracker.currentHighPrice = closingPrice
      return
    }
    const thisDist =  priceTracker.currentHighPrice - closingPrice
    if(thisDist > priceTracker.maxDrawdown){
      priceTracker.maxDrawdown = thisDist
      priceTracker.highPriceFromLargestDrawdown = priceTracker.currentHighPrice
      priceTracker.lowPriceFromLargestDrawdown = closingPrice
    }
  }

  let primaryPriceTracker = {
    maxDrawdown: null, highPriceFromLargestDrawdown: null, lowPriceFromLargestDrawdown: null, currentHighPrice: null , lowestPrice : 1
  }
  
  let secondaryPriceTracker = {
    maxDrawdown: null, highPriceFromLargestDrawdown: null, lowPriceFromLargestDrawdown: null, currentHighPrice: null , lowestPrice : 1
  }

  let cashWeightedPriceTracker = {
    maxDrawdown: null, highPriceFromLargestDrawdown: null, lowPriceFromLargestDrawdown: null, currentHighPrice: null , lowestPrice : 1
  }

  let previousBeginWeeklyIndex = null
  let previousEndWeeklyIndex = null

  return {
    get primarySymbol (){
      return primarySymbol
    },
    get secondarySymbol (){
      return secondarySymbol
    },
    primaryRawData: rawData[primarySymbol],
    secondaryRawData : rawData[secondarySymbol],

    get principal (){
      const firstDayIndex = beginWeeklyIndex ? beginWeeklyIndex : 0
      return rawData[primarySymbol][weeklyIndices[firstDayIndex]].close
    },

    get primaryTotalReturn (){
      const arr = this.primaryWeeklyClosingPrices
      return arr[arr.length - 1]
    },

    get secondaryTotalReturn (){
      const arr = this.secondaryWeeklyClosingPrices
      return arr[arr.length - 1]
    },

    get cashWeightedTotalReturn (){ //cashWeightedWeeklyClosingPrices
      const arr = this.cashWeightedWeeklyClosingPrices
      return Math.round(arr[arr.length - 1] * 100) / 100
    },

    get primaryAnnualizedReturn (){
      const dayCount = getTimeSpanInDays (this.firstDate, this.lastDate)
      const yearsHeld = dayCount / 365
      const endValue = this.primaryTotalReturn + 100
      const beginValue = 100
      return getCAGR(beginValue,endValue,yearsHeld)
    },

    get secondaryAnnualizedReturn (){
      const dayCount = getTimeSpanInDays (this.firstDate, this.lastDate)
      const yearsHeld = dayCount / 365
      const endValue = this.secondaryTotalReturn + 100
      const beginValue = 100
      return getCAGR(beginValue,endValue,yearsHeld)
    
    },

    get cashWeightedAnnualizedReturn (){
      const dayCount = getTimeSpanInDays (this.firstDate, this.lastDate)
      const yearsHeld = dayCount / 365
      const endValue = this.cashWeightedTotalReturn + 100
      const beginValue = 100
      return getCAGR(beginValue,endValue,yearsHeld)
    },

    get arrayOfWeeklyIndices (){
      const beginPeriod = beginWeeklyIndex ? beginWeeklyIndex : 0
      const endPeriod = endWeeklyIndex ? endWeeklyIndex : weeklyIndices.length - 1
      return weeklyIndices.filter((x,index)=>index >= beginPeriod && index <= endPeriod)
    },

    get primaryWeeklyClosingPrices (){
      const principal = this.principal
      return this.arrayOfWeeklyIndices.map(i => getMarkToMarketPnLPercentage(principal,rawData[primarySymbol][i].close))
    },

    get secondaryWeeklyClosingPrices (){
      const firstDayIndex = this.arrayOfWeeklyIndices[0]
      const thisFirstDayClosing = rawData[secondarySymbol][firstDayIndex].close
      return this.arrayOfWeeklyIndices.map(i=>getMarkToMarketPnLPercentage (thisFirstDayClosing, rawData[secondarySymbol][i].close))
    },


    get dateList (){
      return this.arrayOfWeeklyIndices.map(i=>rawData[primarySymbol][i].date.split('T')[0])
    },

    get firstDate(){
      const firstDayIndex = this.arrayOfWeeklyIndices[0]
      return rawData[secondarySymbol][firstDayIndex].date.split('T')[0]
    },

    get lastDate(){
      const arrayOfWeeklyIndices = this.arrayOfWeeklyIndices
      const lastDayIndex = arrayOfWeeklyIndices[arrayOfWeeklyIndices.length - 1]
      return rawData[secondarySymbol][lastDayIndex].date.split('T')[0]
    },

    get timeSpan (){
      return {
        years: getTimeSpanInYears(this.firstDate,this.lastDate )
      }
    },

    get durationInDays (){
      return this.dateList.length * 7
    },

    get cashWeightedWeeklyClosingPrices(){
      return this.primaryWeeklyClosingPrices.map(price => price * (1 - this.investmentRatio))
    },

    /**
     * @param {number} weeklyIndex
     */

    set beginWeeklyIndex(weeklyIndex){ 
      beginWeeklyIndex = Math.max(weeklyIndex , 0)
    },
    /**
     * @param {number} weeklyIndex
     */
    set endWeeklyIndex(weeklyIndex){
      endWeeklyIndex = Math.min(weeklyIndex , weeklyIndices.length - 1)
    },

    /**
     *  @param {boolean} dateString
     */
    set beginDateSetToBegining (toHistoricalWeeklyFirstDay = true){
      if(toHistoricalWeeklyFirstDay){
        previousBeginWeeklyIndex = beginWeeklyIndex
        beginWeeklyIndex = weeklyIndices[0]
      } else if (previousBeginWeeklyIndex) {
        beginWeeklyIndex = previousBeginWeeklyIndex
      } 
    },

      /**
     *  @param {boolean} dateString
     */
    set endDateSetToPresentDay (toHistoricalWeeklyLastDay = true){
      if(toHistoricalWeeklyLastDay){
        previousEndWeeklyIndex = endWeeklyIndex
        endWeeklyIndex = weeklyIndices[weeklyIndices.length - 1]
      } else if (previousEndWeeklyIndex) {
        endWeeklyIndex = previousEndWeeklyIndex
      } 
    },

    /**
     * @param {any} dateString
     */
    set beginWeeklyDateString(dateString){
      beginWeeklyIndex = getWeeklyIndexFromDateString(dateString, this.dateList)
    },

    /**
     * @param {any} dateString
     */
    set endWeeklyDateString(dateString){ 
      endWeeklyIndex = getWeeklyIndexFromDateString(dateString, this.dateList)
      this.primaryWeeklyClosingPrices.forEach(closingPrice =>{
        setPriceTracker(closingPrice, primaryPriceTracker)
      })
      this.secondaryWeeklyClosingPrices.forEach(closingPrice =>{
        setPriceTracker(closingPrice, secondaryPriceTracker)
      })
      this.cashWeightedWeeklyClosingPrices.forEach(closingPrice =>{
        setPriceTracker(closingPrice, cashWeightedPriceTracker)
      })
    },

    get primaryPriceTracker (){
      return primaryPriceTracker
    },

    get primaryMaxDrawdown () {
      if(!primaryPriceTracker.maxDrawdown){
        this.primaryWeeklyClosingPrices.forEach(closingPrice =>{
          setPriceTracker(closingPrice, primaryPriceTracker)
        })
      }
      const high = primaryPriceTracker.highPriceFromLargestDrawdown
      const low = primaryPriceTracker.lowPriceFromLargestDrawdown
      const delta = high - low 
      const full = high + 100
      const result =   delta / full
      return result
    },

    get primaryMaxDrawdownOnPrincipal () { 
      return (primaryPriceTracker.lowestPrice * -1) / 100 
    },
    get secondaryMaxDrawdownOnPrincipal () { //secondaryMaxDrawdownOnPrincipal
      return (secondaryPriceTracker.lowestPrice * -1) / 100 
    },

    get secondaryMaxDrawdown () {
      if(!secondaryPriceTracker.maxDrawdown){
        this.secondaryWeeklyClosingPrices.forEach(closingPrice =>{
          setPriceTracker(closingPrice, secondaryPriceTracker)
        })
      }
      const high = secondaryPriceTracker.highPriceFromLargestDrawdown
      const low = secondaryPriceTracker.lowPriceFromLargestDrawdown
      const delta = high - low 
      const full = high + 100
      const result =   delta / full
      return result
    },

    get cashWeightedMaxDrawdown () {
      cashWeightedPriceTracker = {
        maxDrawdown: null, highPriceFromLargestDrawdown: null, lowPriceFromLargestDrawdown: null, currentHighPrice: null , lowestPrice : 1
      }
      this.cashWeightedWeeklyClosingPrices.forEach(closingPrice =>{
        setPriceTracker(closingPrice, cashWeightedPriceTracker)
      })
      const high = cashWeightedPriceTracker.highPriceFromLargestDrawdown
      const low = cashWeightedPriceTracker.lowPriceFromLargestDrawdown
      const delta = high - low 
      const full = high + 100
      const result =   delta / full
      return result
    },

    get cashWeightedMaxDrawdownOnPrincipal () { 
      return (cashWeightedPriceTracker.lowestPrice * -1) / 100 
    },

    get primaryDailyClosing(){
      const weeklyIndices = this.arrayOfWeeklyIndices
      const firstDayIndex = weeklyIndices[0]
      const lastDayIndex = weeklyIndices[weeklyIndices.length - 1]
      return rawData[primarySymbol].filter((x,i)=> i >= firstDayIndex && i <= lastDayIndex).map(x=> x.close)
    },

    get primaryAnnualizedVolatility (){
      return (getStandardDeviation(this.primaryDailyClosing) * Math.sqrt(252)) / 100
    },

    get primarySharpeRatio (){
      const averageAnnualReturns = this.primaryAnnualizedReturn * 100
      return (averageAnnualReturns - 2) / this.primaryAnnualizedVolatility
    },

    get secondaryAnnualizedVolatility (){
      return (getStandardDeviation(this.secondaryDailyClosing) * Math.sqrt(252)) / 100
    },

    get secondarySharpeRatio (){
      const averageAnnualReturns = this.secondaryAnnualizedReturn * 100
      return (averageAnnualReturns - 2) / this.secondaryAnnualizedVolatility
    },

    get secondaryDailyClosing(){
      const weeklyIndices = this.arrayOfWeeklyIndices
      const firstDayIndex = weeklyIndices[0]
      const lastDayIndex = weeklyIndices[weeklyIndices.length - 1]
      return rawData[secondarySymbol].filter((x,i)=> i >= firstDayIndex && i <= lastDayIndex).map(x=> x.close)
    },


    get cashWeightedDailyClosing(){
      const weeklyIndices = this.arrayOfWeeklyIndices
      const firstDayIndex = weeklyIndices[0]
      const lastDayIndex = weeklyIndices[weeklyIndices.length - 1]

      return rawData[primarySymbol].filter((x,i)=> i >= firstDayIndex && i <= lastDayIndex).map(x=> x.close).map(price => price * (1 - this.investmentRatio))
    },

    get cashWeightedAnnualizedVolatility (){
      return (getStandardDeviation(this.cashWeightedDailyClosing) * Math.sqrt(252)) / 100
    },


    get cashWeightedSharpeRatio (){
      const averageAnnualReturns = this.cashWeightedAnnualizedReturn * 100
      return (averageAnnualReturns - 2) / this.cashWeightedAnnualizedVolatility
    },

    set cashRatio (num){
      cashRatio = num
    },

    get cashRatio (){
      return cashRatio 
    },

    get investmentRatio(){
      return 1 - this.cashRatio
    }
  }
}






