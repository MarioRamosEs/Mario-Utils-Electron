const { exec } = require("child_process");
const util = require("util");
const { isWin } = require("../consts");
const { notif } = require("../functions");

const execPromisified = util.promisify(exec);

async function changeTaskbarState() {
    try {
        if (isWin) {
            const taskbarIsHiddenCommand = `powershell -command "&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]}"`;

            const { stdout } = await execPromisified(taskbarIsHiddenCommand);
            const taskbarStatus = stdout.trim(); // 122 = hidden, 123 = visible, 3 = hidden
            // console.log('exec(taskbarIsHidden)', taskbarStatus);

            if (taskbarStatus === 123 || taskbarStatus === 3) {
                const unHideTaskbar = `powershell -command "&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=2;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}"`;
                await execPromisified(unHideTaskbar);
                notif("Info", "Barra de tareas visible");
            } else {
                const hideTaskbar = `powershell -command "&{$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';$v=(Get-ItemProperty -Path $p).Settings;$v[8]=3;&Set-ItemProperty -Path $p -Name Settings -Value $v;&Stop-Process -f -ProcessName explorer}"`;
                await execPromisified(hideTaskbar);
                notif("Info", "Barra de tareas oculta");
            }
        }
    } catch (e) {
        console.error(`exec error: ${e}`);
        notif("Error", "Error al cambiar el estado de la barra de tareas", "error");
    }
}

module.exports = {
    changeTaskbarState,
};
