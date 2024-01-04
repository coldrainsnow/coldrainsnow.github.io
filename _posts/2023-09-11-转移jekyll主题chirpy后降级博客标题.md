---
layout: post
title: "转移jekyll主题chirpy后降级博客标题"
tags: 博客
---

### 1.起源

由于我要迁移主题到chirpy，而chirpy显示目录的最高标题是从二级标题开始，所以就要修改我所有的文章，那我就想，能不能自己写个cpp程序，自动将标题降级呢，比如一级标题降到二级之类的

### 2.设计方案

既然打算用cpp写，这又是个查找替换的问题，所以想到了采用正则表达式来做

```cpp
std::regex pattern(R"(^(#+)(\s\d+))");
```

这是把# 1.1这种的先捕获出来，分为两个捕获组，一个是(#+)，一个是((\s\d+))，前者代表有好几个#号，后者代表\s一个空格\d+是指一堆数字，最前面的^代表是找每行的行头，用R是为了避免转义，否则就要这样写了

```cpp
std::regex pattern("(^(#+)(\\s\\d+))")
```

现在既然找到了原来的标题，那接下来就是替换了

$1找到第一个捕获组，$2找到第二个捕获组

```cpp
$1#$2
```

这样的话，就在原来的每个标题的#后面多加了一个#

以上正则就搞好了，接下来就是读取当前文件夹的所有文件，因为C++11并没有直接提供操作文件系统的库，所以要么用std::stream来调用操作系统的命令行工具，要么用第三方库，boost库中的Filesystem，但后来查了下发现C++17已经把它加进来了，所以果断上C++17，std::filesystem

果然还是C++新特性更好用

### 3.源码

所以完整的代码是这样的

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <regex>
#include <filesystem>

namespace fs = std::filesystem;

int main() {
	std::regex pattern(R"(^(#+)(\s\d+))");
	std::string replacement = "$1#$2";

	for (const auto& entry : fs::directory_iterator(fs::current_path())) {
		if (entry.is_regular_file() && entry.path().extension() == ".md") {
			std::ifstream input(entry.path());
			std::string content((std::istreambuf_iterator<char>(input)), std::istreambuf_iterator<char>());
			input.close();

			content = std::regex_replace(content, pattern, replacement);

			std::ofstream output(entry.path());
			output << content;
			output.close();
		}
	}

	return 0;
}
```



