# Unity笔记4
> 17/1/4 unity5.5

## [材质图表](https://docs.unity3d.com/Manual/StandardShaderMaterialCharts.html)
![](./pic/StandardShaderCalibrationChartMetallic.png)

![](./pic/StandardShaderCalibrationChartSpecular.png)

## [通过脚本修改材质参数](https://docs.unity3d.com/Manual/MaterialsAccessingViaScript.html)
常用函数

函数名称|作用
----------|-----
SetColor | 改变颜色(比如材质颜色)
SetFloat | 设置浮点值(比如法线贴图的强弱设置)
SetInt | 设置整值
SetTexture | 设置一个新的贴图
详情参见 [Material](https://docs.unity3d.com/ScriptReference/Material.html)

如果要在运行过程中更改材质,你需要在编译时加入额外的参数,详情参见本节标题链接.

## [编写着色器](https://docs.unity3d.com/Manual/ShadersOverview.html)
Unity中的着色器可以用三种不同的方式编写,参见本小节标题链接.

## [Cloth 布料模拟](https://docs.unity3d.com/Manual/class-Cloth.html)