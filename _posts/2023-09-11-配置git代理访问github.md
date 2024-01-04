---
layout: post
title: "配置git代理访问github"
tags: 开发工具
---

## 1.引言

每次拉取和推送github时，总被超时所困扰，后来想到代理的话有规则和全局，规则就是只对国外网站采用代理，全局就是用代理访问所有网站

思索一下，那就想能不能让git也设置为规则代理的模式，也就是说，让git指定通过代理走github，说干就干，发现还真的可以

## 2.操作

4780就是自己代理的端口，可以在代理软件上自己使用的端口

```cpp
git config --global http.proxy 127.0.0.1:4780
git config --global https.proxy 127.0.0.1:4780
```

这就设置完了，可以再查看下

```cpp
git config --global --get https.proxy
git config --global --get http.proxy
```

输出的是

```cpp
git config --global --get https.proxy
git config --global --get http.proxy
```

这时候你再通过tortoisegit拉取和推送，发现和访问gitee一样快，终于不用忍受访问github的问题了，大赞！