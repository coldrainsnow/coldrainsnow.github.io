---
layout: post
title: "static和struct"
tags: C++
---

## 1.起因

同事上班问了我一个问题，说在项目代码里看到了static struct的用法，但是编译器报错了，问我知道不知道，我脑子一呆，貌似没见过这种用法啊兄弟，只见过static一个变量或者函数的，static struct是什么操作呢

并且同事又说在网上查到，struct是不占空间的，static是占空间的，所以不能static struct，我寻思struct记忆中不是只占最大变量的那个空间嘛，所以觉得这问题值得一思考，便有了这篇文章

## 2.static struct可以用吗

首先回答这个问题

```cpp
static struct MyStruct {
    int myInt;
};
```

这是错误的，因为static只能声明变量和函数，不能声明类型，如果想声明一个静态的MyStruct实例，需要这样做

1.定义MyStruct

2.声明一个静态的实例

也就是下面这个代码

```cpp
struct MyStruct {
    int myInt;
};

// 在函数外部声明一个静态的MyStruct实例
static MyStruct myInstance;
```

在C++中，我们可以声明一个静态的结构体实例。这意味着该结构体实例在整个程序的生命周期内都是存在的，并且在其所在的作用域内是唯一的。

在这个例子中，myInstance是一个静态的MyStruct实例。无论函数被调用多少次，myInstance始终指向同一个内存地址，其值在程序的生命周期内保持不变。

但是可不能这样写奥

```cpp
struct MyStruct {
    static MyStruct myInstance;  // 这是错误的
};
```

这样也就是在结构体定义中声明静态结构体，这样是不行的，因为静态成员并不是结构体的实例成员，而是属于结构体类型本身的。因此，我们不能在结构体定义中声明另一个相同类型的静态结构体

## 3.struct占空间吗

这个话题比较有意思

首先我们得先明白，结构体的声明和实例化

1.声明

```cpp
struct MyStruct {
    int myInt;
    double myDouble;
};
```

2.实例化

```cpp
struct MyStruct {
    int myInt;
};

// 创建一个MyStruct实例
MyStruct myInstance;
```



在C++中，结构体的声明并不会占用内存空间。结构体的声明只是为了以后声明结构体变量的模板。换句话说，声明只是告诉编译器在某个地方有一个具有如上类型和大小参数的结构体，但是并没有为该结构体在内存中预留空间。

然而，当你创建一个结构体的实例时，就会为该实例分配内存空间。每个实例都会有自己的一份内存空间，用于存储其成员变量的值。例如上面写的实例化，myInstance是一个MyStruct的实例，它在内存中占用了一定的空间，用于存储myInt的值。

## 4.总结

C++的知识真滴多，不过学到后，把以前模糊的地方搞清楚也是蛮开心的！