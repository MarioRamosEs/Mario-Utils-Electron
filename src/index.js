const path = require('path');
const {
  app, Menu, Tray, Notification, powerSaveBlocker, BrowserWindow,
} = require('electron');
const { exec } = require('child_process');
const { Client } = require('tplink-smarthome-api');
const wol = require('wake_on_lan');
const { version } = require('../package');
const prompt = require('electron-prompt');

const isWin = process.platform === 'win32';
const ips = {
  aire: '192.168.1.128',
  leds: '192.168.1.129',
  bola: '192.168.1.144',
  torre: '192.168.1.135',
};
const macs = {
  torre: 'E0:D5:5E:89:3C:22',
  aire: 'd8:0d:17:a1:7c:ed',
  leds: 'b0:95:75:86:88:45',
  bola: 'b0:95:75:86:8a:53',
};

const client = new Client();
let tray = null;
let idBloqueoSuspension = 0;

function notif(title, body = '') {
  new Notification({
    title,
    body,
  }).show();
}

function shutdown(timeInSeconds) {
  if (isWin) {
    exec(`shutdown /s /t ${timeInSeconds}`);
  } else {
    notif('TODO');
  }
}

async function turnOnOff(deviceIp, doNotif = false) {
  const device = await client.getDevice({ host: deviceIp });
  const powerState = await device.getPowerState();
  if(doNotif) notif('Device turned '+(powerState?'off':'on'));
  device.setPowerState(!powerState);
}

app.on('ready', () => {
  tray = new Tray(path.join(__dirname, './../assets/icon.png'));

  const menu = Menu.buildFromTemplate([
    {
      label: version,
      click() {
        if (isWin) {
          notif('Test desde Windows');
        } else {
          notif('Test desde Mac');
        }
      },
    },
    {
      label: 'Tracker Trabajo',
      visible: isWin,
      click() {
        try {
          const win = new BrowserWindow({});
          win.loadURL('https://trackertrabajo.marioramos.es/');
        } catch (error) {
          // console.log(error);
        }
      },
    },
    {
      label: 'Randomizer',
      click() {
        try {
          const win = new BrowserWindow({});
          win.loadURL('https://marioramos.es/utils/randomizer');
        } catch (error) {
          // console.log(error);
        }
      },
    },
    {
      label: 'Bloqueo suspensión',
      visible: isWin,
      submenu: [
        {
          label: 'Ver programas que bloquean',
          click() {
            exec('start cmd.exe /K powercfg -requests');
          },
        },
        {
          label: 'Bloquear',
          click() {
            if (!idBloqueoSuspension) {
              idBloqueoSuspension = powerSaveBlocker.start('prevent-app-suspension');
              notif('Bloqueo activado');
            } else {
              notif('Bloqueo ya activo');
            }
          },
        },
        {
          label: 'Desbloquear',
          click() {
            powerSaveBlocker.stop(idBloqueoSuspension);
            if (!powerSaveBlocker.isStarted(idBloqueoSuspension)) {
              idBloqueoSuspension = 0;
              notif('Bloqueo desactivado');
            } else {
              notif('No se pudo desbloquear');
            }
          },
        },
      ],
    },
    {
      label: 'WoL Manual', //Hided
      visible: false,
      click() {
        prompt({
          title: 'Prompt IP',
          label: 'IP:',
          value: '192.168.1.135',
        })
          .then((r) => {
            console.log('result', r); // null if window was closed, or user clicked Cancel
            wol.wake(macs.torre, { address: r }, (error) => {
              if (error) {
                notif(`Error en WoL: ${error}`);
              } else {
                notif('WoL correcto ' + r);
              }
            });
          })
          .catch(console.error);
      },
    },
    {
      label: 'WoL Torre',
      click() {
        wol.wake(macs.torre, { address: ips.torre }, (error) => {
          if (error) {
            notif(`Error en WoL: ${error}`);
          } else {
            notif('WoL correcto');
          }
        });
      },
    },
    {
      label: 'Aire/Estufa',
      click() {
        turnOnOff(ips.aire, true);
      },
    },
    {
      label: 'Leds',
      click() {
        turnOnOff(ips.leds);
      },
    },
    {
      label: 'Bola',
      click() {
        turnOnOff(ips.bola);
      },
    },
    {
      label: 'Bola y Leds',
      click() {
        turnOnOff(ips.bola);
        turnOnOff(ips.leds);
      },
    },
    {
      label: 'Apagar en...',
      visible: isWin,
      submenu: [
        {
          label: 'Cancelar apagado',
          click() {
            exec('shutdown /a');
          },
        },
        {
          label: '15 minutos',
          click() {
            shutdown(900);
          },
        },
        {
          label: '30 minutos',
          click() {
            shutdown(1800);
          },
        },
        {
          label: '1 hora',
          click() {
            shutdown(3600);
          },
        },
        {
          label: '2 horas',
          click() {
            shutdown(3600 * 2);
          },
        },
        {
          label: '4 horas',
          click() {
            shutdown(3600 * 4);
          },
        },
      ],
    },
    {
      label: 'Lolete',
      visible: isWin,
      click() {
        if (isWin) {
          exec('C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe');
          exec('"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live');
          // exec("C:\\Users\\mario\\AppData\\Local\\Programs\\Blitz\\Blitz.exe");
        } else {
          // exec("open -a Blitz");
          exec('open -a LeagueClient');
        }
      },
    },
    {
      label: 'No IDLE',
      visible: isWin,
      click() {
        if (isWin) {
          exec('node C:\\REPOS\\NodeUtils\\src\\NoIdle.js');
          notif('No IDLE iniciado', 'Mueve manualmente el cursor para desactivarlo');
        } else {
          notif('TODO');
        }
      },
    },
    {
      label: 'Salir',
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Mario's Utils");
  tray.setContextMenu(menu);
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', () => {
    turnOnOff(ips.leds);
    turnOnOff(ips.bola);
  });
});

if (!isWin) app.dock.hide();
app.setAppUserModelId(process.execPath);
app.on('window-all-closed', (e) => e.preventDefault());
