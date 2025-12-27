# 电池容量预测预警平台

一个基于 Django 的电池健康状态预测与预警系统，支持模型训练、容量预测、结果可视化和预警功能。

## 📋 项目简介

电池容量预测预警平台是一个用于电池健康状态监测和预测的 Web 应用系统。系统支持上传训练数据进行模型训练，使用训练好的模型对电池容量进行预测，并通过可视化图表展示预测结果。当预测容量低于设定阈值时，系统会触发预警通知。

## ✨ 主要功能

### 用户管理
- ✅ 用户注册（邮箱注册，支持验证码验证）
- ✅ 用户登录（邮箱登录）
- ✅ 密码修改
- ✅ 用户会话管理

### 模型训练
- 📊 支持多文件上传（CSV、Excel 格式）
- ⚙️ 可配置训练参数：
  - 输入步长（历史数据长度）
  - 预测步长（未来数据长度）
  - 学习率
  - 模型名称
- 📈 训练进度实时显示

### 健康状态预测
- 🤖 选择已训练的模型进行预测
- 📁 上传预测数据文件
- ⚠️ 自定义预警阈值（电池电量百分比）
- 🔔 自动触发预警通知

### 结果展示
- 📊 预测结果图表可视化（Chart.js）
- 📉 预测指标展示：
  - RMSE（均方根误差）
  - MAE（平均绝对误差）
  - R²（决定系数）

## 🛠️ 技术栈

### 后端
- **Django 5.0.3** - Web 框架
- **MySQL** - 关系型数据库
- **Redis** - 缓存服务（验证码存储）
- **QQ 邮箱 SMTP** - 邮件服务（验证码发送）

### 前端
- **Tailwind CSS** - 样式框架
- **Chart.js** - 图表库
- **Font Awesome** - 图标库
- **原生 JavaScript** - 交互逻辑

### 开发环境
- **Python** - 编程语言
- **Conda** - 环境管理（study 环境）

## 📁 项目结构

```
Warning_Platform/
├── login_register/          # 登录注册应用
│   ├── models.py           # 用户模型（自定义 User）
│   ├── views.py            # 视图函数
│   ├── forms.py            # 表单验证
│   └── urls.py             # URL 路由
├── warning/                # 预警平台应用
│   ├── views.py            # 主页面视图
│   └── urls.py             # URL 路由
├── templates/              # HTML 模板
│   ├── base.html          # 基础模板
│   ├── login.html         # 登录页面
│   ├── register.html      # 注册页面
│   ├── password_change.html # 密码修改页面
│   └── index.html         # 主页面
├── static/                 # 静态文件
│   ├── index.js           # 主页面交互逻辑
│   ├── captcha.js         # 验证码相关
│   ├── changepassword.js  # 密码修改逻辑
│   ├── toast.js           # 消息提示
│   └── chart.umd.min.js   # 图表库
├── Warning_Platform/       # 项目配置
│   ├── settings.py        # Django 配置
│   └── urls.py            # 主 URL 配置
├── manage.py              # Django 管理脚本
├── requirements.txt       # Python 依赖
├── 一键启动服务.bat       # 快速启动脚本
└── db.sqlite3            # SQLite 数据库（开发环境）
```

## 🚀 快速开始

### 环境要求

- Python 3.8+
- MySQL 5.7+
- Redis 6.0+
- Conda（可选，用于环境管理）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Warning_Platform
   ```

2. **创建虚拟环境（推荐使用 Conda）**
   ```bash
   conda create -n study python=3.8
   conda activate study
   ```

3. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **配置数据库**
   
   编辑 `Warning_Platform/settings.py`，修改数据库配置：
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'warning_platform',
           'USER': 'root',
           'PASSWORD': 'your_password',
           'HOST': '127.0.0.1',
           'PORT': '3306',
       }
   }
   ```

   创建数据库：
   ```sql
   CREATE DATABASE warning_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **配置 Redis**
   
   确保 Redis 服务已启动，默认配置：
   - 地址：127.0.0.1
   - 端口：6379
   - 数据库：0

6. **配置邮件服务（可选）**
   
   编辑 `Warning_Platform/settings.py`，修改邮件配置：
   ```python
   EMAIL_HOST_USER = 'your_email@qq.com'
   EMAIL_HOST_PASSWORD = 'your_authorization_code'
   ```

7. **数据库迁移**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

8. **创建超级用户（可选）**
   ```bash
   python manage.py createsuperuser
   ```

9. **启动服务**

   **方式一：使用批处理脚本（Windows）**
   ```bash
   一键启动服务.bat
   ```

   **方式二：手动启动**
   ```bash
   # 启动 Redis（如果未作为服务运行）
   redis-server
   
   # 启动 Django 开发服务器
   python manage.py runserver 127.0.0.1:8000
   ```

10. **访问应用**
    
    打开浏览器访问：http://127.0.0.1:8000

## 📝 使用说明

### 用户注册
1. 访问注册页面：http://127.0.0.1:8000/register/
2. 填写用户名、邮箱、密码等信息
3. 点击"获取验证码"，系统会发送验证码到您的邮箱
4. 输入验证码完成注册

### 用户登录
1. 访问登录页面：http://127.0.0.1:8000/login/
2. 使用注册时的邮箱和密码登录
3. 登录成功后自动跳转到主页面

### 模型训练
1. 在主页面选择"模型训练"标签
2. 上传训练数据文件（支持 CSV、Excel 格式，可多选）
3. 配置训练参数：
   - 输入步长：通常为 8、16、24 或 32
   - 预测步长：通常为 4、8、12 或 16
   - 学习率：通常为 0.0001-0.01
   - 模型名称：用于后续识别
4. 点击"开始训练"按钮
5. 等待训练完成（可查看训练进度）

### 健康状态预测
1. 在主页面选择"健康状态预测"标签
2. 选择已训练好的模型
3. 设置预警阈值（电池电量百分比，通常为 10-30%）
4. 上传预测数据文件
5. 点击"开始预测"按钮
6. 查看预测结果和预警信息

### 查看预测结果
- **预测结果图**：查看实际值与预测值的对比曲线
- **预测指标**：查看 RMSE、MAE、R² 等评估指标

## ⚙️ 配置说明

### 数据库配置
项目默认使用 MySQL 数据库，如需使用 SQLite（开发环境），可修改 `settings.py`：
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Redis 配置
验证码存储在 Redis 中，默认过期时间为 5 分钟（300 秒），可在 `settings.py` 中修改：
```python
SMS_CODE_REDIS_EXPIRES = 300  # 单位：秒
```

### 邮件配置
系统使用 QQ 邮箱发送验证码，需要：
1. 开启 QQ 邮箱的 SMTP 服务
2. 获取授权码（非登录密码）
3. 在 `settings.py` 中配置邮箱和授权码

## 🔒 安全说明

⚠️ **重要提示**：
- 生产环境请修改 `SECRET_KEY`
- 将 `DEBUG` 设置为 `False`
- 配置 `ALLOWED_HOSTS`
- 使用环境变量管理敏感信息（数据库密码、邮箱授权码等）
- 不要将包含敏感信息的配置文件提交到版本控制系统

## 📦 依赖列表

主要依赖包（详见 `requirements.txt`）：
- Django==5.0.3
- django-redis==6.0.0
- mysqlclient==2.2.7
- redis==6.2.0
- Pillow==11.2.1
- PyMySQL==1.1.1

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 👥 作者

- 项目维护者：[您的名字]

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：[您的邮箱]
- Issue：[GitHub Issues 链接]

---

**注意**：本项目为开发版本，生产环境部署前请进行充分的安全配置和测试。

