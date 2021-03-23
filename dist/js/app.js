document.addEventListener("DOMContentLoaded", function() {
    // initialize the robot board.
    initializeRobotBoard();
    initializedCommandCenter();

    log('BEEP BOOP - I\'M A HAPPY ROBOT. YOU CAN COMMAND ME USING THE BOX BELOW AND THE ENTER KEY.');
    log('TRY TYPING HELP FOLLOWED BY THE ENTER KEY.');

    registerCommands();

});

var WIDTH = 5;
var HEIGHT = 5;

var COMMAND_REGISTER = {};
var COMMAND_HISTORY = [];

var CURRENT_COMMAND = '';

var CARDINAL_DIRECTIONS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

var ROBOT = document.createElement('div');
ROBOT.id = 'robot';

var initializeRobotBoard = function() {

    var board = document.getElementById("board");

    for ( var i = 0; i < WIDTH; i++ ) {
        var row = div(null, ['row']);
        row.setAttribute('robot-row', i);
        for ( var j = 0; j < HEIGHT; j++ ) {
            var cell = div(null, ['cell']);
            cell.setAttribute('robot-cell', j);
            row.appendChild(cell);
        }

        board.appendChild(row);
    }

}

var initializedCommandCenter = function() {
    var commandInput = document.getElementById('command-input');
    commandInput.addEventListener('keydown', function(e) {
        if ( e.key == 'Enter' ) {
            // We are committing a command
            e.preventDefault();
            e.stopPropagation();

            var command = commandInput.value.trim();

            log("$ " + command);
            commandInput.value = '';

            var commandAndArgs = command.split(" ");

            if ( commandAndArgs.length > 1 ) {
                command = commandAndArgs[0];
            }

            if ( Object.keys(COMMAND_REGISTER).indexOf(command) < 0 ) {
                log('UNRECOGNIZED COMMAND "'+command+'". TYPE HELP FOR VALID COMMANDS')
            } else {
                var commandFn = COMMAND_REGISTER[command];

                if ( typeof commandFn !== 'undefined' ) {
                    if ( commandAndArgs.length === 2 ) {
                        commandFn(commandAndArgs[1]);
                    } else {
                        commandFn();
                    }
                    
                }
            }
        }
    });
}

