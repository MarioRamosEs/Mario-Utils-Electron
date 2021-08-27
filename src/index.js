/* eslint-disable linebreak-style */
const path = require('path');
const {
  app, Menu, Tray, Notification, powerSaveBlocker, BrowserWindow,
} = require('electron');
const { exec } = require('child_process');
const { Client } = require('tplink-smarthome-api');
const wol = require('wake_on_lan');
const prompt = require('electron-prompt');
const clipboardy = require('clipboardy');
const { version } = require('../package');

const isWin = process.platform === 'win32';
const ips = {
  aire2: '192.168.1.129',
  luces: '192.168.1.144',
  torre: '192.168.1.135',
};
const macs = {
  torre: 'E0:D5:5E:89:3C:22',
  aire2: 'b0:95:75:86:88:45',
  luces: 'b0:95:75:86:8a:53',
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

function shutdown(timeInSeconds, restart = 'false') {
  if (isWin) {
    exec(`shutdown ${restart ? '/r' : '/s'} /t ${timeInSeconds}`);
  } else {
    notif('TODO');
  }
}

async function turnOnOff(deviceIp, doNotif = false) {
  const device = await client.getDevice({ host: deviceIp });
  const powerState = await device.getPowerState();
  if (doNotif) notif(`Device turned ${powerState ? 'off' : 'on'}`);
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
      label: 'Portapapeles',
      visible: true,
      submenu: [
        {
          label: 'Quitar saltos de línea',
          click() {
            try {
              let temp = clipboardy.readSync();
              temp = temp.replace(/(\r\n|\n|\r)/gm, "").trim();
              clipboardy.writeSync(temp);
              notif('Saltos de linea quitados');
            } catch (error) {
              notif('Error', error);
            }
          }
        },
        {
          label: 'Poner en mayúsculas',
          click() {
            try {
              let temp = clipboardy.readSync();
              clipboardy.writeSync(temp.toUpperCase());
              notif('Portapeles en mayúsculas');
            } catch (error) {
              notif('Error', error);
            }
          }
        },
        {
          label: 'Poner en minúsculas',
          click() {
            try {
              let temp = clipboardy.readSync();
              clipboardy.writeSync(temp.toLowerCase());
              notif('Portapeles en mayúsculas');
            } catch (error) {
              notif('Error', error);
            }
          }
        }
      ]
    },
    {
      label: 'Trabajo',
      visible: isWin,
      submenu: [
        {
          label: 'Tracker',
          click() {
            try {
              const win = new BrowserWindow({});
              win.loadURL('https://trackertrabajo.marioramos.es/');
            } catch (error) {
              notif('Error', error);
            }
          },
        },
        {
          label: 'Iniciar',
          click() {
            try {
              exec('code C:\\Users\\mario\\Documents\\GitHub\\hipo-front');
              exec('github C:\\Users\\mario\\Documents\\GitHub\\hipo-front');
              exec('C:\\Users\\mario\\Documents\\GitHub\\hipo-back-2\\NHCore.sln');
            } catch (error) {
              notif('Error', error);
            }
          },
        },
        {
          label: 'Plegar',
          click() {
            try {
              shutdown(1800);
              exec('node C:\\Users\\mario\\Documents\\GitHub\\NodeUtils\\src\\NoIdle.js');
              notif('Modo plegar iniciado');
            } catch (error) {
              notif('Error', error);
            }
          },
        },
      ]
    },
    {
      label: 'Randomizer',
      click() {
        try {
          const win = new BrowserWindow({});
          win.loadURL('https://marioramos.es/utils/randomizer');
        } catch (error) {
          notif('Error', error);
        }
      },
    },
    {
      label: 'Limpiar TEMP',
      click() {
        try {
          exec('del /q/f/s %TEMP%\\*');
        } catch (error) {
          notif('Error', error);
        }
      },
    },
    {
      label: 'Bloqueo suspensión - ' + idBloqueoSuspension ? 'Activado' : 'Desactivado',
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
      label: 'WoL Manual', // Hided
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
                notif(`WoL correcto ${r}`);
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
        turnOnOff(ips.aire2);
      },
    },
    {
      label: 'Luces',
      click() {
        turnOnOff(ips.luces);
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
          label: '5 minutos',
          click() {
            shutdown(60 * 5);
          },
        }, ,
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
      label: 'Reiniciar en...',
      visible: isWin,
      submenu: [
        {
          label: 'Cancelar reinicio',
          click() {
            exec('shutdown /a');
          },
        },
        {
          label: '5 minutos',
          click() {
            shutdown(60 * 5, true);
          },
        }, ,
        {
          label: '15 minutos',
          click() {
            shutdown(900, true);
          },
        },
        {
          label: '30 minutos',
          click() {
            shutdown(1800, true);
          },
        },
        {
          label: '1 hora',
          click() {
            shutdown(3600, true);
          },
        },
        {
          label: '2 horas',
          click() {
            shutdown(3600 * 2, true);
          },
        },
        {
          label: '4 horas',
          click() {
            shutdown(3600 * 4, true);
          },
        },
      ],
    },
    {
      label: 'Lolete',
      visible: false,
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
      label: 'Cerrar todas las apps',
      visible: !isWin,
      click() {
        exec('open /Users/marioramos/Repos/Mario-Utils-Electron/QuitAllApps.app');
      },
    },
    {
      label: 'Iniciar Paralels',
      visible: !isWin,
      click() {
        exec('sudo -b /Applications/Parallels\ Desktop.app/Contents/MacOS/prl_client_app');
        notif('Paralells iniciando...');
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
    turnOnOff(ips.luces);
  });
});

if (!isWin) app.dock.hide();
app.setAppUserModelId(process.execPath);
app.on('window-all-closed', (e) => e.preventDefault());
