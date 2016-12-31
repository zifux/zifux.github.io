# Unity笔记1

## [停用GameObjects](https://docs.unity3d.com/Manual/DeactivatingGameObjects.html)
`GameObject`左上角的选框可以选择物体是否启用，对应脚本中`GameObject`中的`activeSelf`属性

父物体关闭`activeSelf`会使得子物体均被停用,但是子物体的`activeSelf`没有发生改变,目的是保留原来的状态,以便在父物体重新启用时,子物体正常启用.

不能通过`activeSelf`判断子物体是否启用,为了解决这个问题,可使用`activeHierarchy`属性判断子物体实际上是否是启用状态.

## [动态实例化Prefabs](https://docs.unity3d.com/Manual/InstantiatingPrefabs.html)
三个例子:建墙,发射火箭,机器人爆炸成许多碎片

```C#

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