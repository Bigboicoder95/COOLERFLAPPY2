/* -------------------------------------------------------
   ENGINE & UTILS (Ported from GBSGame.java)
   -------------------------------------------------------
*/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function keyDown(key) {
    return keys[key] === true;
}

// Math Helper to replicate Java 21 Math.clamp
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

// Asset Loading
const images = {};
function loadImage(name, src) {
    const img = new Image();
    img.src = src;
    images[name] = img;
}

// Load Assets defined in Java files
loadImage('bird', 'bird.png');
loadImage('background', 'background.png');
loadImage('bottom_pipe', 'bottom_pipe.png');
loadImage('top_pipe', 'top_pipe.png'); 

/* -------------------------------------------------------
   CLASS: Bird (Ported from Bird.java)
   -------------------------------------------------------
*/
class Bird {
    constructor() {
        this.height = 285;
        this.velocity = 0;
        this.speed = 210;
        this.x = 100;
        this.colorIntensity = 0;
        // Gravity Factor is static in Java, we attach it to the class prototype below
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

    updateIntensity(score) {
        // commented out in source, keeping logic same
        // this.colorIntensity = score; 
    }

    update(dt, m) {
        // velocity += (9.81*150*m*dt);
        this.velocity += (9.81 * 150 * m * dt);
        // height += (velocity*dt)*gravityF;
        this.height += (this.velocity * dt) * Bird.gravityF;
        
        this.speed += 60 * dt;
        this.colorIntensity += 0.6 * dt;
    }

    // Porting draw(Graphics g, int x, int n)
    draw(ctx, x, n) {
        let r, g, b;
        
        // Math logic from Java:
        // Math.clamp(255-(int)colorIntensity*35, 0, 255)
        // Math.clamp(255 - 200 + 2*x, 0, 255)
        // Math.clamp((int)colorIntensity*35, 0, 255)

        const cInt = Math.floor(this.colorIntensity);

        if (n === 1) {
            r = clamp(255 - cInt * 35, 0, 255);
            g = clamp(255 - 200 + 2 * this.x, 0, 255); // using this.x (which is 100)
            b = clamp(cInt * 35, 0, 255);
        }
        if (n === 2) {
            r = clamp(255 - 200 + 2 * this.x, 0, 255);
            g = clamp(255 - cInt * 35, 0, 255);
            b = clamp(cInt * 35, 0, 255);
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // The Java code draws the image, but overlays a color filter? 
        // Actually, the Java code uses `setColor` then `drawImage`. 
        // In standard Java AWT, `setColor` doesn't tint `drawImage` unless using specific composite modes.
        // However, looking at `drawR` vs `draw`, `draw` uses the calculated color for the TEXT below it.
        // Let's stick to the drawing order in Java.

        if(images['bird']) {
            ctx.drawImage(images['bird'], x, this.height);
        }

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(n + "", this.x, this.height + 30);
    }

    // Porting drawR(Graphics g)
    drawR(ctx) {
        if (this.colorIntensity > 7.3) {
            this.colorIntensity = 0;
        }
        
        // Logic to calculate color (though in AWT without filling a rect, this might not show anything 
        // visible besides text or primitives drawn AFTER. But we replicate logic).
        const cInt = Math.floor(this.colorIntensity);
        const r = clamp(cInt * 35, 0, 255);
        const gVal = clamp(255 - 200 + 2 * this.x, 0, 255);
        const b = clamp(255 - cInt * 35, 0, 255);

        ctx.fillStyle = `rgb(${r},${gVal},${b})`;
        
        if(images['bird']) {
            ctx.drawImage(images['bird'], this.x, this.height);
        }
    }

    static flipGravity(f) {
        Bird.gravityF = f;
    }
}
Bird.gravityF = 1;

/* -------------------------------------------------------
   CLASS: BirdShadow (Ported from BirdShadow.java)
   -------------------------------------------------------
*/
class BirdShadow {
    constructor(spawnHeight) {
        this.x = 80; // Hardcoded in constructor of Java file
        this.height = spawnHeight;
        this.velocity = 0;
        this.speed = 210;
        this.colorIntensity = 0;
    }

    checkForSelfDelete(list) {
        if (this.x < -1) {
            const index = list.indexOf(this);
            if (index > -1) {
                list.splice(index, 1);
            }
        }
    }

    updateIntensity(score) {
        this.colorIntensity = score;
    }

    update(dt, m, y) {
        this.x -= 300 * dt;
    }

    draw(ctx, n) {
        const cInt = Math.floor(this.colorIntensity);
        let r, g, b;

        if (n === 1) {
            r = clamp(255 - cInt * 35, 0, 255);
            g = clamp(255 - 200 + 2 * this.x, 0, 255);
            b = clamp(cInt * 35, 0, 255);
        }
        if (n === 2) {
            r = clamp(255 - 200 + 2 * this.x, 0, 255);
            g = clamp(255 - cInt * 35, 0, 255);
            b = clamp(cInt * 35, 0, 255);
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(this.x + 5, this.height, 20, 20);
        
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(n + "", this.x, this.height + 30);
    }
}

/* -------------------------------------------------------
   CLASS: Pipes (Ported from Pipes.java)
   -------------------------------------------------------
*/
class Pipes {
    constructor(initialX) {
        this.x = initialX;
        this.yUp = 200;
        this.yDown = 400;
        this.randomizeHeight();
    }

    randomizeHeight() {
        // double y = (150 + (Math.random()*(450 - 150 + 1)));
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

    collideWith(bir) {
        // if (((x <= 130) && (100 <= x+50) && ((bir.height+30) >= yDown)) || ((x <= 130) && (100 <= x+50) &&  (bir.height <= (yUp)))){
        if (((this.x <= 130) && (100 <= this.x + 50) && ((bir.height + 30) >= this.yDown)) || 
            ((this.x <= 130) && (100 <= this.x + 50) && (bir.height <= (this.yUp)))) {
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = "green"; // Fallback if image fails
        // g.drawImage(image1,(int) x,(int) yDown,null);
        if(images['bottom_pipe']) {
            ctx.drawImage(images['bottom_pipe'], this.x, this.yDown);
        }
        // g.drawImage(image2,(int) x,(int) (yUp - 500),null);
        if(images['top_pipe']) {
            ctx.drawImage(images['top_pipe'], this.x, this.yUp - 500);
        }
    }

    update(dt, bir) {
        this.x -= (bir.speed * dt);
        if (this.x < -50) {
            this.x = 950;
            this.x -= (210 * dt);
            this.randomizeHeight();
        }
    }
}

/* -------------------------------------------------------
   MAIN GAME CLASS: Flappy (Ported from Flappy.java)
   -------------------------------------------------------
*/

// Game Variables
const bir = new Bird();
const bir2 = new Bird();
let count1 = 0;
let count2 = 0;
let gameResets = 0;

let shadows = [];
let shadows2 = [];

const p1 = new Pipes(300);
const p2 = new Pipes(600);
const p3 = new Pipes(800);
const p4 = new Pipes(1000);
const p5 = new Pipes(1200);

let gameOver = false;
let score = 0;
let timer = 0;
const timerOffset = 0.0075;

// Setup
function setup() {
    score = 0;
    timer = 0;
}

// Update Loop
function update(dt) {
    if (keyDown("r")) {
        bir.reset();
        bir2.reset();
        score = 0;
        p1.reset(300);
        p2.reset(600);
        p3.reset(800);
        p4.reset(1000);
        p5.reset(1200);
        gameOver = false;
        shadows = [];
        shadows2 = [];
    }
        if(count1 == 10 || count2 == 10){
            count1 = 0;
            count2 = 0;

        gameResets++;
        if (count1 === 10 || count2 === 10) {
            count1 = 0;
            count2 = 0;
            gameResets = 0;
        }
    }

    timer += dt;
    if (timer > timerOffset) {
        shadows.push(new BirdShadow(bir.height));
        shadows2.push(new BirdShadow(bir2.height));
    }

    if (gameOver) {
        return;
    }

    if (gameResets % 2 !== 0) {
        Bird.flipGravity(-1);

        if (keyDown(",")) {
            bir.jump(-400);
        }
        if (keyDown("t")) {
            bir2.jump(-400);
        }
    } else {
        Bird.flipGravity(1);
        if (keyDown(",")) {
            bir.jump(-400);
        }
        if (keyDown("t")) {
            bir2.jump(-400);
        }
    }

    bir.update(dt, 1);
    bir2.update(dt, 1);

    // Update Shadows (backwards loop for safe removal)
    for (let i = shadows.length - 1; i >= 0; i--) {
        const shadow = shadows[i];
        shadow.update(dt, 1, 0);
        shadow.checkForSelfDelete(shadows);
    }
    for (let i = shadows2.length - 1; i >= 0; i--) {
        const shadow2 = shadows2[i];
        shadow2.update(dt, 1, 0);
        shadow2.checkForSelfDelete(shadows2);
    }

    p1.update(dt, bir);
    p2.update(dt, bir);
    p3.update(dt, bir);
    p4.update(dt, bir);
    p5.update(dt, bir);

    score += dt;
    bir.isOffScreen();
    bir2.isOffScreen();
}

// Draw Loop
function draw() {
    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background (repeated 3 times as in source)
    if(images['background']) {
        ctx.drawImage(images['background'], 0, 0);
        ctx.drawImage(images['background'], 200, 0);
        ctx.drawImage(images['background'], 400, 0);
    }

    bir.updateIntensity(score);
    bir.drawR(ctx);
    bir2.updateIntensity(score);
    bir2.drawR(ctx);

    // Collision Logic Helper
    const checkCollision = (pipe) => {
        if (pipe.collideWith(bir) || pipe.collideWith(bir2)) {
            if (gameOver === false) {
                if (pipe.collideWith(bir)) {
                    count2++;
                } else {
                    count1++;
                }
            }
            ctx.fillStyle = "red"; // g.setColor(Color.RED) sets state for next draws usually, but here likely intended for debug or text?
            // In the Java code, setting Color.RED right before gameOver = true mostly affects lines drawn *after* this block if they don't set their own color.
            gameOver = true;
            gameResets++;
        }
    };

    checkCollision(p1);
    checkCollision(p2);
    checkCollision(p3);
    checkCollision(p4);
    checkCollision(p5);

    bir.draw(ctx, 100, 1);
    bir2.draw(ctx, 100, 2);

    shadows.forEach(s => {
        s.updateIntensity(score);
        s.draw(ctx, 1);
    });
    shadows2.forEach(s => {
        s.updateIntensity(score);
        s.draw(ctx, 2);
    });

    // Pipe Drawing
    // g.setColor(Color.YELLOW); (Unused in JS unless we draw primitives)
    // g.setColor(Color.GREEN);
    p1.draw(ctx);
    p2.draw(ctx);
    p3.draw(ctx);
    p4.draw(ctx);
    p5.draw(ctx);
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
            if(count1<10 && count2<10){
            ctx.strokeText("GAME OVER", 280, 300);
            ctx.fillText("GAME OVER", 280, 300);
            }
            if (count1 == 10){
            ctx.strokeText("PLAYER 1 WINS", 250, 300);
            ctx.fillText("PLAYER 1 WINS", 250, 300);
            }
            
            if (count2 == 10){
            ctx.strokeText("PLAYER 2 WINS", 250, 300);
            ctx.fillText("PLAYER 2 WINS", 250, 300);
            }
            ctx.font = "20px sans-serif";
            ctx.fillStyle = "white";
            ctx.fillText("Press 'r' to reset", 320, 340);
        }
    }

// Main Game Loop (Replaces Runnable run())
let lastTime = 0;
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds (dt)
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(loop);
}

// Start
setup();
requestAnimationFrame(loop);