# Chrome Web Store 文案

最后更新：2026-03-21

## 隐私政策 URL

- 生产 URL：`https://openclaw-hwface.github.io/privacy/browser-extension/`

## 商店名称

- 中文：`OpenClaw 侧边栏`

## 简短描述

- 中文：`在浏览器侧边栏中连接你自己的 OpenClaw Gateway，支持文本聊天、图片和文件附件。`

## 详细描述

`OpenClaw 侧边栏` 是一个浏览器扩展，用于在浏览器侧边栏中连接和使用你自己的 OpenClaw Gateway。

安装后，你可以在设置页中填写 OpenClaw Gateway 地址、认证信息、模型、Agent ID 和接口模式，然后直接在浏览器侧边栏中发起对话。

适合以下场景：

- 使用自托管 OpenClaw Gateway
- 希望在浏览器内保留一个常驻聊天侧边栏
- 需要发送图片或文件给 OpenClaw 处理
- 希望本地保存会话历史和连接设置

主要功能：

- 浏览器侧边栏聊天界面
- 支持 `/v1/chat/completions`
- 支持 `/v1/responses`
- 支持图片和文件附件
- 本地保存会话历史
- 设置页内置 OpenClaw 配置帮助说明

数据说明：

- 扩展不会连接开发者提供的中转服务
- 所有请求仅发送到用户在设置页中配置的 OpenClaw Gateway
- 认证信息仅用于连接用户指定的 Gateway
- 会话历史和设置保存在浏览器扩展存储中

如果你的 OpenClaw 默认未启用所需接口，扩展内置帮助页会说明如何启用 `/v1/chat/completions` 和 `/v1/responses`。

## 营销要点

- 连接你自己的 OpenClaw Gateway
- 浏览器侧边栏常驻聊天
- 支持图片和文件附件
- 本地保存会话历史
- 内置 OpenClaw 配置帮助

## 权限说明

此扩展需要访问用户在设置页中填写的 OpenClaw Gateway 地址，以便发送聊天请求、图片和文件附件。扩展不会将数据发送到开发者运营的中转服务。

## 隐私披露摘要

扩展可能处理用户输入的 Gateway 地址、认证信息、聊天内容、附件和本地会话历史。这些数据仅用于连接用户配置的 OpenClaw Gateway，并保存在浏览器扩展存储中或发送到用户指定的 Gateway。

## 宽泛主机访问权限审核说明

本扩展的唯一用途是为用户提供一个浏览器侧边栏界面，用于连接用户自己配置的 OpenClaw Gateway。扩展不会连接开发者运营的中转服务。之所以需要较宽的主机访问权限，是因为用户可以将 Gateway 部署在不同的本地或远程地址，扩展必须能够向用户指定的 Gateway 发送请求。

## 推荐商店元数据

- 分类：`Productivity`
- 语言：`Chinese (Simplified)`
- 支持 URL：如有项目主页，使用项目主页
- 隐私政策 URL：`https://openclaw-hwface.github.io/privacy/browser-extension/`
