# xiaoao｜小奥练习室

一个面向小学五年级的奥数专项与综合练习网站。项目为纯静态页面，无需安装依赖或执行构建命令，并可在本地断网使用。

## 功能

- 暑期 14 讲及不定方程，共 15 个专题
- 专项练习：选择专题和难度后随机出题
- 综合练习：按难度随机出题，可选均衡随机或错题加权
- 1—5 星难度分级；未选择难度时随机抽取
- 即时检查答案、查看提示和分步解析
- 使用浏览器 `localStorage` 保存错题本、练习统计和连续答对记录

## 目录

```text
dist/                       网站文件，可直接部署
  index.html
  styles.css
  app.js
.github/workflows/
  deploy-pages.yml          GitHub Pages 自动部署
.openai/hosting.json        ChatGPT Sites 静态站点配置
```

## 本地运行与离线使用

需要联网时先将仓库下载或克隆到电脑。之后即使断网，也可以在项目根目录启动本地静态服务器：

```bash
python3 -m http.server 8080 --directory dist
```

浏览器打开 <http://localhost:8080>。页面资源全部保存在 `dist` 中；练习记录仅保存在当前浏览器，不会上传到服务器。建议通过本地服务器访问，不要直接双击 HTML 文件，以免浏览器限制本地存储。

## 部署

### GitHub Pages

仓库内已包含自动部署工作流。首次部署时：

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中将 Source 设为 **GitHub Actions**。
3. 打开 **Actions**，运行 `Deploy GitHub Pages`，或向 `main` 分支提交一次代码。
4. 部署完成后，网站通常位于 `https://lyuyun.github.io/xiaoao/`。

### Cloudflare Pages、Netlify 或 Vercel

连接此仓库后使用以下设置：

- 构建命令：留空
- 发布目录 / Output directory：`dist`
- 生产分支：`main`

### ChatGPT Sites

`.openai/hosting.json` 已将发布目录设为 `dist`。其中的 `project_id` 对应现有 Sites 项目；如果复制仓库创建新站点，请通过 Sites 创建新的项目配置，不要复用原项目 ID。

## 自定义域名

先在所选托管平台添加域名（例如 `studio.xiaoao.cn`），再按照平台显示的目标值配置 DNS。通常需要创建一条 `CNAME` 记录；请以托管平台当时提供的记录类型和目标地址为准。HTTPS 证书一般由托管平台在 DNS 生效后自动签发。

## 数据说明

错题和统计数据使用浏览器 `localStorage` 保存。清除浏览器站点数据、更换浏览器或设备后记录不会自动同步。仓库和托管服务不收集学生作答数据。
