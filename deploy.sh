#!/bin/bash

# 班组成员休假管理系统 - 一键部署脚本

echo "🚀 开始部署休假管理系统..."

# 1. 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /var/www/vacation-system

# 2. 复制后端代码
echo "📦 复制后端代码..."
cp -r /root/.openclaw/workspace/projects/vacation-system/backend/* /var/www/vacation-system/backend/

# 3. 复制前端代码
echo "📦 复制前端代码..."
cp -r /root/.openclaw/workspace/projects/vacation-system/frontend/* /var/www/vacation-system/frontend/

# 4. 安装后端依赖
echo "🔧 安装后端依赖..."
cd /var/www/vacation-system/backend
npm install --production

# 5. 构建前端
echo "🔨 构建前端..."
cd /var/www/vacation-system/frontend
npm install
npm run build

# 6. 创建 Nginx 配置
echo "⚙️ 配置 Nginx..."
cat > /etc/nginx/sites-available/vacation-system << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/vacation-system/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 7. 启用站点
ln -sf /etc/nginx/sites-available/vacation-system /etc/nginx/sites-enabled/
nginx -t && nginx -s reload

# 8. 安装并配置 PM2
echo "🌊 配置 PM2 守护进程..."
npm install -g pm2
cd /var/www/vacation-system/backend
pm2 start src/index.js --name vacation-api
pm2 startup
pm2 save

echo ""
echo "✅ 部署完成！"
echo ""
echo "📍 访问地址：http://你的服务器IP"
echo ""
echo "🔑 默认管理员账号："
echo "   用户名：admin"
echo "   密码：admin123"
echo ""
echo "📝 常用命令："
echo "   查看日志：pm2 logs vacation-api"
echo "   重启服务：pm2 restart vacation-api"
echo "   停止服务：pm2 stop vacation-api"