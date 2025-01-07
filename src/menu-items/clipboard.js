const clipboardy = require("clipboardy");
const { notif } = require("../functions");

module.exports = {
    label: "Portapapeles",
    visible: true,
    submenu: [
        {
            label: "Comillas dobles por comillas simples",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace('"', "'").trim();
                    clipboardy.writeSync(temp);
                    notif("Comillas dobles cambiadas a simples");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Comillas dobles por doble comillas dobles",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/"/g, '""').trim();
                    clipboardy.writeSync(temp);
                    notif("Comillas dobles cambiadas a dobles comillas dobles");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Comillas simples por comillas dobles",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    while (temp.length > 0 && temp.indexOf('"') !== -1) {
                        temp = temp.replace("'", '"').trim();
                    }
                    clipboardy.writeSync(temp);
                    notif("Comillas simples cambiadas a dobles");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Quitar saltos de línea",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/(\r\n|\n|\r)/gm, "").trim();
                    temp = temp.replace(/\s\s+/g, " ");
                    clipboardy.writeSync(temp);
                    notif("Saltos de linea quitados");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Convertir a postman",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/(\r\n|\n|\r)/gm, "\\n").trim();
                    // Cambia las " por \" y las ' por \'
                    temp = temp.replace(/"/g, '\\"');
                    temp = temp.replace(/'/g, "\\'");
                    clipboardy.writeSync(temp);
                    notif("Saltos de linea cambiados a \\n");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Poner en mayúsculas",
            click() {
                try {
                    const temp = clipboardy.readSync();
                    clipboardy.writeSync(temp.toUpperCase());
                    notif("Portapeles en mayúsculas");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Poner en minúsculas",
            click() {
                try {
                    const temp = clipboardy.readSync();
                    clipboardy.writeSync(temp.toLowerCase());
                    notif("Portapeles en mayúsculas");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Limpiar caracteres especiales",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/[áàäâ]/g, "a");
                    temp = temp.replace(/[éèëê]/g, "e");
                    temp = temp.replace(/[íìïî]/g, "i");
                    temp = temp.replace(/[óòöô]/g, "o");
                    temp = temp.replace(/[úùüû]/g, "u");
                    temp = temp.replace(/[ñ]/g, "n");
                    temp = temp.replace(/[ç]/g, "c");
                    temp = temp.replace(/[¿?¡!]/g, "");
                    temp = temp.replace(/[.,:;()]/g, "");
                    temp = temp.replace(/["']/g, "");
                    temp = temp.replace(/[\[\]{}]/g, "");
                    temp = temp.replace(/[\\]/g, " ");
                    temp = temp.replace(/\//g, " ");
                    temp = temp.replace(/[|]/g, " ");
                    temp = temp.replace(/[+]/g, "");
                    temp = temp.replace(/[*]/g, "");
                    temp = temp.replace(/[-]/g, "");
                    temp = temp.replace(/[=]/g, "");
                    temp = temp.replace(/[&]/g, "");
                    temp = temp.replace(/[<]/g, "");
                    temp = temp.replace(/[>]/g, "");
                    temp = temp.replace(/[~]/g, "");
                    temp = temp.replace(/[`]/g, "");
                    temp = temp.replace(/[$]/g, "");
                    temp = temp.replace(/[%]/g, "");
                    temp = temp.replace(/[#]/g, "");
                    clipboardy.writeSync(temp);
                    notif("Caracteres especiales limpiados");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Limpiar emojis",
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/[\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}-\u{1F251}\u{1F300}-\u{1F321}\u{1F324}-\u{1F393}\u{1F396}-\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}-\u{1F3F0}\u{1F3F3}-\u{1F3F5}\u{1F3F7}-\u{1F4FD}\u{1F4FF}-\u{1F53D}\u{1F549}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F56F}-\u{1F570}\u{1F573}-\u{1F57A}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F590}\u{1F595}-\u{1F596}\u{1F5A4}\u{1F5A5}\u{1F5A8}\u{1F5B1}-\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CB}-\u{1F6D2}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6EB}-\u{1F6EC}\u{1F6F0}-\u{1F6F3}\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}\u{1F90C}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F978}\u{1F97A}-\u{1F9CB}\u{1F9CD}-\u{1FA53}\u{1FA60}-\u{1FA6D}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu, "");
                    clipboardy.writeSync(temp);
                    notif("Emojis limpiados");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
    ],
};
