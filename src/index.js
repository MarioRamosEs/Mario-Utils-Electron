const path = require("path");
const { app, Menu, Tray, Notification } = require("electron");
const exec = require("child_process").exec;

const isWin = process.platform === "win32";
const mcuIp = "192.168.1.173";

let tray = null;

//No funciona 
function notif(value){
  console.log(value);
  new Notification("Test", {
    body: value,
  });
}

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
        notif("TODO");
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
