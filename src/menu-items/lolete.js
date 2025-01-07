const { exec } = require("child_process");
const { isWin } = require("../consts");

module.exports = {
    label: "Lolete",
    visible: false,
    click() {
        if (isWin) {
            exec("C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe");
            exec('"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live');
        } else {
            exec("open -a LeagueClient");
        }
    },
};
