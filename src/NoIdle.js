const robot = require('robotjs');
const utils = require('./utils');

module.exports = {
  async startNoIdle() {
    console.log('Start');
    robot.setMouseDelay(2);
    await utils.delay(3000);

    // let mouse = robot.getMousePos();
    const screenSize = robot.getScreenSize();
    const screenMiddle = { x: screenSize.width / 2, y: screenSize.height / 2 };
    robot.moveMouse(screenMiddle.x, screenMiddle.y);

    // If you move the cursor vertically, the script ends
    while (robot.getMousePos().y === screenMiddle.y) {
      for (let x = screenMiddle.x - 50; x < screenMiddle.x + 50; x++) {
        robot.moveMouse(x, screenMiddle.y);
      }
      await utils.delay(1000);
      for (let x = screenMiddle.x + 50; x > screenMiddle.x - 50; x--) {
        robot.moveMouse(x, screenMiddle.y);
      }
      await utils.delay(1000);
    }

    console.log('End');
  },
};
