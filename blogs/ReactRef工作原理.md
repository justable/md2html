---
date: 2020-8-13
complexity: hard
categories: [react, hooks]
tags: ['react']
---

## 几种使用方法

如下列举了几种 ref 的使用方法，比较一下区别，

```ts
const MeasureExample: React.FC = () => {
  const measureRef1 = useRef<HTMLParagraphElement>(null);
  const measureRef2 = useCallback(node => {
    // 调用了一次
  }, []);
  const measureRef3 = node => {
    // 调用了多次
  };

  useEffect(() => {
    // 我遇到了这里访问measureRef1.current = null的情况，不知道为什么（我当时用了dangerouslySetInnerHTML）！
  }, []);
  useEffect(() => {
    // 官方不建议把ref当作deps，为什么？
    // 2020.12.3 终于知道来，这就像把window.BMap当作deps一样，React无法检测其变化，因为React的渲染流程是显示setState触发的，这也是和Vue的一个不同点，而ref存储的状态就类似全局变量。
  }, [measureRef1.current]);

  return (
    <>
      <p ref={measureRef1}>1</p>
      <p ref={measureRef2}>2</p>
      <p ref={measureRef3}>3</p>
    </>
  );
};
```

## 源码赋值 ref 处

```ts
// ReactFiberCommitWork.js
function commitAttachRef(finishedWork: Fiber) {
  // 赋值
}
function commitDetachRef(current: Fiber) {
  // 重置ref
}
function safelyDetachRef(current: Fiber) {
  // 重置ref
}
```

commitAttachRef 方法向上追溯的调用栈如下，

```ts
// ReactFiberWorkLoop.js
├── commitRoot() // Commit阶段
  ├── commitRootImpl()
    ├── commitLayoutEffects()
      ├── commitLayoutEffectsImpl()
        ├── commitAttachRef()
```

commitDetachRef 方法向上追溯的调用栈如下，

```ts
// ReactFiberWorkLoop.js
├── commitRoot() // Commit阶段
  ├── commitRootImpl()
    ├── commitMutationEffects()
      ├── commitMutationEffectsImpl()
        ├── commitDetachRef()
```

## 总结

- 在 createElement 时，不会把 ref 放到 props 属性中，但可以取别名或者使用 forwardRef。

- 不建议在 hooks deps 使用 ref 获取的 dom，比如`useEffect(_, [ref.current])`，因为 ref 的赋值是延后的（在 Commit 阶段），在 ref 改变前 render 函数已经被执行。当需要实时测量 dom 的变化，应该使用 functional ref，这会在 Commit 阶段赋值时立即被调用。
