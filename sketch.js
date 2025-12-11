// --- Load Images ---
    const birdImg = new Image();
    birdImg.src = 'bird.png';

    const topPipeImg = new Image();
    topPipeImg.src = 'top_pipe.png';

    const bottomPipeImg = new Image();
    bottomPipeImg.src = 'bottom_pipe.png';

    const bgImg = new Image();
    bgImg.src = 'background.png';

    // --- Helper Functions ---
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // --- Input Handling ---
    const keys = {};
    const keyEvents = {}; 

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (!keyEvents[e.key]) {
            keyEvents[e.key] = true; 
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        keyEvents[e.key] = false;
    });

    function keyDown(key) {
        return keys[key] === true;
    }

    // --- Class: BirdShadow ---
    // Kept as original logic since no shadow image was provided
    class BirdShadow {
        constructor(spawnHeight) {
            this.x = 120;
            this.height = spawnHeight;
            this.speed = 210;
            this.velocity = 0;
            this.colorIntensity = 0;
        }

        update(dt) {
            this.x -= 300 * dt;
        }

        updateIntensity(score) {
            this.colorIntensity = score;
        }

        draw(ctx, n) {
            let r, g, b;
            
            // Color logic from Java
            let c1 = clamp(255 - Math.floor(this.colorIntensity * 35), 0, 255);
            let c2 = clamp(255 - 200 + 2 * this.x, 0, 255);
            let c3 = clamp(Math.floor(this.colorIntensity * 35), 0, 255);

            if (n === 1) {
                r = c1; g = c2; b = c3;
            } else if (n === 2) {
                r = c2; g = c1; b = c3;
            }

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(this.x+30, this.height, 30, 30);
            
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            ctx.fillText(n, this.x, this.height + 40); 
        }
    }

    // --- Class: Bird ---
    class Bird {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = 100;
            this.height = 285;
            this.velocity = 0;
            this.speed = 210;
            this.colorIntensity = 0;
        }

        jump(v) {
            this.velocity = v;
        }

        isOffScreen() {
            if (this.height > 570) {
                this.height = 570;
                this.velocity = 0;
            }
            if (this.height < 0) {
                this.height = 0;
            }
        }

        update(dt, m) {
            // Physics from Java: velocity += (9.81 * 150 * m * dt)
            this.velocity += (9.81 * 150 * m * dt);
            this.height += (this.velocity * dt);
            this.speed += 60 * dt;
            this.colorIntensity += 0.6 * dt;
        }

        updateIntensity(score) {
            // Keeps intensity logic for shadows/background reset
        }

        draw(ctx, xPos, n) {
            // Replaced fillRect with drawImage
            // Drawn at 30x30 to match original hitbox size
            ctx.drawImage(birdImg, xPos+5, this.height, 20, 20);

            // Keep text identifier to distinguish P1 vs P2
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            ctx.fillText(n, this.x, this.height + 42); 
        }

        drawR(ctx) {
            // Background Logic
            if (this.colorIntensity > 7.3) {
                this.colorIntensity = 0;
            }
            // Instead of drawing a solid color rect, we draw the background image
            ctx.drawImage(bgImg, 0, 0, 800, 600);
        }
    }

    // --- Class: Pipes ---
    class Pipes {
        constructor(initialX) {
            this.x = initialX;
            this.yUp = 200;
            this.yDown = 400;
            this.randomizeHeight();
        }

        randomizeHeight() {
            let y = (150 + (Math.random() * (450 - 150 + 1)));
            this.yUp = y - 150;
            this.yDown = y + 150;
        }

        reset(initialX) {
            this.x = initialX;
            this.yUp = 200;
            this.yDown = 400;
            this.randomizeHeight();
        }

        collideWith(bird) {
            let birdX = 100; // Bird is fixed at 100 visual X
            // Precise hitbox logic from Java
            if (
                ((this.x <= 130) && (birdX <= this.x + 50) && ((bird.height + 30) >= this.yDown)) ||
                ((this.x <= 130) && (birdX <= this.x + 50) && (bird.height <= this.yUp))
            ) {
                return true;
            }
            return false;
        }

        draw(ctx) {
            // Draw Bottom Pipe
            ctx.drawImage(bottomPipeImg, this.x, this.yDown, 50, 500);
            
            // Draw Top Pipe
            // (yUp - 500) calculates the top-left corner of the image so the bottom of the pipe lands at yUp
            ctx.drawImage(topPipeImg, this.x, (this.yUp - 500), 50, 500);
        }

        update(dt, bird) {
            this.x -= (bird.speed * dt);
            if (this.x < -50) {
                this.x = 950;
                this.x -= (210 * dt); 
                this.randomizeHeight();
            }
        }
    }

    // --- Main Game Logic (Flappy class) ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Game Variables
    let bir = new Bird();
    let bir2 = new Bird();
    let count1 = 0;
    let count2 = 0;

    let shadows = [];
    let shadows2 = [];

    // Pipes
    let p1 = new Pipes(300);
    let p2 = new Pipes(600);
    let p3 = new Pipes(800);
    let p4 = new Pipes(1000);
    let p5 = new Pipes(1200);
    let pipes = [p1, p2, p3, p4, p5];

    let gameOver = false;
    let score = 0;
    let timer = 0;
    const timerOffset = 0.0075;

    function resetGame() {
        bir.reset();
        bir2.reset();
        score = 0;
        timer = 0;
        p1.reset(300);
        p2.reset(600);
        p3.reset(800);
        p4.reset(1000);
        p5.reset(1200);
        gameOver = false;
        shadows = [];
        shadows2 = [];
    }

    let lastTime = 0;

    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000; 
        lastTime = timestamp;

        update(dt);
        draw();

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        if (keyDown("r")) {
            resetGame();
        }

        timer += dt;
        if (timer > timerOffset) {
            shadows.push(new BirdShadow(bir.height));
            shadows2.push(new BirdShadow(bir2.height));
        }

        if (gameOver) return;

        if (keyDown(",")) {
            bir.jump(-400);
        }

        if (keyDown("t")) {
            bir2.jump(-400);
        }

        bir.update(dt, 1);
        bir2.update(dt, 1);

        shadows.forEach(s => s.update(dt));
        shadows2.forEach(s => s.update(dt));

        shadows = shadows.filter(s => s.x >= -1);
        shadows2 = shadows2.filter(s => s.x >= -1);

        pipes.forEach(p => p.update(dt, bir));

        score += dt;
        bir.isOffScreen();
        bir2.isOffScreen();
    }

    function draw() {
        // Draw Background (managed by Bird class logic in original, preserving structure)
        bir.updateIntensity(score);
        bir.drawR(ctx); 
        
        bir2.updateIntensity(score);
        bir2.drawR(ctx); // Redraws background, effectively clearing screen

        let collisionDetected = false;

        pipes.forEach(p => {
            if (p.collideWith(bir) || p.collideWith(bir2)) {
                if (!gameOver) {
                    if (p.collideWith(bir)) count2++;
                    else count1++;
                }
                collisionDetected = true;
                gameOver = true;
            }
        });

        // Draw Birds
        bir.draw(ctx, 100, 1);
        bir2.draw(ctx, 100, 2);

        // Draw Shadows (Original Logic)
        shadows.forEach(s => {
            s.updateIntensity(score);
            s.draw(ctx, 1);
        });
        shadows2.forEach(s => {
            s.updateIntensity(score);
            s.draw(ctx, 2);
        });

        // Draw Pipes (Images)
        pipes.forEach(p => p.draw(ctx));

        // Draw UI
        ctx.fillStyle = "black";
        ctx.font = "bold 24px sans-serif";
        // Adding a white stroke to make text readable against any background image
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        
        ctx.strokeText("Player 1: " + count1, 300, 50);
        ctx.fillText("Player 1: " + count1, 300, 50);
        
        ctx.strokeText("Player 2: " + count2, 300, 80);
        ctx.fillText("Player 2: " + count2, 300, 80);
        
        if(gameOver) {
            ctx.fillStyle = "red";
            ctx.font = "bold 40px sans-serif";
            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            
            ctx.strokeText("GAME OVER", 280, 300);
            ctx.fillText("GAME OVER", 280, 300);
            
            ctx.font = "20px sans-serif";
            ctx.fillStyle = "white";
            ctx.fillText("Press 'r' to reset", 320, 340);
        }
    }

    requestAnimationFrame(gameLoop);
