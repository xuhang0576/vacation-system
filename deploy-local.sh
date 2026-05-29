#!/bin/bash
# 部署脚本 - 在当前服务器执行

set -e

echo "=========================================="
echo "🚀 开始部署班组成员休假管理系统"
echo "=========================================="

# 项目目录
PROJECT_DIR="/var/www/vacation-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo ""
echo "📁 1. 创建项目目录..."
sudo mkdir -p $PROJECT_DIR
sudo chown $(whoami):$(whoami) $PROJECT_DIR -R

echo ""
echo "📦 2. 复制后端代码..."
cp -r /root/.openclaw/workspace/projects/vacation-system/backend/* $BACKEND_DIR/

echo ""
echo "📦 3. 复制前端代码..."
cp -r /root/.openclaw/workspace/projects/vacation-system/frontend/* $FRONTEND_DIR/

echo ""
echo "🔧 4. 安装后端依赖..."
cd $BACKEND_DIR
npm install

echo ""
echo "🔨 5. 构建前端..."
cd $FRONTEND_DIR
npm install
npm run build

echo ""
echo "⚙️ 6. 配置 Nginx..."
sudo cat > /tmp/vacation-nginx.conf << 'NGINX_EOF'
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
NGINX_EOF

sudo cp /tmp/vacation-nginx.conf /etc/nginx/sites-available/vacation-system
sudo ln -sf /etc/nginx/sites-available/vacation-system /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload

echo ""
echo "🌊 7. 配置 PM2 守护后端..."
cd $BACKEND_DIR
pm2 stop vacation-api 2>/dev/null || true
pm2 start src/index.js --name vacation-api
pm2 save

echo ""
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📍 访问地址：http://101.43.20.124"
echo ""
echo "🔑 默认管理员账号："
echo "   用户名：admin"
echo "   密码：admin123"
echo ""
echo "📝 常用命令："
echo "   查看日志：pm2 logs vacation-api"
echo "   重启后端：pm2 restart vacation-api"