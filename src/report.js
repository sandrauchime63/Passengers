const { getTrips } = require('api');
const { getDriver } = require('api');
const { getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  // Your code goes here
  try{
    const allTripsInformation = await getTrips();

console.log(allTripsInformation)
    let output = []
    let driverTrips = {}
    let driverEarnings = {}
    let allCashTrips = []
    let allNonCashTrips = []
    
    //fetching all drivers id
    let allDriversID = []
    for(let i = 0; i < allTripsInformation.length; i++){
      let trip = allTripsInformation[i]
      allDriversID.push(trip.driverID);
      typeof trip.billedAmount === "string" ? trip.billedAmount = Number(trip.billedAmount.split(',').join('')) : trip.billedAmount = trip.billedAmount;

      driverTrips.hasOwnProperty(trip.driverID) ? driverTrips[trip.driverID]++ :driverTrips[trip.driverID] = 1;
      driverEarnings.hasOwnProperty(trip.driverID) ? driverEarnings[trip.driverID] += trip.billedAmount: driverEarnings[trip.driverID] = trip.billedAmount;
      
      //to separate cash trips from noncash trips
      trip.isCash === true ? allCashTrips.push(trip) : allNonCashTrips.push(trip);
    }
    const allDriversIDs = [...new Set(allDriversID)]

    //fetching all drivers info
    let driversInfo = []
    for(let i=0; i<allDriversIDs.length; i++){
      driversInfo.push(getDriver(allDriversIDs[i]))
    }
    driversInfo = await Promise.allSettled(driversInfo)
    driversInfo.pop()
    let driverNoOfTrips = Object.values(driverTrips)
    let driverTotalEarnings = Object.values(driverEarnings)
    
    //final output
    for(let i = 0; i < driversInfo.length; i++){
      output[i]={
        "fullName": driversInfo[i].value.name,
        "id": allDriversIDs[i],
        "phone": driversInfo[i].value.phone,
        "noOfTrips": driverNoOfTrips[i],
        "noOfVehicles": driversInfo[i].value.vehicleID.length,
        "vehicles": [],
        "noOfCashTrips": 0,
        "noOfNonCashTrips": 0,
        "totalAmountEarned": Number(driverTotalEarnings[i].toFixed(2)),
        "totalCashAmount": 0,
        "totalNonCashAmount": 0,
        "trips": []
      }
      //to get the driver vehicles
      for(let j=0; j < driversInfo[i].value.vehicleID.length; j++){
        output[i].vehicles.push(await getVehicle(driversInfo[i].value.vehicleID[j]))

      }
      //to get all other output values
      for(let j =0; j < allTripsInformation.length; j++){
        //To get trip information of each driver
        if(allDriversIDs[i]===allTripsInformation[j].driverID){
          output[i].trips.push({
            "user": allTripsInformation[j].user.name,
            "created": allTripsInformation[j].created,
            "pickup": allTripsInformation[j].pickup.address,
            "destination": allTripsInformation[j].destination.address,
            "billed": allTripsInformation[j].billedAmount,
            "isCash": allTripsInformation[j].isCash
          })
        }
        if(allDriversIDs[i]===allTripsInformation[j].driverID && allTripsInformation[j].isCash === true){
          output[i].noOfCashTrips++
          output[i].totalCashAmount+=allTripsInformation[j].billedAmount
        }
        if(allDriversIDs[i]===allTripsInformation[j].driverID && allTripsInformation[j].isCash === false){
          output[i].noOfNonCashTrips++
          output[i].totalNonCashAmount+=allTripsInformation[j].billedAmount
        }
      }
    }
   console.log(output)
    return output
  }catch(err){
    console.log(err.message)
  }
}
driverReport()

module.exports = driverReport;