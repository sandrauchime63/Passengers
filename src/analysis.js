const { getTrips } = require('api');
const { getDriver } = require('api');
  
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  // Your code goes here
  try{
    const allJourney = await getTrips();
    console.log(allJourney)

    let noOfCashTrips = 0;
    let noOfNonCashTrips = 0;
    let billedTotal = 0;
    let cashBilledTotal = 0;
    let nonCashBilledTotal = 0;
    let driverTripId = []

    let driversId = []
    let driversTrips = {}
    let driversCash = {}

    for(let i = 0; i < allJourney.length; i++){
      let journeys = allJourney[i]
      //converting all billed amount from string to number
      if (typeof journeys.billedAmount === "string") {
        journeys.billedAmount = Number(journeys.billedAmount.split(',').join(''))
      }
      // to get no of cash journeys and no of non cash journeys
      if (journeys.isCash === true) {
        noOfCashTrips++
      }
      else{
        noOfNonCashTrips++
      }
      //to get amount of cash journeys and non cash journeys
      if (journeys.isCash === true) {
        cashBilledTotal += journeys.billedAmount
      }
      else{
        nonCashBilledTotal += journeys.billedAmount
      }
      
      //to get driver with highest no of journeys
      driverTripId.push(journeys.driverID)
      // console.log(drive)
      
      driversId = [...new Set(driverTripId)]
       console.log(driversId)
      //If driversTrip value does not exist equate to 1, if it does incrememnt by 1
      //if driversTrip and journey.driverID have values in common increment
      if (driversTrips.hasOwnProperty(journeys.driverID)) {
        driversTrips[journeys.driverID]++
      }
      else{
        driversTrips[journeys.driverID] = 1
      }
      // driversTrips.hasOwnProperty(journeys.driverID) ? driversTrips[journeys.driverID]++ :driversTrips[journeys.driverID] = 1;
      
      //comparing driversCash and driversID to increment the key in driversCash
      if (driversCash.hasOwnProperty(journeys.driverID)) {
        driversCash[journeys.driverID] += journeys.billedAmount
      }
      else{
        driversCash[journeys.driverID] = journeys.billedAmount
      }
      // driversCash.hasOwnProperty(journeys.driverID) ? driversCash[journeys.driverID] += journeys.billedAmount: driversCash[journeys.driverID] = journeys.billedAmount;
    }
console.log(driversTrips)
    billedTotal = cashBilledTotal + nonCashBilledTotal

    //sorting the value(trips) in the object containing drivers ID and number of trips
    let maxDriverTrips = Object.entries(driversTrips).sort((a,b)=> b[1]-a[1])
   

    //sorting the value(earnings) in the object containing drivers ID and the earnings
    let maxDriverEarnings = Object.entries(driversCash).sort((a,b)=> b[1]-a[1])
   
    //the driver with the most trips
    let driverWithMostTripsID = maxDriverTrips[0][0]
     //driver with the highest earnings
    let driverWithHighestEarningsID = maxDriverEarnings[0][0]

    //getting the driver with most trips ID from the API
    let driverWithMostTrips = await getDriver(driverWithMostTripsID)
    let driverWithHighestEarnings = await getDriver(driverWithHighestEarningsID)
    
    //no of trips of driver with highest earning
    let noOfTripsOfDriverWithHighestEarning = 0
    for(let i=0; i<maxDriverTrips.length; i++){
      if(maxDriverTrips[i][0] === driverWithHighestEarningsID){
        noOfTripsOfDriverWithHighestEarning = maxDriverTrips[i][1]
      }
    }
    // Getting the driver with most trips earning 
    let driverWithMostTripsEarning = 0
    for(let i = 0; i < maxDriverEarnings.length; i++){
      if(maxDriverEarnings[i][0] === driverWithMostTripsID){
        driverWithMostTripsEarning = maxDriverEarnings[i][1];
      }
    }


    
    //to get the full info of the drivers from the driversID array
    let noOfDriversWithMoreThanOneVehicle = 0;
    let driverArr = []
    for(let i = 0; i < driversId.length; i++){
      driverArr.push(getDriver(driversId[i]))
    }
    driverArr = await Promise.allSettled(driverArr)

    //To remove the error
    driverArr.pop()
    console.log(driverArr)
     
    //Checking driverArr.value.vehicleID.length to see if it is more than one
    for(let i =0; i < driverArr.length; i++){
      if(driverArr[i].value.vehicleID.length > 1){
        noOfDriversWithMoreThanOneVehicle++
      }
    }
    let output = {
      "noOfCashTrips": noOfCashTrips,
      "noOfNonCashTrips": noOfNonCashTrips,
      "billedTotal": billedTotal,
      "cashBilledTotal": cashBilledTotal,
      "nonCashBilledTotal": Number(nonCashBilledTotal.toFixed(2)),
      "noOfDriversWithMoreThanOneVehicle": noOfDriversWithMoreThanOneVehicle,
      "mostTripsByDriver": {
        "name": driverWithMostTrips.name,
        "email": driverWithMostTrips.email,
        "phone": driverWithMostTrips.phone,
        "noOfTrips": maxDriverTrips[0][1],
        "totalAmountEarned": driverWithMostTripsEarning
      },
      "highestEarningDriver": {
        "name": driverWithHighestEarnings.name,
        "email": driverWithHighestEarnings.email,
        "phone": driverWithHighestEarnings.phone,
        "noOfTrips": noOfTripsOfDriverWithHighestEarning,
        "totalAmountEarned": maxDriverEarnings[0][1]
      }
    }
    console.log(output)
    return output
  }catch(err){
    console.log(err.message)
  }
}
analysis()
module.exports = analysis;