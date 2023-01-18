# Mario Utils - Electron
Conjunto de utilidades multiplataforma para uso personal

## Ejecución al incio en Windows
Poner un acceso directo de 'RunNHide.exe', y como parametro la ruta completa hacia start.bat, en la siguiente carpeta:
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp

Ejemplo del shortcut con parametro: 
C:\Repos\Mario-Utils-Electron\RunNHide.exe C:\Repos\Mario-Utils-Electron\start.bat

## Ejecución al incio en MAC
Importar 'MacOs-Automator.app' al automator

## Error de Node Version
Utilizar Node 14 y ejecutar el siguiente comando en la carpeta del proyecto:
.\node_modules\.bin\electron-rebuild.cmd