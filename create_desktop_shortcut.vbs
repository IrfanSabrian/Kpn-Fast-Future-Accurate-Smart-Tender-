Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\KPN-FAST.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)

' Get the current directory where the script is running
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

oLink.TargetPath = currentDir & "\KPN-FAST.hta"
oLink.WorkingDirectory = currentDir
oLink.IconLocation = currentDir & "\icon.ico"
oLink.Description = "KPN-FAST Application"
oLink.Save

WScript.Echo "Shortcut created on Desktop!"
