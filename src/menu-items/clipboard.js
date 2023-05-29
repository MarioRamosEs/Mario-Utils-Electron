const { notif } = require('../functions');
const clipboardy = require('clipboardy');

module.exports = {
    label: 'Portapapeles',
    visible: true,
    submenu: [
        {
            label: 'Comillas dobles por comillas simples',
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace('"', "'").trim();
                    clipboardy.writeSync(temp);
                    notif('Comillas dobles cambiadas a simples');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Comillas simples por comillas dobles',
            click() {
                try {
                    let temp = clipboardy.readSync();
                    while (temp.length > 0 && temp.indexOf('"') !== -1) {
                        temp = temp.replace("'", '"').trim();
                    }
                    clipboardy.writeSync(temp);
                    notif('Comillas simples cambiadas a dobles');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Quitar saltos de línea',
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/(\r\n|\n|\r)/gm, '').trim();
                    temp = temp.replace(/\s\s+/g, ' ');
                    clipboardy.writeSync(temp);
                    notif('Saltos de linea quitados');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Poner en mayúsculas',
            click() {
                try {
                    const temp = clipboardy.readSync();
                    clipboardy.writeSync(temp.toUpperCase());
                    notif('Portapeles en mayúsculas');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Poner en minúsculas',
            click() {
                try {
                    const temp = clipboardy.readSync();
                    clipboardy.writeSync(temp.toLowerCase());
                    notif('Portapeles en mayúsculas');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Limpiar caracteres especiales',
            click() {
                try {
                    let temp = clipboardy.readSync();
                    temp = temp.replace(/[áàäâ]/g, 'a');
                    temp = temp.replace(/[éèëê]/g, 'e');
                    temp = temp.replace(/[íìïî]/g, 'i');
                    temp = temp.replace(/[óòöô]/g, 'o');
                    temp = temp.replace(/[úùüû]/g, 'u');
                    temp = temp.replace(/[ñ]/g, 'n');
                    temp = temp.replace(/[ç]/g, 'c');
                    temp = temp.replace(/[¿?¡!]/g, '');
                    temp = temp.replace(/[.,:;()]/g, '');
                    temp = temp.replace(/["']/g, '');
                    temp = temp.replace(/[\[\]{}]/g, '');
                    temp = temp.replace(/[\\]/g, ' ');
                    temp = temp.replace(/[\/]/g, ' ');
                    temp = temp.replace(/[|]/g, ' ');
                    temp = temp.replace(/[+]/g, '');
                    temp = temp.replace(/[*]/g, '');
                    temp = temp.replace(/[-]/g, '');
                    temp = temp.replace(/[=]/g, '');
                    temp = temp.replace(/[&]/g, '');
                    temp = temp.replace(/[<]/g, '');
                    temp = temp.replace(/[>]/g, '');
                    temp = temp.replace(/[~]/g, '');
                    temp = temp.replace(/[`]/g, '');
                    temp = temp.replace(/[$]/g, '');
                    temp = temp.replace(/[%]/g, '');
                    temp = temp.replace(/[#]/g, '');
                    clipboardy.writeSync(temp);
                    notif('Caracteres especiales limpiados');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
    ],
};