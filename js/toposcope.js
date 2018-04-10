// =========================================================
//
// ENG1003 S2 2017 Assignment 1 Toposcope app
//
// Team: 78
// Authors: Matthew Williams, Paul Papadopoulous, Viseshta 
// Chandra, Teresa Li
//
// This file creates a toposcope (compass) with a series of
// needles that show the bearing and relative length from
// the user to a location of interest. The compass face
// spins as the user turns the phone, and the distances
// are calculated via accessing the phone's GPS sensor.
//
// =========================================================


// Create locations of interest and place them into an array
var locationsOfInterest = [{title: "Luna Park", lat: -37.867688, long: 144.976888},
                           {title: "Box Hill Hospital", lat: -37.814157, long: 145.117663},
                           {title: "Flinders Street Station", lat: -37.818271, long: 144.967094},
                           {title: "Mount Dandenong", lat: -37.827171, long: 145.352950},
                           {title: "Melbourne Airport", lat: -37.669304, long: 144.844509}];

// Variable to store the location of the user
// Initialised to undefined in case location cannot be found
var userLocation = {lat: undefined, long: undefined};

// Variable to store the location of the user
// Initialised to undefined in case heading cannot be found
var userHeading = undefined;

// Variables to store the bearings to locations and relative lengths for needles
var bearings, needleLengths;

/*
updateDisplay()
This function draws/redraws the compass, lines and distances for locations
of interest. This function should be called each time a new GPS location
or new bearing is receieved for the user.

preconditions:
    User location and heading must be found to fully draw every part of compass
    An element with id = "compassCanvas" must exist on the page
    
postconditions:
    A compass will be drawn with NESW values, lines and distances for each
    location of interest
*/
function updateDisplay() {
    var canvas = document.getElementById("compassCanvas");
    var context = canvas.getContext("2d");
    var radius = canvas.height / 2;
    var bearing;

    // Clear the canvas.
    context.clearRect(-radius, -radius, canvas.width, canvas.height);

    // Use reduced radius for actual drawing.
    radius = radius * 0.80;

    // Draw compass face and add "NESW" values
    drawCompassFace(context, radius);
    drawLetter(context, radius, 0-userHeading, 'N');
    drawLetter(context, radius, 90-userHeading, 'E');
    drawLetter(context, radius, 180-userHeading, 'S');
    drawLetter(context, radius, 270-userHeading, 'w');
    
    // Update the lengths of the needles to prepare to draw
    updateNeedleLengths();
    
    // Update the bearings to locations to prepare to draw
    updateBearings();
    
    // If user location and heading have been found,
    // draw needles to each of the locations
    if (userLocation.lat !== undefined && userLocation.long !== undefined && userHeading !== undefined){
        for (var i = 0; i<locationsOfInterest.length; i++){
            drawNeedle(context, bearings[i]-userHeading, 0, radius*needleLengths[i], 4, distinquishableColour(i+1));
        }
    }

    // Update list of locations. See function below.
    updateLocationDistances();
}

/*
updateNeedleLengths()
Calculates the relative lengths of each needle compared to the 
maximum distance of all the locations of interest and stores these
lengths in needleLengths

preconditions:
    user location must be found
    
postconditions:
    needleLengths will contain the relative lengths of each location
    compared to the maximum distance
*/
function updateNeedleLengths(){
    needleLengths = [];
    var distances = [];
    // Get distances for each spot
    for (var i = 0; i<locationsOfInterest.length; i++){
        var distance = calculateDistance(userLocation.lat, userLocation.long,
                                    locationsOfInterest[i].lat,
                                    locationsOfInterest[i].long);
        distances.push(distance);
    }
    
    // Find max distance of all locations
    var max = distances[0];
    for (i = 1; i < distances.length; i++){
        if (distances[i] > max){
            max = distances[i];
        }
    }
    
    // Calculate and place all relative lengths into needleLengths
    for (i = 0; i < distances.length; i++){
        needleLengths.push(distances[i]/max);
    }
}

/*
updateBearings()
Updates the bearings from the user to each location of interest
then stores these values in bearings.

preconditions:
    user location must be found
    
postconditions:
    stores values of bearings to each location in bearings
*/
function updateBearings(){
    bearings = [];
    for (var i = 0; i<locationsOfInterest.length; i++){
        // Get the bearing for a location
        bearing = getBearing(userLocation.lat, userLocation.long, 
                             locationsOfInterest[i].lat,
                             locationsOfInterest[i].long);
        bearings.push(bearing);
    }
}

