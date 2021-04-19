const ps = require('ps-node');

if (!isWin) setTimeout(checkPockIsRunning, 10000);

function checkPockIsRunning() {
  ps.lookup({}, (err, resultList) => {
    if (err) {
      console.error(err);
      return;
    }
    const pockProcess = resultList.find((p) => p.command === '/Applications/Pock.app/Contents/MacOS/Pock');
    if (!pockProcess) {
      exec('/Applications/Pock.app/Contents/MacOS/Pock');
    }
  });
}
