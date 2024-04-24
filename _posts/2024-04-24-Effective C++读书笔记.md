---
layout: post
title: Effective C++读书笔记
tags: [C++]
---

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

