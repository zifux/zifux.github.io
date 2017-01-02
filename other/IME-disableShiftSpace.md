# win10禁用全半角切换

## 不依靠软件
**仅对谷歌输入法有效**

1. 打开 `regedit`
2. 找到 `HKEY_CURRENT_USER/Control Panel/Input Method/Hot Keys`
3. 修改 `10` 与 `70` 文件夹中的 `Key Modifers` 为 `00 c0 00 00`
4. 找到 `HKEY_USERS\.DEFAULT\Control Panel\Input Method\Hot Keys`
5. 按步骤3进行相同操作

## 使用AutoHotKey
**对所有输入法均有效**

1. 安装AutoHotKey
2. 右键新建脚本
3. 输入脚本 `+Space::Return`
4. 保存后双击运行

## 使用编译后的AutoHotKey脚本程序
AutoHotKey可以将脚本编译成可执行文件,无需安装AutoHotKey即可运行

下载地址: [disableShiftSpace.exe](https://github.com/zifux/zifux.github.io/releases/download/disableShiftSpace/disableShiftSpace.exe)