/*
This function will update the list of locations displayed by the app.
It should be called each time there are updated distance estimations to
the locations of interest.

preconditions:
    user location must be found
    
postconditions:
    Location list will be updated

See the following functions defined in toposcopeview.js:
    updateLocationList
    distinquishableColour
*/
function updateLocationDistances() {
    // Variable to store cells to update location list with
    var listCellContents = [];
    
    // Loop through places in locationsOfInterest to generate all distances
    // and store these in listCellContents
    for (var i = 0; i<locationsOfInterest.length; i++){
        var distance = calculateDistance(userLocation.lat, userLocation.long,
                                    locationsOfInterest[i].lat,
                                    locationsOfInterest[i].long);
        var rounded = distance.toFixed(2);
        var addCell = {label: locationsOfInterest[i].title, labelColour: distinquishableColour(i+1), detailLabel: "Distance: " + rounded + " km"};
        listCellContents.push(addCell);
    }
    
    // Update the location list to display in table
    updateLocationList(listCellContents);
}

/*
calculateDistance(lat1, lon1, lat2, lon2)
This function calculates the distance between two geographical locations

The code used in this function is courtesy of Chris Veness 
(http://www.movable-type.co.uk/scripts/latlong.html)

argument: lat1: the latitude value of the first point
argument: lon1: the longitude value of the first point
argument: lat2: the latitude value of the second point
argument: lon2: the longitude value of the secnod point

preconditions:
    two points must exist on the planet
    
postconditions:
    distance between the two points will be calculated
    
returns:
    distance: the distance between the two points
*/
function calculateDistance(lat1, lon1, lat2, lon2){
    // If user location is undefined, don't calculate a distance
    if(lat1 === undefined || lon1 === undefined){
        return 0;
    }
    // Otherwise, calculate the distance between
    // the user and the location
    else{
        var R = 6371e3; // Radius of the Earth in metres
        var theta1 = lat1.toRadians();
        var theta2 = lat2.toRadians();
        var deltaTheta = (lat2-lat1).toRadians();
        var deltaLamda = (lon2-lon1).toRadians();

        var a = Math.sin(deltaTheta/2) * Math.sin(deltaTheta/2) +
                Math.cos(theta1) * Math.cos(theta2) *
                Math.sin(deltaLamda/2) * Math.sin(deltaLamda/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c;
        
        // Divide by 1000 to give result in kilometres
        return distance/1000;
    }
}

/*
getBearing(startLat, startLng, endLat, endLng)
This function calculates the bearing from one point to another
via the two points' latitude and longitude. The bearing is an
initial bearing from point start to point end.

The code used in this function is courtesy of Chris Veness 
(http://www.movable-type.co.uk/scripts/latlong.html)

argument: startLat: the latitude value of the start point
argument: startLng: the longitude value of the start point
argument: endLat: the latitude value of the end point
argument: endLng: the longitude value of the end point

preconditions:
    two points must exist
    
postconditions:
    initial bearing will be calculated from start point to end point
    
returns:
    brng: the value of the initial bearing
*/
function getBearing(startLat, startLng, endLat, endLng){
    var y = Math.sin(endLng-startLng) * Math.cos(endLat);
    var x = Math.cos(startLat)*Math.sin(endLat) - Math.sin(startLat)*Math.cos(endLat)*Math.cos(endLng-startLng);
    var brng = Math.atan2(y, x);
    brng = brng * (180.0 / Math.PI);
    brng = (brng + 360) % 360;
    return brng;
}

// =========================================================
// INITIALISE GEOLOCATION OF USER
// =========================================================

/*
geoFind()
Alerts the user that their location is not yet reliable and
initialises the watching of a user's geolocation. This function
will begin the app's GPS location services with callbacks to
either geoSuccess or geoError based on the position being watched

preconditions:
    None
    
postconditions:
    Begins watching user position, with callbacks to either
    geoSuccess or geoError as position changes
*/
function geoFind(){
    // Alert the user and begin watching geolocation
    alert("Finding location, results will not yet be accurate");
    var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError);
}

