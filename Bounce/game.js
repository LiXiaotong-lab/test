class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.config = {
            gravity: 0.4,
            jumpForce: -10,
            moveSpeed: 5,
            groundFriction: 0.8
        };

        // 初始化关卡系统
        this.currentLevel = 1;
        this.maxLevel = 3;
        
        // 初始化游戏状态
        this.reset();
        
        // 事件监听
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // 添加音效系统
        this.sounds = {
            jump: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='),
            collect: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='),
            hurt: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==')
        };

        // 添加移动平台和障碍物
        this.movingPlatforms = [];
        this.spikes = [];

        // 启动游戏循环
        this.gameLoop();

        // 更新UI元素
        this.updateUI();
    }

    // 添加新方法：更新UI
    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('starsCollected').textContent = this.stars.filter(star => star.collected).length;
        document.getElementById('totalStars').textContent = this.stars.length;
    }

    // 修改handleKeyUp方法
    handleKeyUp(event) {
        if (event.code === 'ArrowLeft' && this.player.velocityX < 0) {
            this.player.velocityX = 0;
        }
        if (event.code === 'ArrowRight' && this.player.velocityX > 0) {
            this.player.velocityX = 0;
        }
    }

    // 在update方法末尾添加UI更新
    update() {
        if (this.gameOver) return;

        // 更新移动平台
        this.movingPlatforms.forEach(platform => {
            platform.x += platform.speed * platform.direction;
            if (platform.x >= platform.endX || platform.x <= platform.startX) {
                platform.direction *= -1;
            }
        });

        // 更新玩家位置
        this.player.velocityY += this.config.gravity;
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        // 边界检查
        if (this.player.x < 0) {
            this.player.x = 0;
        }
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }

        // 检查是否掉落
        if (this.player.y > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
            } else {
                this.player.x = 50;
                this.player.y = 50;
                this.player.velocityY = 0;
            }
            return;
        }

        // 平台碰撞检测
        this.player.isJumping = true;
        for (let platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.isJumping = false;
                    this.player.velocityY = 0;
                    this.player.y = platform.y - this.player.height;
                }
            }
        }

        // 检查移动平台碰撞
        for (let platform of this.movingPlatforms) {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.isJumping = false;
                    this.player.velocityY = 0;
                    this.player.y = platform.y - this.player.height;
                    // 玩家跟随平台移动
                    this.player.x += platform.speed * platform.direction;
                }
            }
        }

        // 检查尖刺碰撞
        for (let spike of this.spikes) {
            if (this.checkCollision(this.player, spike)) {
                this.sounds.hurt.play();
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                } else {
                    this.player.x = 50;
                    this.player.y = 50;
                    this.player.velocityY = 0;
                }
                return;
            }
        }

        // 星星收集检测时添加音效
        for (let star of this.stars) {
            if (!star.collected && this.checkCollision(this.player, star)) {
                star.collected = true;
                this.score += 100;
                this.sounds.collect.play();
            }
        }

        // 检查关卡完成
        if (this.stars.every(star => star.collected)) {
            if (this.currentLevel < this.maxLevel) {
                this.currentLevel++;
                this.reset();
            } else {
                this.gameOver = true;
            }
        }

        // 更新UI
        this.updateUI();
    }

    checkCollision(player, platform) {
        return player.x < platform.x + platform.width &&
               player.x + player.width > platform.x &&
               player.y < platform.y + platform.height &&
               player.y + player.height > platform.y;
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制玩家
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // 绘制平台
        this.ctx.fillStyle = '#4CAF50';
        for (let platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // 绘制星星
        this.ctx.fillStyle = '#FFD700';
        for (let star of this.stars) {
            if (!star.collected) {
                this.ctx.beginPath();
                this.ctx.arc(star.x + star.width/2, star.y + star.height/2, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // 绘制移动平台
        this.ctx.fillStyle = '#FF8C00';
        for (let platform of this.movingPlatforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // 绘制尖刺
        this.ctx.fillStyle = '#FF0000';
        for (let spike of this.spikes) {
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x, spike.y + spike.height);
            this.ctx.lineTo(spike.x + spike.width/2, spike.y);
            this.ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // 绘制UI
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 10, 30);
        this.ctx.fillText(`生命: ${this.lives}`, 10, 60);
        this.ctx.fillText(`关卡: ${this.currentLevel}`, 10, 90);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '40px Arial';
            this.ctx.fillText('游戏结束!', this.canvas.width/2 - 80, this.canvas.height/2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('按空格键重新开始', this.canvas.width/2 - 80, this.canvas.height/2 + 40);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    handleKeyDown(event) {
        switch(event.code) {
            case 'ArrowLeft':
                this.player.velocityX = -this.config.moveSpeed;
                break;
            case 'ArrowRight':
                this.player.velocityX = this.config.moveSpeed;
                break;
            case 'ArrowUp':
            case 'Space':
                if (!this.player.isJumping) {
                    this.player.velocityY = this.config.jumpForce;
                    this.player.isJumping = true;
                    this.sounds.jump.play();
                }
                break;
        }
    }

    reset() {
        // 玩家状态
        this.player = {
            x: 50,
            y: 50,
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0,
            isJumping: false
        };

        // 加载关卡
        this.loadLevel(this.currentLevel);

        // 初始化收集物品
        this.stars = [];
        this.generateStars();

        // 初始化游戏状态
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
    }

    loadLevel(level) {
        // 基础平台（地面）
        this.platforms = [
            { x: 0, y: this.canvas.height - 30, width: this.canvas.width, height: 30 }
        ];

        // 根据关卡添加不同的平台
        switch(level) {
            case 1:
                this.platforms.push(
                    { x: 100, y: 400, width: 200, height: 20 },
                    { x: 300, y: 300, width: 200, height: 20 },
                    { x: 50, y: 200, width: 200, height: 20 }
                );
                break;
            case 2:
                this.platforms.push(
                    { x: 150, y: 450, width: 100, height: 20 },
                    { x: 400, y: 350, width: 100, height: 20 },
                    { x: 100, y: 250, width: 100, height: 20 },
                    { x: 400, y: 150, width: 100, height: 20 }
                );
                break;
            case 3:
                this.platforms.push(
                    { x: 50, y: 500, width: 80, height: 20 },
                    { x: 200, y: 400, width: 80, height: 20 },
                    { x: 350, y: 300, width: 80, height: 20 },
                    { x: 500, y: 200, width: 80, height: 20 }
                );
                break;
        }

        // 添加移动平台
        this.movingPlatforms = [];
        if (level >= 2) {
            this.movingPlatforms.push({
                x: 200,
                y: 350,
                width: 100,
                height: 20,
                startX: 200,
                endX: 400,
                speed: 2,
                direction: 1
            });
        }
    }

    generateStars() {
        // 在每个平台上方生成星星
        this.platforms.forEach(platform => {
            if (platform.y > 50) { // 不在最底部平台生成
                this.stars.push({
                    x: platform.x + platform.width/2 - 10,
                    y: platform.y - 40,
                    width: 20,
                    height: 20,
                    collected: false
                });
            }
        });
    }
}

// 游戏启动
window.onload = () => {
    const game = new Game();
}; 