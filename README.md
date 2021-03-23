# BEEP BOOP

This is my implementation of a robot on a 5 x 5 grid. You are able to send the robot commands by typing them in to the on screen console and hitting enter.

The robot needs to be placed with the PLACE X,Y,F command first. Once the robot is on the board you are able to move it via the MOVE command.

You are able to rotate the robot with LEFT & RIGHT commands.

---

## Design Choices

For this task I decided to not use any external dependencies and no build pipeline. I felt that adding frameworks or build pipelines would simply make the code less readable and using native javascript code would ensure that the robot would remain speedy and responsive.

The first decision I made was that I wanted an input and output console on screen. So the user could enter commands and hit enter, much like a command prompt on a normal computer. So I created a simple input / output div in which you could log messages and scroll back through them to see the moves that you'd made. It also allowed me to provide the user with feedback if they had a syntax error in their command.

It also meant that I could use a command register which allows for further expansion if the robot needed to learn more commands. Once the command register is set up and the input system was built, any number of commands could be added and registered in the same manner. 

I simplified the "movement" of the robot by simply referring to the table top in terms of an x,y coordinate system and attaching those properties to the robot div as data attributes. When the robot moves it is simply removed from the square that it's in and appended to the new cell that it's facing.