const robot = require("robotjs");
const { delay } = require("../functions");

async function startNoIdle() {
    console.log("NoIdle Start");
    robot.setMouseDelay(2);
    await delay(3000);

    const startingPoint = {
        x: robot.getMousePos().x,
        y: robot.getMousePos().y,
    };

    // If you move the cursor vertically, the script ends
    while (robot.getMousePos().y === startingPoint.y) {
        for (let x = startingPoint.x - 50; x < startingPoint.x + 50; x++) {
            robot.moveMouse(x, startingPoint.y);
        }
        await delay(500);

        for (let x = startingPoint.x + 50; x > startingPoint.x - 50; x--) {
            robot.moveMouse(x, startingPoint.y);
        }
        await delay(500);
    }
    console.log("NoIdle End");
}

module.exports = {
    startNoIdle,
};

