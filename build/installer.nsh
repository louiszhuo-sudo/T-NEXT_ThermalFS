!include nsDialogs.nsh
!include LogicLib.nsh

!ifndef BUILD_UNINSTALLER
  Var StartAtLoginCheckbox
  Var StartAtLoginState

  !macro customInit
    StrCpy $StartAtLoginState ${BST_UNCHECKED}
    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.yst.thermalfs.donghe"
    ${If} $0 != ""
      StrCpy $StartAtLoginState ${BST_CHECKED}
    ${EndIf}
  !macroend

  !macro customPageAfterChangeDir
    Page custom StartAtLoginPageCreate StartAtLoginPageLeave
  !macroend

  Function StartAtLoginPageCreate
    ${If} ${Silent}
      Abort
    ${EndIf}

    nsDialogs::Create 1018
    Pop $0
    ${If} $0 == error
      Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 0 100% 34u "啟動設定"
    Pop $0
    CreateFont $1 "$(^Font)" "12" "700"
    SendMessage $0 ${WM_SETFONT} $1 1

    ${NSD_CreateLabel} 0 38u 100% 30u "您可以選擇在登入 Windows 後自動啟動 ThermalFS。安裝完成後仍可從程式的設定視窗變更。"
    Pop $0

    ${NSD_CreateCheckbox} 0 82u 100% 16u "Windows 登入時自動啟動 ThermalFS"
    Pop $StartAtLoginCheckbox
    ${NSD_SetState} $StartAtLoginCheckbox $StartAtLoginState

    nsDialogs::Show
  FunctionEnd

  Function StartAtLoginPageLeave
    ${NSD_GetState} $StartAtLoginCheckbox $StartAtLoginState
  FunctionEnd

  !macro customInstall
    ${If} $StartAtLoginState == ${BST_CHECKED}
      WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.yst.thermalfs.donghe" "$\"$INSTDIR\${APP_EXECUTABLE_FILENAME}$\""
    ${Else}
      DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.yst.thermalfs.donghe"
    ${EndIf}
  !macroend
!endif

!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.yst.thermalfs.donghe"
!macroend
