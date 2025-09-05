# 使用官方 Node.js 20 镜像作为基础
FROM node:20

# 设置工作目录
WORKDIR /workspace

# 设置远程用户为 root
USER root

# 全局安装 pnpm
RUN npm install -g pnpm@8.15.9

# 安装必要的系统依赖（如果需要的话）
# RUN apt-get update && apt-get install -y \
#     some-package \
#     && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和相关配置文件
COPY package*.json pnpm-*.yaml .npmrc ./

# 使用 pnpm 安装项目依赖
# RUN pnpm install

# 暴露 Vite 开发服务器端口
EXPOSE 5173

# 设置默认命令（可选，也可以在 devcontainer.json 中覆盖）
# CMD ["pnpm", "dev"]