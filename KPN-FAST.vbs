' KPN FAST Launcher
' This script launches the HTA application for server management

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get current directory
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Launch HTA
htaFile = currentDir & "\KPN-FAST.hta"

If fso.FileExists(htaFile) Then
    WshShell.Run """" & htaFile & """", 1, False
Else
    MsgBox "ERROR: KPN-FAST.hta tidak ditemukan!" & vbCrLf & vbCrLf & _
           "File Path: " & htaFile, _
           vbCritical, "KPN FAST - Error"
End If
