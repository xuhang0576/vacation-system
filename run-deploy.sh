#!/bin/bash
# 班组成员休假管理系统 - 一键部署脚本

# ========== 配置 ==========
PROJECT_DIR="/var/www/vacation-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# ========== 部署 ==========
echo "🚀 开始部署..."

# 1. 创建目录
echo "📁 创建项目目录..."
mkdir -p $PROJECT_DIR
chown $(whoami):$(whoami) $PROJECT_DIR -R

# 2. 复制代码
echo "📦 复制代码..."
cp -r /root/.openclaw/workspace/projects/vacation-system/backend/* $BACKEND_DIR/
cp -r /root/.openclaw/workspace/projects/vacation-system/frontend/* $FRONTEND_DIR/

# 3. 后端依赖
echo "🔧 安装后端依赖..."
cd $BACKEND_DIR
npm install

# 4. 前端构建
echo "🔨 构建前端..."
cd $FRONTEND_DIR
npm install
npm run build

# 5. Nginx 配置
echo "⚙️ 配置 Nginx..."
cat > /tmp/vacation-nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/vacation-system/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

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
sudo cp /tmp/vacation-nginx.conf /etc/nginx/sites-available/vacation-system
sudo ln -sf /etc/nginx/sites-available/vacation-system /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload

# 6. PM2 启动后端
echo "🌊 启动后端服务..."
cd $BACKEND_DIR
pm2 stop vacation-api 2>/dev/null || true
pm2 start src/index.js --name vacation-api
pm2 save

echo "✅ 部署完成！"
echo "访问地址：http://101.43.20.124"
echo "管理员账号：admin / admin123"