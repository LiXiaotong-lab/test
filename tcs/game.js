// 获取画布和上下文
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let score = 0;

// 添加游戏状态配置
const GAME_STATES = {
  RUNNING: "running",
  PAUSED: "paused",
  OVER: "over",
};
let gameState = GAME_STATES.RUNNING;

const SPEED_CONFIG = {
  BASE: 100,
  MIN: 50,
  MAX: 150,
  CHANGE_RATE: 2,
};
let currentSpeed = SPEED_CONFIG.BASE;
let targetSpeed = SPEED_CONFIG.BASE;

// 蛇的初始位置和速度
let snake = [{ x: 10, y: 10 }];
let velocityX = 0;
let velocityY = 0;

// 食物相关配置
const FOOD_TYPES = {
  NORMAL: { color: "#e74c3c", points: 10, probability: 0.7 },
  GOLDEN: { color: "#f1c40f", points: 30, probability: 0.15 },
  SPEED: { color: "#3498db", points: 15, probability: 0.1 },
  BONUS: { color: "#9b59b6", points: 50, probability: 0.05 },
};

// 食物相关变量
let food = {
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount),
  type: FOOD_TYPES.NORMAL,
};

// 游戏主循环
function gameLoop() {
  if (gameState === GAME_STATES.RUNNING) {
    updateSnake();
    if (checkGameOver()) {
      gameState = GAME_STATES.OVER;
      alert("游戏结束！得分：" + score);
      resetGame();
      return;
    }

    // 平滑速度变化
    if (currentSpeed !== targetSpeed) {
      currentSpeed +=
        currentSpeed > targetSpeed
          ? -SPEED_CONFIG.CHANGE_RATE
          : SPEED_CONFIG.CHANGE_RATE;
    }

    clearCanvas();
    checkFoodCollision();
    drawFood();
    drawSnake();
  }
  setTimeout(gameLoop, currentSpeed);
}

// 更新蛇的位置
function updateSnake() {
  // 计算新的头部位置
  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
  snake.unshift(head);
  if (!checkFoodCollision()) {
    snake.pop();
  }
}

// 检查是否吃到食物
function checkFoodCollision() {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    score += food.type.points;
    scoreElement.textContent = score;

    // 特殊效果
    if (food.type === FOOD_TYPES.SPEED) {
      targetSpeed = SPEED_CONFIG.MIN;
      setTimeout(() => {
        targetSpeed = SPEED_CONFIG.BASE;
      }, 5000);
    }

    // 添加视觉反馈
    createEatingEffect(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      food.type.color
    );
    generateNewFood();
    return true;
  }
  return false;
}

// 检查游戏是否结束
function checkGameOver() {
  // 撞墙
  if (
    snake[0].x < 0 ||
    snake[0].x >= tileCount ||
    snake[0].y < 0 ||
    snake[0].y >= tileCount
  ) {
    return true;
  }

  // 撞到自己
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  return false;
}

// 清空画布
function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 绘制食物
function drawFood() {
  ctx.fillStyle = food.type.color;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 如果是特殊食物，添加闪烁效果
  if (food.type !== FOOD_TYPES.NORMAL) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 添加光晕效果
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = food.type.color;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// 生成新食物
function generateNewFood() {
  // 随机选择食物类型
  const random = Math.random();
  let accumulatedProbability = 0;

  for (const type of Object.values(FOOD_TYPES)) {
    accumulatedProbability += type.probability;
    if (random <= accumulatedProbability) {
      food.type = type;
      break;
    }
  }

  // 随机位置
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  // 确保食物不会出现在蛇身上
  while (
    snake.some((segment) => segment.x === food.x && segment.y === food.y)
  ) {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
  }
}

// 绘制蛇
function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      // 绘制蛇头
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 绘制眼睛
      ctx.fillStyle = "white";
      const eyeSize = 4;
      // 根据移动方向确定眼睛位置
      let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

      if (velocityX === 1) {
        // 向右
        leftEyeX = segment.x * gridSize + gridSize - 8;
        leftEyeY = segment.y * gridSize + 6;
        rightEyeX = segment.x * gridSize + gridSize - 8;
        rightEyeY = segment.y * gridSize + gridSize - 10;
      } else if (velocityX === -1) {
        // 向左
        leftEyeX = segment.x * gridSize + 8;
        leftEyeY = segment.y * gridSize + 6;
        rightEyeX = segment.x * gridSize + 8;
        rightEyeY = segment.y * gridSize + gridSize - 10;
      } else if (velocityY === -1) {
        // 向上
        leftEyeX = segment.x * gridSize + 6;
        leftEyeY = segment.y * gridSize + 8;
        rightEyeX = segment.x * gridSize + gridSize - 10;
        rightEyeY = segment.y * gridSize + 8;
      } else {
        // 向下或静止
        leftEyeX = segment.x * gridSize + 6;
        leftEyeY = segment.y * gridSize + gridSize - 8;
        rightEyeX = segment.x * gridSize + gridSize - 10;
        rightEyeY = segment.y * gridSize + gridSize - 8;
      }

      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
      ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // 绘制瞳孔
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize / 2, 0, Math.PI * 2);
      ctx.arc(rightEyeX, rightEyeY, eyeSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 绘制蛇身，使用渐变色
      const gradient = ctx.createRadialGradient(
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        0,
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        gridSize / 2
      );
      gradient.addColorStop(0, "#27ae60");
      gradient.addColorStop(1, "#2ecc71");
      ctx.fillStyle = gradient;

      // 绘制圆形的蛇身
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// 键盘控制
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (gameState === GAME_STATES.RUNNING) {
      gameState = GAME_STATES.PAUSED;
      drawPauseScreen();
    } else if (gameState === GAME_STATES.PAUSED) {
      gameState = GAME_STATES.RUNNING;
    }
    return;
  }

  if (gameState !== GAME_STATES.RUNNING) return;

  switch (e.key) {
    case "ArrowUp":
      if (velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
      }
      break;
    case "ArrowDown":
      if (velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
      }
      break;
    case "ArrowLeft":
      if (velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
      }
      break;
    case "ArrowRight":
      if (velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
      }
      break;
  }
});

// 暂停画面
function drawPauseScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("游戏暂停", canvas.width / 2, canvas.height / 2);
  ctx.font = "20px Arial";
  ctx.fillText("按 ESC 继续", canvas.width / 2, canvas.height / 2 + 40);
}

// 食物吃掉效果
function createEatingEffect(x, y, color) {
  const particles = [];
  const particleCount = 8;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    particles.push({
      x: x,
      y: y,
      dx: Math.cos(angle) * 2,
      dy: Math.sin(angle) * 2,
      alpha: 1,
    });
  }

  function animateParticles() {
    particles.forEach((particle) => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.alpha -= 0.05;

      if (particle.alpha > 0) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(particle.alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      }
    });

    if (particles.some((p) => p.alpha > 0)) {
      requestAnimationFrame(animateParticles);
    }
  }

  animateParticles();
}

// 重置游戏
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocityX = 0;
  velocityY = 0;
  score = 0;
  currentSpeed = SPEED_CONFIG.BASE;
  targetSpeed = SPEED_CONFIG.BASE;
  gameState = GAME_STATES.RUNNING;
  scoreElement.textContent = score;
  generateNewFood();
  gameLoop();
}

// 开始游戏
gameLoop();
