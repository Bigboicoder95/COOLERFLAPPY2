// --- Helper Functions ---
    // Java 21 Math.clamp replica
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // --- Input Handling ---
    const keys = {};
    const keyEvents = {}; // To track single press events like the Java "keyPressed" logic

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        // Logic to emulate Java's unique key press vs key down handling
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

    // Checks if key was pressed this frame (and consumes the event)
    function checkKeyPressed(key) {
        if (keyEvents[key]) {
            // In the Java logic, it seems to clear immediately after checking in some contexts,
            // or relies on the loop. Here we act as a "trigger".
            keyEvents[key] = false; 
            return true;
        }
        return false;
    }

    // --- Class: BirdShadow ---
    class BirdShadow {
        constructor(spawnHeight) {
            this.x = 100;
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
            ctx.fillRect(this.x, this.height, 30, 30);
            
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            ctx.fillText(n, this.x, this.height + 40); // +40 to align text roughly below
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
            // The Java method body was commented out in Bird.java, but called in Flappy.java
            // logic is handled inside update usually or ignored as per source.
        }

        draw(ctx, xPos, n) {
            let r, g, b;
            
            let c1 = clamp(255 - Math.floor(this.colorIntensity * 35), 0, 255);
            let c2 = clamp(255 - 200 + 2 * xPos, 0, 255);
            let c3 = clamp(Math.floor(this.colorIntensity * 35), 0, 255);

            if (n === 1) {
                r = c1; g = c2; b = c3;
            } else if (n === 2) {
                r = c2; g = c1; b = c3;
            }

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(xPos, this.height, 30, 30);

            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            // Drawing the number slightly below the bird
            ctx.fillText(n, this.x, this.height + 42); 
        }

        drawR(ctx) {
            if (this.colorIntensity > 7.3) {
                this.colorIntensity = 0;
            }
            let r = clamp(Math.floor(this.colorIntensity * 35), 0, 255);
            let g = clamp(255 - 200 + 2 * this.x, 0, 255);
            let b = clamp(255 - Math.floor(this.colorIntensity * 35), 0, 255);

            // This draws the background color based on intensity
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, 800, 600);
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
            // Java: double y = (150 + (Math.random()*(450 - 150 + 1)));
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
            // Precise collision logic from Java source
            // if (((x <= 130) && (100 <= x+50) && ((bir.height+30) >= yDown)) || ((x <= 130) && (100 <= x+50) &&  (bir.height <= (yUp))))
            let birdX = 100; // Bird is fixed at 100 visual X
            if (
                ((this.x <= 130) && (birdX <= this.x + 50) && ((bird.height + 30) >= this.yDown)) ||
                ((this.x <= 130) && (birdX <= this.x + 50) && (bird.height <= this.yUp))
            ) {
                return true;
            }
            return false;
        }

        draw(ctx) {
            ctx.fillStyle = "green";
            // Lower pipe
            ctx.fillRect(this.x, this.yDown, 50, 500);
            // Upper pipe
            ctx.fillRect(this.x, (this.yUp - 500), 50, 500);
        }

        update(dt, bird) {
            this.x -= (bird.speed * dt);
            if (this.x < -50) {
                this.x = 950;
                this.x -= (210 * dt); // adjustment from source
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

    // Reset function
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
        // Note: counts are not reset here in the Java source, so they persist
    }

    // Game Loop
    let lastTime = 0;

    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000; // Delta time in seconds
        lastTime = timestamp;

        update(dt);
        draw();

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        // Handle Reset
        if (keyDown("r")) {
            resetGame();
        }

        timer += dt;
        if (timer > timerOffset) {
            shadows.push(new BirdShadow(bir.height));
            shadows2.push(new BirdShadow(bir2.height));
            // Reset timer logic? The java code doesn't explicitly reset 'timer' in the loop
            // It says "if (timer > timerOffset)", but timer keeps growing.
            // However, in Java "timer += dt; if(timer > ...)" implies it adds ONCE if it doesn't reset.
            // But looking at the Java code provided: `timer` is cumulative. 
            // WAIT: The java code `if (timer > timerOffset)` will be TRUE every single frame after the first 0.0075s.
            // This means shadows are added EVERY frame after start. We will replicate that behavior.
        }

        if (gameOver) return;

        // Player 1 Jump (comma)
        if (keyDown(",")) {
            // We need to ensure this doesn't trigger every frame if held, 
            // but the Java code uses `super.keyDown` which checks `keys.contains`. 
            // Usually jump is a trigger. 
            // However, looking at GBSGame.java, `keyDown` returns true if key is in list.
            // If the user holds comma, the bird will fly up continuously (jetpack style) or spaz.
            // Standard flappy bird is a trigger. 
            // Let's use the `checkKeyPressed` helper which consumes the event to allow tapping.
            // BUT, the Java code uses `keyDown` (continuous) not `keyPressed` (discrete) in `Flappy.java`.
            // "if (super.keyDown(",")) { bir.jump(-400); }"
            // If I hold it in Java, velocity is set to -400 every frame. This creates a "hover" or "fly" effect.
            // We will stick to `keyDown` to match the source exactly.
            bir.jump(-400);
        }

        // Player 2 Jump (t)
        if (keyDown("t")) {
            bir2.jump(-400);
        }

        // Update Birds
        bir.update(dt, 1);
        bir2.update(dt, 1);

        // Update Shadows
        shadows.forEach(s => s.update(dt));
        shadows2.forEach(s => s.update(dt));

        // Remove old shadows (Java: `if (this.x < -1)`)
        shadows = shadows.filter(s => s.x >= -1);
        shadows2 = shadows2.filter(s => s.x >= -1);

        // Update Pipes
        pipes.forEach(p => p.update(dt, bir));

        score += dt;
        bir.isOffScreen();
        bir2.isOffScreen();
    }

    function draw() {
        // Clear screen / Draw Background
        // The Java code draws the background via `bir.drawR(g)` and `bir2.drawR(g)`.
        // The last one drawn will dictate the background color.
        bir.updateIntensity(score); // Just updates internal state if implemented
        bir.drawR(ctx); 
        
        bir2.updateIntensity(score);
        bir2.drawR(ctx); // This paints over the previous one

        // Check Collisions and Draw Red if Game Over
        // We check all pipes against both birds
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

        if (collisionDetected) {
            ctx.fillStyle = "red";
            // We don't fillRect here because we want to see the game frozen, 
            // but the Java code says `g.setColor(Color.RED); gameOver = true;` 
            // It actually doesn't draw a red screen, just sets color for subsequent draws maybe?
            // Ah, looking at `drawR`, it fills screen. 
            // If collision happens, we just set flag.
            // To visualize "Game Over" clearly let's add a tint or text, 
            // though strict translation keeps it subtle.
        }

        // Draw Birds
        bir.draw(ctx, 100, 1);
        bir2.draw(ctx, 100, 2);

        // Draw Shadows
        shadows.forEach(s => {
            s.updateIntensity(score);
            s.draw(ctx, 1);
        });
        shadows2.forEach(s => {
            s.updateIntensity(score);
            s.draw(ctx, 2);
        });

        // Draw Pipes
        pipes.forEach(p => p.draw(ctx));

        // Draw Score Text
        ctx.fillStyle = "black";
        ctx.font = "20px sans-serif";
        ctx.fillText("Player 1: " + count1, 300, 50);
        ctx.fillText("Player 2: " + count2, 300, 80);
        
        if(gameOver) {
            ctx.fillStyle = "red";
            ctx.font = "bold 30px sans-serif";
            ctx.fillText("GAME OVER", 300, 300);
            ctx.font = "20px sans-serif";
            ctx.fillText("Press 'r' to reset", 300, 330);
        }
    }

    // Start
    requestAnimationFrame(gameLoop);
