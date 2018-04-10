/*
 *
 * ENG1003 S2 2017 Assignment 1 Toposcope app
 *
 * Copyright (c) 2017  Monash University
 *
 * Written by Jonny Low, Leslie Hughes, Michael Wybrow and Tian Goh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
*/


// Extend Number object with method to convert from degrees to radians.
if (Number.prototype.toRadians === undefined)
{
    Number.prototype.toRadians = function() {
        return this * Math.PI / 180;
    };
}

// Extend Number object with method to convert from radians to (signed) degrees.
if (Number.prototype.toDegrees === undefined)
{
    Number.prototype.toDegrees = function() {
        return this * 180 / Math.PI;
    };
}

// This function displays the given message String as a "toast" message at
// the bottom of the screen.  It will be displayed for 2 second, or if the
// number of milliseconds given by the timeout argument if specified.
function displayMessage(message, timeout)
{
    if (timeout === undefined)
    {
        // Timeout argument not specifed, use default.
        timeout = 2000;
    }

    if (typeof(message) == 'number')
    {
        // If argument is a number, convert to a string.
        message = message.toString();
    }

    if (typeof(message) != 'string')
    {
        console.log("displayMessage: Argument is not a string.");
        return;
    }

    if (message.length == 0)
    {
        console.log("displayMessage: Given an empty string.");
        return;
    }

    var snackbarContainer = document.getElementById('toast');
    var data = {
        message: message,
        timeout: timeout
    };
    if (snackbarContainer && snackbarContainer.hasOwnProperty("MaterialSnackbar"))
    {
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
}


// Given a number, this function returns an HTML color, where colours
// returned have maximum contrast to each other.
function distinquishableColour(number)
{
    // Taken from:
    //     Twenty-two colors of maximum contrast.
    //     Color Engineering, 3, 26-27. Kelly, S.A. (1990).
    const kellyMaxContrastColours = [
        "#FFB300", // Vivid Yellow
        "#803E75", // Strong Purple
        "#FF6800", // Vivid Orange
        "#A6BDD7", // Very Light Blue
        "#C10020", // Vivid Red
        "#CEA262", // Grayish Yellow
        "#817066", // Medium Gray

        // Rest are not so good for people with colour vision issues.
        "#007D34", // Vivid Green
        "#F6768E", // Strong Purplish Pink
        "#00538A", // Strong Blue
        "#FF7A5C", // Strong Yellowish Pink
        "#53377A", // Strong Violet
        "#FF8E00", // Vivid Orange Yellow
        "#B32851", // Strong Purplish Red
        "#F4C800", // Vivid Greenish Yellow
        "#7F180D", // Strong Reddish Brown
        "#93AA00", // Vivid Yellowish Green
        "#593315", // Deep Yellowish Brown
        "#F13A13", // Vivid Reddish Orange
        "#232C16", // Dark Olive Green
    ];

    var index = number - 1;

    if ((index >= 0) && (index < kellyMaxContrastColours.length))
    {
        return kellyMaxContrastColours[index];
    }

    return "black";
}

// This function replaces the contents of the locations list.
// listCellContents must be an array of objects, with each object
// containing a 'label' string, a 'labelColour' string and a
// 'detailLabel' string.  It will display a table with one row for
// each element in the provided array.
function updateLocationList(listCellContents)
{
    var tableHTML = "";

    // Should probably build this once and then update,
    // rather than recreating on each update.

    for (var i = 0; i < listCellContents.length; ++i)
    {
        var label = listCellContents[i].label;
        var labelColour = listCellContents[i].labelColour;
        var detailLabel = listCellContents[i].detailLabel;

        tableHTML += '<tr><td class="mdl-data-table__cell--non-numeric"><span class="tableLabel" style="color: ' + labelColour + ';">' + label + '</span><br /><span class="tableDetailLabel">' + detailLabel + '</span><br />&nbsp;</td></tr>';
    }

    var table = document.getElementById("locationTable")
    table.innerHTML = tableHTML;
}

// Draws a filled circle of the appropriate radius.
//
// Parameters:
//   context: HTML Canvas drawing context
//   radius:  The radius of the circle to draw.
//
function drawCompassFace(context, radius)
{
    // Circle shape
    context.beginPath();
    context.arc(0, 0, radius, 0 , 2*Math.PI);

    // Fill circle in light grey
    context.fillStyle = "lightgrey";
    context.fill();

    // Draw circle outline (stroke) in black
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.stroke();
}

// Draws a line on the compass face at a specific angle.
//
// Parameters:
//   context:  HTML Canvas drawing context
//   degAng:   Angle in degrees to draw line at. 0 degree is straight
//             up, 90 degrees is to the right, etc.
//   startPos: The position to start the line, with 0 being the
//             centre of the circle , and 'radius' being the
//             outside.
//   endPos:   The position to end the line, with 0 being the
//             centre of the circle, and 'radius' being the
//             outside.
//   width:    The width of the line in pixels.
//   colour:   An HTML colour value for the colour of the stroke.
//
function drawNeedle(context, degAng, startPos, endPos, width, colour)
{
    var rotationRad = degAng.toRadians();

    // Save transform
    context.save();

    // Rotate the canvas so we can just draw a vertical line.
    context.rotate(rotationRad);

    // Create a straight vertical line
    context.beginPath();
    context.moveTo(0,-startPos);
    context.lineTo(0, -endPos);

    // Draw line.
    context.strokeStyle = colour;
    context.lineWidth = width;
    context.lineCap = "round";
    context.stroke();
    context.closePath();

    // Restore transform (undo rotation)
    context.restore();
}

// Draws a letter on the compass face at a specific angle.
//
// Parameters:
//   context:  HTML Canvas drawing context
//   radius:   The radius of the compass face.
//   degAng:   Angle in degrees to draw letter at. 0 degree is straight
//             up, 90 degrees is to the right, etc.
//   letter:   A String with the letter to display.
//
function drawLetter(context, radius, degAng, letter)
{
    var rotationRad = degAng.toRadians();

    // Save transform
    context.save();

    // Text style.
    context.fillStyle = "black";
    context.font = radius * 0.15 + "px arial";
    context.textBaseline = "middle";
    context.textAlign = "center";

    // Rotate so vertical translation will move on angle
    context.rotate(rotationRad);

    // Translate from centre to place letter 85% towards circle edge.
    context.translate(0, -radius*0.85);

    // Rotate the canvas
    context.rotate(-rotationRad);

    // Draw the text (letter).
    context.fillText(letter, 0, 0);

    // Restore transform (undo rotation/translation)
    context.restore();
}



// Function to initially resize canvas.
// Students won't need to call this function.
function resizeCanvas()
{
    var content = document.getElementById("content");
    var canvas = document.getElementById("compassCanvas");
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style.width = content.offsetWidth + 'px';
    canvas.style.height = content.offsetWidth + 'px';
    var context = canvas.getContext("2d");
    var radius = canvas.height / 2;
    context.translate(radius, radius);
}

resizeCanvas();
