# Mario Utils - Electron
Conjunto de utilidades multiplataforma para uso personal

## Ejecución al incio en Windows
Poner un acceso directo de 'RunNHide.exe', y como parametro la ruta completa hacia start.bat, en la siguiente carpeta:
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp

Ejemplo del shortcut con parametro: 
C:\Repos\Mario-Utils-Electron\RunNHide.exe C:\Repos\Mario-Utils-Electron\start.bat

## Ejecución al incio en MAC
Click on the Apple logo in the top-left corner of the screen and select "System Settings…" from the dropdown menu. (Note that in macOS Ventura and later, "System Preferences" has been renamed to "System Settings".)
In the System Settings window, scroll down in the sidebar on the left to find "General" and then select "Login Items." (In some earlier versions of macOS, this might be directly listed as "Users & Groups" where you can click on "Login Items".)
In the "Login Items" section, you will see the list of apps that open automatically when you log in.

To add an app, click the plus (+) button at the bottom of the list.
Find and select the Automator app you created from the file picker and click "Open" to add it to the list of login items.

Import 'MacOs-Automator.app' to the Login Items

## Error de Node Version
Utilizar Node 14 y ejecutar el siguiente comando en la carpeta del proyecto:
.\node_modules\.bin\electron-rebuild.cmd