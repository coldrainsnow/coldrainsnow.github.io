---
layout: post
title: Effective C++读书笔记
tags: [C++]
---

条款3：尽可能使用const

```cpp
char greeting[] = "Hello";
const char * p = greeting; //指针指向的内容不能变，但是指针本身的值可以变
char * const p = greeting; //指针本身的值不能变，但是指针指向的内容可以变
const char * const p = greeting; //上面说的两个都不能变
```

```cpp
char abc[] = "world"
const char * p = "Hello";
*p = wprld // 错误
p = abc; // 正确
std::cout << *p << std::endl; // 输出的是'w' 因为这是取数组的第一个字符
```

```cpp
char abc[] = "world";
char ddd[] = "hello";

char* const p = ddd;
//p = abc; 错误
*p = 'w';
std::cout << *p << std::endl; // 输出'w'
```

const在*的前后位置，代表对不同的东西const

const在*左侧，代表指向的内容是const

const在*右侧，代表指针本身是const

像下面这两个函数的参数其实是一样的，都是对指向内容的const

```cpp
void func(const Widget * pw);
void func(Widget const * pw);
```

p21 p22没怎么看懂



条款5：了解C++默默编写并调用了哪些函数

```cpp
// 写一个空类
class Empty {};
// 其实就是写了一个这个
class Empty {
public:
	Empty() {} //default构造函数
	Empty(const Empty& rhs) {} //copy构造函数
	~Empty() {} //析构

	Empty& operator=(const Empty& rhs) {} // copy assignment操作符
};
// 但只有当这些函数被调用时，才会被编译器创建出来
// 比如下面的每行代码都会造成编译器的创建
Empty e1; //default构造函数
Empty e2(e1);//copy构造函数
e2 = e1;//copy assignment操作符
```

注意：

1）析构函数被编译器创建时候是非虚的，也就是non-virtual，但如果这个类的基类的构造函数是虚函数，那创建出来的析构也是虚的

2）如果你自己写了一个构造函数，那编译器就不会创建default构造函数

3）为什么copy assignment操作符返回值是Empty&

这种返回类型的设计是为了支持连续赋值操作（chained assignment）。在 C++ 中，允许通过连续调用 `operator=` 实现链式赋值，例如 `a = b = c = d`。为了支持这种语法，`operator=` 必须返回一个引用，这样可以将被赋值的对象的引用传递给下一个赋值操作。

在这个例子中，`Empty& operator=(const Empty& rhs)` 返回一个 `Empty` 对象的引用，允许像这样使用：

```cpp
Empty a, b, c, d;
a = b = c = d;
```

如果 `operator=` 返回的是一个普通的 `Empty` 对象而不是引用，那么连续赋值操作将不起作用，因为每次赋值都会创建一个临时的 `Empty` 对象，而不是在原始对象上进行操作。

4）所有编译器产出的函数都是public



条款6：为驳回编译器自动（暗自）提供的机能，可将相应的成员函数声明为private并且不给实现，使用像Uncopyable这样的基类也是一种做法



条款7：

1）polymorphic（带多态性质的）base classes应该声明一个virtual析构函数。如果class带有任何的virtual函数，则他的析构也应该是virtual

2）Classes的设计目的如果不是作为基类使用，或者不是为了多态性，就不该声明virtual析构函数



条款20：能用引用就不用值传递

```cpp
#include<iostream>

class Windows
{
public:
	virtual void print()
	{
		std::cout << "1" << std::endl;
	}
};

class TestWindow : public Windows
{
public:
	virtual void print()
	{
		std::cout << "2" << std::endl;
	}
};

void test(Windows w)
{
	w.print();
}


int main()
{
	TestWindow w;
	test(w);
	return 0;
}
```

如果void test(Windows w)，其实输出的是基类的print，也就是1

但是void test(Windows& w) 输出的就是他本身的print，也就是2

这个叫做切除问题，值传递后，子类会让自己的特性化部分被切除，而引用不会

建议不用引用而用值传递的是内置类型，STL的迭代器和函数对象



条款23：宁以non-member，non-friend替换member函数

比如我们有个浏览器类，这个类里面有三个成员函数，分别是清空历史记录，删除下载记录，删除cookie

```cpp
class Web
{
public:
    	A();
    	B();
    	C();
}
```

这时候我们想每次都让他们全执行一遍，所以可以是

```cpp
class Web
{
public:
    	D() // 里面调用A B C
}
```

也可以是整一个非成员函数调用成员函数而提供出来

```cpp
void D(Web& wb)
{
    wb.A();
    wb.B();
    wb.C();
}
```

选择哪个呢，面相对象是尽量把各种都封装起来，这样子看起来用第一个比较好，但其实是第二个比较好，第一个反而封装性没有第二个好。

封装的本质是什么呢，是为了让越少人看到他越好，一层包一层，越多函数能访问到他，他的封装性就越低。ti

public是毫无封装，所有都能访问到，private则是只有他的成员函数和友元函数可以访问到。

如果一个成员函数（可以访问到private的数据）和一个非成员函数（不能访问类的任何东西）之间做抉择，并且这两个是作用相同，那就选择非成员函数了，因为他不会增加能够访问private变量的函数

注意这里说的非成员函数，同样是说他是非友元函数，因为友元函数对private的访问和成员函数是一样的

另外一点是说，这个非成员函数，他可以是另一个类的成员函数

比如我可以把函数D，写成一个Web工具类的static成员函数

```cpp
class WebUtility
{
    static D();
}
```

只要它不是Web类的一部分（或者成为friend)，就不会影响Web类的private的封装性

那咱们怎么写这个非成员函数呢，那就是整个命名空间

```cpp
namespace WebStuff
{
    class Web {...}
    void D();
    ...
}
```

像这种函数，是为了方便一个类用，叫做类的便利函数，但便利函数有时候会有很多，比如处理cookie的函数，处理历史记录的函数，处理书签的函数，但客户估计有些只对某一部分功能感兴趣，比如只对历史记录感兴趣的话，那就把和历史记录相关的函数单独写成一个头文件，把处理cookie的函数弄成另一个头文件，书签的开第三个头文件

```cpp
// 头文件Web.h 这个头文件是针对class Web自身及这个类的核心功能函数
namespace WebStuff
{
    class Web {...};
    // 核心功能，几乎所有客户都需要用到的非成员函数
}

// 头文件WebHistory.h
namespace WebStuff
{
    ... // 和历史记录相关的便利函数
}

// 头文件Webbookmarks.h
namespace WebStuff
{
    ... // 和书签相关的便利函数
}
```

其实这也是C++标准库的组织方式，标准库并不是一个单一的头文件写了所有的功能，而是数十个头文件比如vector，algorithm等等，每个头文件声明std的一些功能，如果客户只想用vector的，他就不需要用#include \<list\>

其实这样很方便维护，比如如果在Web里面又想写下载的函数，那就重开一个头文件在WebStuff命名空间里写下载的函数即可，新函数和老函数都依然可以浑为一体



