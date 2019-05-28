import React from "react";
import {Chart} from "react-google-charts"
import "./stylesheet.css"
import Button from "@material-ui/core/Button"
import 'date-fns';
import TextField from "@material-ui/core/TextField" 
import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
class StockForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      stockInputValue: "",
      dayInputValue: "",
      startDateInputValue: null,
      endDateInputValue: null

    }
  }
  handleStockInputChange = event => {
    this.setState({
      stockInputValue: event.target.value.toUpperCase().trim(),
    })
  }
  handleDayInputChange = event => {
    this.setState({
      dayInputValue: event.target.value,
    }) 
  }
  handleStartDateInputChange = event => {
    // console.log(event)
    // console.log(event.target)
    // console.log(event.target.value)
    this.setState({
      startDateInputValue: event,
    })
  }
  handleEndDateInputChange = event => {
    this.setState({
      endDateInputValue: event,
    })
  }
  
  
  
  handleFormSubmit = event => {
    event.preventDefault()
    const stock = this.state.stockInputValue
    const day = this.state.dayInputValue
    console.log(this.state.startDateInputValue)
    const startDate = this.state.startDateInputValue
    const endDate = this.state.endDateInputValue
    if(stock === ""){
      alert("Please enter a stock name")
    } else if(startDate == null || endDate == null){
      alert("Please enter 2 valid dates")
    } else if(startDate>endDate){
      alert("Make sure end date is after start date")
    }else{
      this.props.getStockInformation(stock, day, startDate, endDate)
    }
  }
  render(){
    return(
      <form>
        {/* <TextField type="number"/> */}
        <TextField margin="normal" label="Stock Name" type="text" name="stock-input" value={this.state.stockInputValue} onChange={this.handleStockInputChange}></TextField>
        <TextField margin="normal" label="X-Day Average" type="number" name="day-input" value={this.state.dayInputValue} onChange={this.handleDayInputChange}></TextField>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          // type="date"
          margin="normal"
          label="Start Date"
          value={this.state.startDateInputValue}
          onChange={this.handleStartDateInputChange}
        />

        <KeyboardDatePicker
          margin="normal"
          label="End Date"
          value={this.state.endDateInputValue}
          onChange={this.handleEndDateInputChange}
        />
        {/* </MuiPickersUtilsProvider> */}
        </MuiPickersUtilsProvider>
        {/* <TextField type="date" name="start-date-input" value={this.state.startDateInputValue} onChange={this.handleStartDateInputChange}></TextField> */}
        {/* <TextField type="date" name="end-date-input" value={this.state.endDateInputValue} onChange={this.handleEndDateInputChange}></TextField> */}

        {/* <input type="submit" value="Get Stock Data" onClick={this.handleFormSubmit}></input> */}
        <Button type="submit" variant="contained" color="primary" onClick={this.handleFormSubmit}>
      Submit
    </Button>
      </form>
    )
  }
}
class ChartDisplay extends React.Component{
  render(){
    if(!this.props.data){
        return null
    } 
    // console.log(this.props.data)
    // console.log([["Age", "Weight"], [1,2], [2,4]])
    return(
      
      <div id="chart-div">
        <Chart
          chartType="Line"
          data={this.props.data}
          width="100%"
          height="400px"
          legendToggle
          loader={<div>Loading Chart</div>}
          options={{
            chart: {
              title: this.props.title,
            },
            animation: {
              duration: 1000,
              easing: 'out',
              startup: true,
            },
          //   animation: {
          //     startup: true,
          //     easing: 'linear',
          //     duration: 1500,
            }}
          // }
        />
      </div>
    )
  }
}
class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      stocks: [],
      stockData: ""
    }
  }
  getStockInformation = (stock, day, startDate, endDate) => {
    // stock = "HD"
    // console.log(process.env)
    fetch("https://www.quandl.com/api/v3/datasets/EOD/"+stock+"?column_index=4&start_date=" + startDate + "&end_date="+endDate+"&api_key=" + process.env.REACT_APP_QUANDL_API_KEY)
    .then(response => response.json())
    .then(responseAsJson => {
      // console.log(responseAsJson.dataset)
      // console.log(responseAsJson.dataset.data)
      // console.log(responseAsJson.dataset.data.length)
      if(responseAsJson.dataset.data.length === 0 || responseAsJson.dataset.data.length===1){
        alert("Not enough data for this stock and date range combo")
        return
      }
      // console.log(responseAsJson.dataset.data)
      // let data = [["Date", "Price"]]
      let data = responseAsJson.dataset.data
      data = data.reverse()
      // const day = 5;
      data.unshift(["Date", "Price", day+"-Day-Moving-Average"])
      
      // for(let i = day; i<)
      // data[2]
      // data[0][2] = null
      data.forEach((element, index) => {
        if(index === 0){

        } else if (index<day){
          data[index][2] = null
        } else{
          let avg = 0
          for(let i = 0; i<day; i++){
            avg+=data[index-i][1]
          }
          avg /= day
          data[index][2] = avg
        }
      })
      // data[1][2] = 2
      // data[2][2] = 180
      // data[3][2] = 190
      // data[4][2] = 180
      // console.log(responseAsJson.dataset)
      // data = [["Date", "Price", "5-Day-MA"], ["12-12-1999", 182, 190], ["12-12-2010", 189, 140]]
      this.setState({
        stockData: data,
        chartTitle: responseAsJson.dataset.name
      })
      // responseAsJson.dataset.data
    })
    .catch((error) => {
      // console.log("Can't view that stock")
      alert("Can't view that stock, may be invalid or not availble")
      this.setState({
        stockData: "",
      })
    }
    )
  }
  render(){
    return (
      <div className="App">
        <StockForm getStockInformation={this.getStockInformation}/>
        <ChartDisplay data = {this.state.stockData} title = {this.state.chartTitle}/>
      </div>
    );
  }
}


export default App;
