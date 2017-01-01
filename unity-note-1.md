# Unity笔记1
> 17/1/1 unity5.5

## [停用GameObjects](https://docs.unity3d.com/Manual/DeactivatingGameObjects.html)
![](https://docs.unity3d.com/uploads/Main/GOActiveBox.png)

`GameObject`左上角的选框可以选择物体是否启用，对应脚本中`GameObject`中的`activeSelf`属性

父物体关闭`activeSelf`会使得子物体均被停用,但是子物体的`activeSelf`没有发生改变,目的是保留原来的状态,以便在父物体重新启用时,子物体正常启用.

不能通过`activeSelf`判断子物体是否启用,为了解决这个问题,可使用`activeHierarchy`属性判断子物体实际上是否是启用状态.

## [动态实例化Prefabs](https://docs.unity3d.com/Manual/InstantiatingPrefabs.html)
三个例子:建墙,发射火箭,破坏效果

### 1.建墙
直接创建物体 `CreatePrimitive`

```c#
public class Instantiation : MonoBehaviour {
    void Start() {
        for (int y = 0; y < 5; y++) {
            for (int x = 0; x < 5; x++) {
                GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                cube.AddComponent();
                cube.transform.position = new Vector3(x, y, 0);
            }
        }
    }
}
```
使用Prefab `Instantiate`

```c#
//这里的 Transform 可表示一个带有 Transform 组件的 GameObject
public Transform brick;

void Start() {
    for (int y = 0; y < 5; y++) {
        for (int x = 0; x < 5; x++) {
            Instantiate(brick, new Vector3(x, y, 0), Quaternion.identity);
        }
    }
}
```

### 2.发射火箭
实例化火箭

```c#
// 通过定义 RigidBody 类型,强制rocket必须包含 RigidBody 组件
public Rigidbody rocket;
public float speed = 10f;

void FireRocket () {
    Rigidbody rocketClone = (Rigidbody) Instantiate(rocket, transform.position, transform.rotation);
    rocketClone.velocity = transform.forward * speed;
    
    // 可以使用 GetComponent 获取克隆对象上的组件和自定义脚本,并调用其中的功能
    rocketClone.GetComponent<MyRocketScript>().DoSomething();
}

// 当检测到 Fire1 按键按下时,开火
void Update () {
    if (Input.GetButtonDown("Fire1")) {
        FireRocket();
    }
}

```

### 3.破坏效果
使用布娃娃系统或者组合体实现死亡或被破坏的效果
在正常游戏中可以使用单个物体,当物体被破坏或者死亡时,瞬间切换成另一个展现破坏效果的Prefab,可以优化游戏性能.

```c#
public GameObject wreck;

// 使用异步 yield 等待3秒后展示破坏效果
IEnumerator Start() {
    yield return new WaitForSeconds(3);
    KillSelf();
}

void KillSelf () {
    // 在物体相同位置实例化一个可破坏的物体
    GameObject wreckClone = (GameObject) Instantiate(wreck, transform.position, transform.rotation);
    
    // 向可破坏物体传递一些自定义的必要信息
    wreckClone.GetComponent<MyScript>().someVariable = GetComponent<MyScript>().someVariable;
    
    // 删除自身,完成可破坏物体的替换
    Destroy(gameObject);
}

```

## [游戏按键](https://docs.unity3d.com/Manual/ConventionalGameInput.html)
使用` value = Input.GetAxis ("Horizontal"); `获取 Horizontal 按键的状态,值在-1到1之间.如果是鼠标等,值会大于1或小于-1.

使用` value = Input.GetKey ("a");` 获取按键是否已被按下

## [随机](https://docs.unity3d.com/Manual/RandomNumbers.html)
使用`Random.Range(0, Length)`可获得一个从0到Length的随机数.

### 物品概率
有时,我们需要物品有不同的获得概率

```c#
float Choose (float[] probs) {

    float total = 0;

    foreach (float elem in probs) {
        total += elem;
    }
	//通过 total 处理,概率总和可以不是1
    float randomPoint = Random.value * total;

    for (int i= 0; i < probs.Length; i++) {
        if (randomPoint < probs[i]) {
            return i;
        }
        else {
            randomPoint -= probs[i];
        }
    }
    return probs.Length - 1;
}
```

### 连续随机变量
如果需要大量的随机数,并且希望调节概率分布,可以使用`AnimationCurve`辅助

```c#
float CurveWeightedRandom(AnimationCurve curve) {
    return curve.Evaluate(Random.value);
}
```

### 乱序
有时我们希望将一个列表打乱顺序,比如卡牌游戏中的洗牌,这时可以在遍历过程中使用随机数,交换元素位置.

```c#
void Shuffle (int[] deck) {
    for (int i = 0; i < deck.Length; i++) {
        int temp = deck[i];
		//随机交换两元素
        int randomIndex = Random.Range(0, deck.Length);
        deck[i] = deck[randomIndex];
        deck[randomIndex] = temp;
    }
}
```

### 不重复随机选取
不重复的在一个集合中随机选取元素.<br>
当有10个点,从中随机选取5个的时候.<br>
第一次选取,概率为5/10.<br>
当第一次选中时,概率变为4/9.<br>
当第一次未选中时,概率为5/9.<br>
以此类推,如果前5个均未被选中,则概率为5/5.<br>
这保证了必有5个被选中,由于是遍历,因此是不重复的

```c#
Transform[] spawnPoints;

Transform[] ChooseSet (int numRequired) {
    Transform[] result = new Transform[numRequired];

    int numToChoose = numRequired;

    for (int numLeft = spawnPoints.Length; numLeft > 0; numLeft--) {

        float prob = (float)numToChoose/(float)numLeft;

        if (Random.value <= prob) {
            numToChoose--;
            result[numToChoose] = spawnPoints[numLeft - 1];

            if (numToChoose == 0) {
                break;
            }
        }
    }
    return result;
}
```

### 随机坐标
在空间中随机一个点
`new Vector3(Random.value, Random.value, Random.value);`
在球形范围内随机一个点
`Random.insideUnitSphere * radius(半径)`
在圆形范围内随机一个点
`Random.insideUnitCircle * radius(半径)`

## [旋转与方向](https://docs.unity3d.com/Manual/QuaternionAndEulerRotationsInUnity.html)
在`Transform	`中的`Rotation`是分别以`x` `y` `z`为轴的旋转角度,但是在代码中一般使用Quaternions(四元数)

### Quaternions
四元数组成为(x,y,z,w) 前三个是向量,第四个是以指定向量为轴的旋转角
度

> 这部分暂时略过 2017/1/1

在脚本中角度的**错误**使用示例

```c#
void Update () {

    var rot = transform.rotation;
	//这里的 x 并不表示一个角度,因此这段代码不会得到预期结果
    rot.x += Time.deltaTime * 10;
    transform.rotation = rot;
    
}
```

```c#
//这段代码尝试对欧拉角度进行修改,但是欧拉角度是由四元数计算而来的,每一个新角度都可能会得到一个截然不同的欧拉角度,可能产生万向节锁定问题
void Update () {
    
    var angles = transform.rotation.eulerAngles;
    angles.x += Time.deltaTime * 10;
    transform.rotation = Quaternion.Euler(angles);

}
```
**正确的示例**

```c#
//我们需要自己维持一个变量,用于改变角度.
float x;
void Update () {
    
    x += Time.deltaTime * 10;
    transform.rotation = Quaternion.Euler(x,0,0);

}
```

## Unity3D个性化设置

### 全局

设置 | 说明
------------ | -------------
Auto Refresh | 自动更新Assets
Load Previous Project on Startup | 在启动时自动打开之前的工程
Compress Assets on Import |	在导入Assets时自动压缩.
Disable Editor Analytics (Pro only) | 停止自动向Unity发送信息.
Show Asset Store search hits | 在项目浏览器中显示来自资源商店的免费/付费Assets数量
Verify Saving Assets | 在Unity退出时逐个检查保存的资源
Editor Skin (Plus/Pro only) | 选择编辑器皮肤
Enable Alpha Numeric Sorting | 在 Hierarchy 窗口右上角添加一个按钮,允许你按字母排序

### 扩展工具

设置 | 说明
------------ | -------------
External Script Editor | 选择使用哪个编辑器编辑脚本. Unity支持 MonoDevelop, Xamarin Studio, Visual Studio (Express) 和 Visual Studio Code.
External Script Editor Args | 选择将哪些变量传递到编辑器中<br>$(File) 文件路径.<br>$(Line) 跳转行数.<br>$(ProjectPath) 工程路径.
Add .unityproj’s to .sln|	添加 UnityScript (.unityproj) 到解决方案文件 (.sln) 中. 当默认使用 MonoDevelop 或 Xamarin Studio时这项默认启用,在使用 Visual Studio (Express) and Visual Studio Code时,这项默认禁用.
Editor Attaching | 允许脚本调试器附加,如果禁用,脚本调试器将不能调试你的脚本.
Image application |	选择打开图片所使用的程序.
Revision Control Diff/Merge	|选择一个程序,用于解决本地文件与Asset服务器不同步的问题.

### GI缓存 (全局光照缓存)

设置 | 说明
------------ | -------------
Maximum Cache Size (GB) | 使用滑块设置缓存最大值.
Custom cache location | 使用固定位置作为缓存目录,这个目录将被所有工程共享
Cache compression | 开启实时缓存文件压缩. 如果你想访问原始数据,禁用这个选项并清理缓存.
Clean Cache | 使用这个按钮清理缓存.

### 2D

设置 | 说明
------------ | -------------
Maximum Sprite Atlas Cache Size (GB) | 使用滑块设置2D贴图的缓存最大值

### 缓存服务器

设置 | 说明
------------ | -------------
Use Cache Server | 启用专用缓存服务器
IP Address |缓存服务器的IP地址