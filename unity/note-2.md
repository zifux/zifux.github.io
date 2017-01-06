# Unity笔记2
> 17/1/2 unity5.5

## [Setting Manager 设置管理器](https://docs.unity3d.com/Manual/comp-ManagerGroup.html)

### [Audio Manager](https://docs.unity3d.com/Manual/class-AudioManager.html)
![](./pic/AudioSet.png)

属性 | 功能
------------ | -------------
Volume | 总音量
Rolloff Scale | 设置衰减因子(参见 [Audio Source]()). 值越高衰减越快(值为１代表真实世界).
Doppler Factor | 多普勒效应强弱.0代表关闭 1 代表对快速移动的物体效果很明显.
Default Speaker Mode | 设置默认的扬声器模式,默认为双声道.<br>(参见 [AudioSpeakerMode]()).
Sample Rate | 输出采样率.如果设置为0,则使用系统采样率. 注意,只有几个平台允许修改这项,例如 iOS 或 Android平台.
DSP Buffer Size | DSP缓冲大小,可以设置为性能优先或低延迟优先<br>*Default* 默认的缓冲大小<br>*Best Latency* 最低延迟<br>*Good Latency*	平衡<br>*Best Performance* 性能优先
Virtual Voice Count | 音频系统管理的虚拟声音数.数值应当大于游戏中正在播放的声音个数(其中一些可能没有被真正播放)。否则，控制台中将输出警告信息。
Real Voice Count | 音频系统管理的真实声音数,即同时真实可听到的声音数.超过设定数值时,部分较小的声音将不会被真正播放出来.<br>(参见 [AudioSettings5.0](https://docs.unity3d.com/Manual/UpgradeGuide5-Audio.html))
Disable Audio | 在单独的构建中禁用声音系统. 这也会影响MovieTexture的音频.在编辑器中不受影响.

### [Editor settings](https://docs.unity3d.com/Manual/class-EditorManager.html)

![](./pic/EditorSettings.png)

属性 | 功能
------------ | -------------
Device |远程测试的设备类型 (Android, iOS 或 none).
Compression | 将游戏屏幕图像发送到对应设备的压缩类型. JPEG类型有更高的压缩率,PNG类型有更准确清晰的画面.
Resolution | 选择设备如何显示游戏画面,normal更精细,downsized性能更好.
Version Control Mode | 选择使用的版本控制系统. (参见 [版本控制](https://docs.unity3d.com/Manual/VersionControl.html))
Asset Serialization Mode  | 辅助版本控制合并, Unity可以使用文本格式存储场景文件 (参见 [基于文本的场景文件](https://docs.unity3d.com/Manual/TextSceneFormat.html)).如果不对场景进行合并,Unity可以使用更节省空间的二进制格式或者两者并存.
Default Behavior Mode | 默认的编辑器模式,可选择2D或3D模式(参见 [2D与3D模式](https://docs.unity3d.com/Manual/2Dor3D.html))
Sprite Packer Mode | 设置启用/仅构建时启用/禁用 Sprite Packer(精灵打包器)(参见 [Sprite Packer](https://docs.unity3d.com/Manual/SpritePacker.html))

### [Input Manager](https://docs.unity3d.com/Manual/class-InputManager.html)
![](./pic/InputSetAll.png)

属性 | 功能
------------ | -------------
Axes |　包含所有当前项目定义的输入轴,Size 定义一共有多少种输入轴.
Name | 输入轴的名称,可以在游戏启动器和脚本中使用.
Descriptive Name | 数值增加按钮的详细定义,显示在游戏启动器界面.
Descriptive Negative Name | 数值减少按钮的详细定义,显示在游戏启动器界面.
Negative Button | 数值减少按钮
Positive Button | 数值增加按钮
Alt Negative Button | 次要数值减少按钮
Alt Positive Button | 次要数值增加按钮
Gravity | 数值变化速度.仅在按键情况下有效
Dead | 当输入值小于此值时,当做0值处理. 这对摇杆很有用.
Sensitivity | 对按键来说,值越大,数值**开始变化**的速度越快,越小,数值变化越平滑. 对鼠标来说,该值会缩放实际的鼠标移动量.
Snap | 当收到输入相反数值时立即变为0. 仅对按键有用.
Invert | 反转输入
Type | 按键类型 <br> **`Key / Mouse Button`** 所有的按键 <br> **`Mouse Movement`** 鼠标移动和滑块 <br>  **`Joystick Axis`** 摇杆 <br>  **`Window Movement`** 用户移动窗口
Axis | 使用摇杆的哪个值(例如摇杆的横向偏移量)
Joy Num | 具体绑定哪个摇杆
#### 注意
你定义的输入有两个作用
* 允许你在脚本中通过名字使用它们
* 允许玩家自定义具体的按键

所有的按键定义在游戏启动器中均可以更改,因此推荐在游戏中使用自定义的输入,而不要使用固定的按键,这样可以方便玩家修改按键.