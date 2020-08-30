const path = require("path");
const { app, Menu, Tray, Notification } = require("electron");
const exec = require("child_process").exec;
const psTree = require('ps-tree');

const isWin = process.platform === "win32";
const mcuIp = "192.168.1.173";

let execNoIdle = null;
let tray = null;

function notif(title, body = ""){
  console.log(title + " - " + body);
  new Notification({
    title: title,
    body: body
  }).show();
}

function kill(pid, signal, callback) {
  signal = signal || 'SIGKILL';
  callback = callback || function () { };
  var killTree = true;
  if (killTree) {
    psTree(pid, function (err, children) {
      [pid].concat(
        children.map(function (p) {
          return p.PID;
        })
      ).forEach(function (tpid) {
        try { process.kill(tpid, signal) }
        catch (ex) { }
      });
      callback();
    });
  } else {
    try { process.kill(pid, signal) }
    catch (ex) { }
    callback();
  }
};

app.on("ready", () => {
  tray = new Tray(path.join(__dirname, "./../assets/icon.png"));

  const menu = Menu.buildFromTemplate([
    {
      label: "Test",
      click() {
        if (isWin) {
          notif("Test desde Windows");
        } else {
          notif("Test desde Mac");
        }
      },
    },
    {
      label: "Apagar 30 minutos",
      click() {
        if (isWin) {
          exec("shutdown /s /t 1800");
        } else {
          notif("TODO");
        }
      },
    },
    {
      label: "Lolete",
      click() {
        if (isWin) {
          exec("C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe");
          exec("C:\\Users\\mario\\AppData\\Local\\Programs\\Blitz\\Blitz.exe");
          exec("\"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe\" --launch-product=league_of_legends --launch-patchline=live");
        } else {
          exec("open -a Blitz");
          exec("open -a LeagueClient");
        }
      },
    },
    {
      label: "No IDLE",
      click() {
        if (isWin) {
          if (execNoIdle === null) {
            execNoIdle = exec("node C:\\REPOS\\NodeUtils\\src\\NoIdle.js", { detached: true });
            notif("No IDLE iniciado");
          } else {
            kill(execNoIdle.pid);
            execNoIdle = null;
            notif("No IDLE finalizado");
          }
        } else {
          notif("TODO");
        }
      },
    },
    {
      label: "Salir",
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Mario's Utils");
  tray.setContextMenu(menu);
});

if(!isWin) app.dock.hide();
//app.setAppUserModelId(process.execPath);
app.setAppUserModelId(path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe'));