var registerCommands = function() {
    // HELP command
    var helpCommand = function() {
        log('BEEP BOOP - I KNOW THE FOLLOWING COMMANDS:');
        log('PLACE X,Y,F | MOVE | LEFT | RIGHT | REPORT | CLEAR | HELP');
    }
    COMMAND_REGISTER.HELP = helpCommand;

    var clearCommand = function() {
        output = document.getElementById('output');
        output.innerHTML = '';
    }

    COMMAND_REGISTER.CLEAR = clearCommand;

    var placeCommand = function(args) { 
        // args needs to be 3 arguments long.
        var invalidArgsError = function() {
            log('PLACE - INVALID ARGUMENTS: USE THE FORM PLACE X,Y,F');
        }

        if ( typeof args === 'undefined' ) {
            invalidArgsError();
            return;
        }

        var splitArgs = args.split(",");

        if ( splitArgs.length !== 3 ) {
            invalidArgsError();
            return;
        }

        // if we got here... We have three arguments. 
        // now check to make sure they're valid.

        // first two arguments are the x and y of our robot.
        // if either of those values are higher than 5 than 
        // we can't place the robot.

        var coords = splitArgs.slice(0, -1);
        for( var i = 0; i < coords.length; i++ ) {

            var numberCoord = parseInt(coords[i]);
            if ( isNaN(numberCoord) ) {
                // log that we've got something wrong.
                log('PLACE - INVALID ARGUMENT: ARGUMENT "'+coords[i]+'" COULD NOT BE PARSED AS A NUMBER.');
                return;
            }

            coords[i] = numberCoord;
        }

        var max = coords.reduce(function(a, b) {
            return Math.max(a, b);
        });

        var min = coords.reduce(function(a, b) {
            return Math.min(a, b);
        })

        if ( max > 4 ) {
            log('PLACE - INVALID ARGUMENT: ARGUMENT "'+max+'" IS TOO HIGH. USE A VALUE EQUAL OR LESS THAN FOUR.');
            return;
        }

        if ( min < 0 ) {
            log('PLACE - INVALID ARGUMENT: ARGUMENT "'+min+'" IS TOO LOW. USE A VALUE GREATER THAN OR EQUAL TO ZERO.');
            return;
        }

        // Right. We managed to get here. Good work. We have a valid X, Y coordinate to place our robot.
        // Do we have a valid cardinality.

        var facing = splitArgs.pop();
        if ( CARDINAL_DIRECTIONS.indexOf(facing) < 0 ) {
            log('PLACE - INVALID ARGUMENT: ARGUMENT "'+facing+'" IS NOT VALID. VALID VALUES ARE NORTH, SOUTH, EAST OR WEST.');
        }

        // If the robot is already on the board, we want to remove it first.
        if ( ROBOT.parentNode !== null ) {
            ROBOT.parentNode.removeChild(ROBOT);
        }

        ROBOT.setAttribute('facing', facing);
        ROBOT.setAttribute('row', 4 - coords[0]);
        ROBOT.setAttribute('cell', coords[1]);
        
        // Lets place the robot where it's meant to be.
        // Find the right row.

        // The origin (0,0) can be considered to be the SOUTH WEST most corner.
        var row = document.querySelectorAll('.row')[4 - coords[0]];
        var cell = row.querySelectorAll('.cell')[coords[1]];
        
        cell.appendChild(ROBOT);
    }

    COMMAND_REGISTER.PLACE = placeCommand;

    var moveCommand = function() {
        if ( ROBOT.parentNode == null ) {
            // We don't need to do anything. The robot isn't on the board.
            return;
        }

        var facing = ROBOT.getAttribute('facing');
        var axis;

        if ( facing === 'NORTH' || facing === 'SOUTH' ) {
            axis = 'row';
        } else {
            axis = 'cell';
        }

        var currentPosition = parseInt(ROBOT.getAttribute(axis));
        
        var inc = 0;

        if ( facing === 'NORTH' || facing === 'WEST' ) {
            inc--;
        } else {
            inc++;
        }

        if ( (currentPosition + inc) > 4 ) {
            return;
        } else if ( (currentPosition + inc) < 0 ) {
            return;
        }

        currentPosition += inc; 
        ROBOT.setAttribute(axis, currentPosition);

        // "move" the robot, in air quotes. In reality we're just removing it and adding it again.
        ROBOT.parentNode.removeChild(ROBOT);

        var row = parseInt(ROBOT.getAttribute('row'));
        var cell = parseInt(ROBOT.getAttribute('cell'));

        var row = document.querySelectorAll('.row')[row];
        var cell = row.querySelectorAll('.cell')[cell];
        
        cell.appendChild(ROBOT);  
    }

    COMMAND_REGISTER.MOVE = moveCommand;

    var leftCommand = function() {
        if ( ROBOT.parentNode == null ) {
            return;
        }

        // get the current facing.
        var facing = ROBOT.getAttribute('facing');

        // Now we need to find out what new facing we should find.
        // technically left is counterclockwise or widdershins.
        var facingIndex = CARDINAL_DIRECTIONS.indexOf(facing);
        var newFacing;

        if ( (facingIndex - 1) < 0 ) {
            newFacing = CARDINAL_DIRECTIONS[CARDINAL_DIRECTIONS.length - 1];
        } else {
            newFacing = CARDINAL_DIRECTIONS[facingIndex - 1];
        }

        ROBOT.setAttribute('facing', newFacing);

    }

    COMMAND_REGISTER.LEFT = leftCommand;

    var rightCommand = function() {
        if ( ROBOT.parentNode == null ) {
            return;
        }

        // get the current facing.
        var facing = ROBOT.getAttribute('facing');

        // Now we need to find out what new facing we should find.
        // technically left is counterclockwise or widdershins.
        var facingIndex = CARDINAL_DIRECTIONS.indexOf(facing);
        var newFacing;

        if ( (facingIndex + 1) > 3 ) {
            newFacing = CARDINAL_DIRECTIONS[0];
        } else {
            newFacing = CARDINAL_DIRECTIONS[facingIndex + 1];
        }

        ROBOT.setAttribute('facing', newFacing);

    }

    COMMAND_REGISTER.RIGHT = rightCommand;

    var reportCommand = function() {
        if ( ROBOT.parentNode == null ) {
            return;
        }

        var facing = ROBOT.getAttribute('facing');
        var row = ROBOT.getAttribute('row');
        var cell = ROBOT.getAttribute('cell');

        log('BEEP BOOP! HEY THERE =). I\'M CURRENTLT AT ('+(4 - row)+','+cell+') FACING ' + facing);
    }

    COMMAND_REGISTER.REPORT = reportCommand;


}

// Shortcut for making a div
var div = function( id, classList ) {

    var d = document.createElement('div');
    if ( id != null ) {
        d.id = id;
    }

    if ( classList != null ) {
        for( var i = 0; i < classList.length; i++ ) {
            d.classList.add(classList[i]);
        }
    }

    return d;
}

var log = function( msg ) {
    var output = document.getElementById('output');
    var newLog = document.createElement('p');
    newLog.classList.add('log-line');
    newLog.textContent = msg;

    if ( msg.charAt(0) === "$" ) {
        newLog.classList.add('command');
        newLog.addEventListener("click", function() {
            var commandInput = document.getElementById('command-input');
            commandInput.value = msg.slice(2);
            commandInput.focus();
        })
    }

    output.appendChild(newLog);
    output.scrollTop = output.scrollHeight;

}