/*
geoSuccess(position)
Stores latitude and longitude into userLocation based on the coordinates
received from the geolocation watchPosition. The function takes an
argument of position which contains the coordinates, and continuously
updates the location of the user since the position is being watched.
On the first call of this function, the user will be notified their
position has been found, and subsequent calls will be run in the background
without notifying the user. The function then calls updateLocationDistances
and updateDisplay to continuously update the app when the user moves.

argument: position: position from geolocation that contains coordinates of the user

preconditions:
    the user's location must have been successfully found
    
postconditions:
    the user's latitude and longitude will be stored in userLocation
    updateLocationDistances and updateDisplay will run
*/
function geoSuccess(position){
    
    // If first update, alert user results are found
    if (userLocation.lat === undefined || userLocation.long === undefined){
        userLocation.lat = position.coords.latitude;
        userLocation.long = position.coords.longitude;
        updateLocationDistances();
        updateDisplay();
        displayMessage("Location and distances found", 3000);
    }
    
    // Otherwise, update in background
    else{
        userLocation.lat = position.coords.latitude;
        userLocation.long = position.coords.longitude;
        updateLocationDistances();
        updateDisplay();
    }
}

/*
geoError(err)
Error function for when user location can't be found, or
geolocation API returns an error

argument: err: error from watchPosition

preconditions:
    a geolocation must be attempted to be found
    
postconditions:
    the user will receive an alert to the geolocation error
*/
function geoError(err){
    alert("No position available");
}

// Begin finding geographical location
geoFind();

// =========================================================
// INITIALISE ORIENTATION OF USER
// =========================================================

/*
Check if deviceOrientationEvent exists and add listeners for
deviceOrientationUpdate and compassNeedsCalibrationEvent
*/
// TODO: have option for no orientationevent
if (window.DeviceOrientationEvent){
        window.addEventListener('deviceorientation', deviceOrientationUpdate);
        window.addEventListener('compassneedscalibration', compassNeedsCalibrationEvent);
    }
/*
If no deviceOrientationEvent, call GPSHeading() once a second to
update the user's heading
*/
else{
    // Initialise start location for bearing calculation
    var previousLocation = userLocation;
    var GPSHeadingTimer = setInterval(GPSHeading(previousLocation), 1000);
}

/*
deviceOrientationUpdate(e)
This function uses the sensors of a device to find the orientation of it
via a deviceOrientationEvent. This orientation is stored in the value of
userHeading, and then a call is made to re=draw the compass via updateDisplay
any time the user's heading changes

argument: e: deviceOrientationEvent to get values from

preconditions: 
    a deviceOrientationEvent must exist and be reported
    the device must have a sensor capable of returning values for the event
    
postconditions:
    the value of userHeading will be updated and the
    updateDisplay function will be called to re-draw the compass
*/
function deviceOrientationUpdate(e){
    
    // Check if absolute value is true
    if (e.absolute){
            // Check that alpha value is not being given as undefined
            if (e.alpha !== undefined){
                userHeading = 360 - e.alpha;
            }
        }
    
    // If using iOS, use webkit for compass heading
    else if (e.webkitCompassHeading != undefined){
                userHeading = e.webkitCompassHeading;
            }
    
    // Update the display with the new heading
    updateDisplay();
}
    
/*
compassNeedsCalibrationEvent()
This function alerts the user that their compass is in need of 
calibration. It produces a toast message for 5 seconds to do so

preconditions: 
    a deviceOrientationEvent must exist and be reported

postconditions:
    a toast message will be displayed for 5 seconds
*/
function compassNeedsCalibrationEvent(){
    displayMessage("Compass needs calibration. Move your phone in a figure-eight pattern.", 5000);
}

/*
GPSHeading(previousLocation)
Using the geolocation coordinates, calculate the heading of the user
from their initial position (previousLocation) to their current
position (userLocation) via a call to getBearing()
The function finally calls updateDisplay() to use the new heading in drawing
the compass

The code used in this function is derived from the ideas of Chris Veness 
(http://www.movable-type.co.uk/scripts/latlong.html)

argument: previousLocation: the initial latitude and longitude of the
user

preconditions:
    the user's location must have been found initially
    the user must be in a different location to their initial position
    
postconditions:
    calculates the bearing a user is facing and stores it in userHeading
*/
function GPSHeading(previousLocation){
    // Calculate the bearing using previousLocation and userLocation
    var GPSHeading = getBearing(previousLocation.lat, previousLocation.long, 
                             userLocation.lat, userLocation.long);
    userHeading = 360 - GPSHeading;
    
    // Update the display with the new heading
    updateDisplay();
}