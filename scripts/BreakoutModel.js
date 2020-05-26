"use strict";

function BreakoutModel() {
    var gameArea = document.getElementById("game_area");
    var gameWidth;
    var gameHeight;
    var paddle = {};
    var ball = {};
    var blocks = new Array();
    var score = 0;
    var scoreToAdd;
    var highscore = 0;
    var isNewHighscore = false;
    var lose = false;

    var HIT = {
        NO_HIT: 0,
        TOP: 1,
        BOTTOM: 2,
        LEFT: 3,
        RIGHT: 4,
        TOP_LEFT: 5,
        TOP_RIGHT: 6,
        BOTTOM_LEFT: 7,
        BOTTOM_RIGHT: 8,
        MIDDLE: 9
    };

    this.initializeModel = function () {
        // Game board
        gameHeight = gameArea.clientHeight;
        gameWidth = gameArea.clientWidth;

        // Paddle
        paddle.width = gameWidth / 5;
        paddle.height = gameHeight / 200 * 3;
        paddle.x = (gameWidth / 2) - (paddle.width / 2);
        paddle.y = gameHeight / 100 * 97;
        paddle.speed = 0;

        // Ball
        ball.radius = Math.min(gameWidth, gameHeight) / 100 * 2;
        ball.x = (gameWidth / 2) - (ball.radius / 2);
        ball.y = (gameHeight / 2) - (ball.radius / 2);

        if (Math.floor(Math.random() * 10) <= 4) {
            ball.vx = -19;
        }
        else {
            ball.vx = 19;
        }

        ball.vy = -50;

        // Blocks
        var rowBlocks = 4;
        var columnBlocks = 13;
        var blockWidth = gameWidth / 14;
        var blockHeight = gameHeight / 200 * 5;
        var blockPaddingX = blockWidth / 14;
        var blockPaddingY = blockHeight / 5;
        var x;
        var y;
        var colors = ["#FF0000" , "#00FF00", "#0000FF", "#FFFF00"];

        for (var r = 0 ; r < rowBlocks ; r++) {
            blocks[r] = new Array();

            for (var c = 0 ; c < columnBlocks ; c++) {
                x = blockPaddingX + (c * (blockWidth + blockPaddingX));
                y = blockPaddingY + (r * (blockHeight + blockPaddingY));
                blocks[r][c] = new Block(x, y, blockWidth, blockHeight, colors[r], true);
            }
        }

        scoreToAdd = 1000 / (rowBlocks * columnBlocks);
        this.loadHighscore();
    };

    this.updateModel = function (gamma) {
        this.movePaddle(gamma);
        this.moveBall();
    };

    this.getScore = function () {
        return score;
    };

    this.getHighscore = function () {
        return highscore;
    };

    this.saveHighscore = function (newHighscore) {
        highscore = newHighscore;
        isNewHighscore = true;

        if (testLocalStorage() === true) {
            localStorage.setItem("highscore", highscore);
        }
    };

    this.isNewHighscore = function () {
        return isNewHighscore;
    };

    this.loadHighscore = function () {
        if (testLocalStorage() === true) {
            var temp = localStorage.getItem("highscore");

            if (temp !== null) {
                highscore = parseInt(temp);
            }
        }
    };

    this.getPaddle = function() {
        return paddle;
    };

    this.getBall = function () {
        return ball;
    };

    this.getBlocks = function () {
        return blocks;
    };

    this.movePaddle = function (gamma) {
        if (gamma >= -5 && gamma <= 5) {
            gamma = 0;
        }

        paddle.speed = gamma / 10 * 2;
        paddle.x = paddle.x + paddle.speed;

        if (paddle.x <= 0) {
            paddle.x = 0;
        }
        else if ((paddle.x + paddle.width) >= gameWidth) {
            paddle.x = gameWidth - paddle.width;
        }
    };

    this.moveBall = function () {
        var x = ball.x + (ball.vx / 15); // 1/4 60fps
        var y = ball.y + (ball.vy / 15); // 1/4 60fps

        // Check collision with left wall
        var tempWall = x - ball.radius;

        if (tempWall < 0.0) {
            x = ball.radius;
            y = y + ((Math.abs(tempWall) * ball.vy) / ball.vx);
            ball.vx *= -1;
        }

        // Check collision with right wall
        tempWall = x + ball.radius;

        if (tempWall > gameWidth) {
            tempWall = tempWall - gameWidth;
            x = gameWidth - ball.radius;
            y = y - ((Math.abs(tempWall) * ball.vy) / ball.vx);
            ball.vx *= -1;
        }

        // Check collision with top wall
        tempWall = y - ball.radius;

        if (tempWall < 0.0) {
            x = x + ((Math.abs(tempWall) * ball.vx) / ball.vy);
            y = ball.radius;
            ball.vy *= -1;
        }

        // Check collision with bottom wall
        tempWall = y + ball.radius;

        if (tempWall > gameHeight) {
            tempWall = tempWall - gameHeight;
            x = x - ((Math.abs(tempWall) * ball.vx) / ball.vy);
            y = gameHeight - ball.radius;
            ball.vy *= -1;

            lose = true;
        }

        // Check collision with paddle
        var paddleHit = this.ballCollisionWithRect(x, y, paddle);

        if (paddleHit.hit !== HIT.NO_HIT) {
            if (paddleHit.hit === HIT.TOP) {
                x = x - ((paddleHit.deltaR * ball.vx) / ball.vy);
                y = y - paddleHit.deltaR;
                ball.vy *= -1;
            }
            else if (paddleHit.hit === HIT.BOTTOM) {
                x = x + ((paddleHit.deltaR * ball.vx) / ball.vy);
                y = y + paddleHit.deltaR;
                ball.vy *= -1;
            }
            else if (paddleHit.hit === HIT.LEFT) {
                x = x - paddleHit.deltaR;
                y = y - ((paddleHit.deltaR * ball.vy) / ball.vx);
                ball.vx *= -1;
            }
            else if (paddleHit.hit === HIT.RIGHT) {
                x = x + paddleHit.deltaR;
                y = y + ((paddleHit.deltaR * ball.vy) / ball.vx);
                ball.vx *= -1;
            }
            else if (paddleHit.hit === HIT.TOP_LEFT) {
                if (ball.vx > 0 && ball.vy > 0) {
                    offsetX = paddleHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                    x = x - offsetX;
                    y = y - ((offsetX * ball.vy) / ball.vx);
                    ball.vx *= -1;
                    ball.vy *= -1;
                }
            }
            else if (paddleHit.hit === HIT.TOP_RIGHT) {
                if (ball.vx < 0 && ball.vy > 0) {
                    offsetX = paddleHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                    x = x + offsetX;
                    y = y + ((offsetX * ball.vy) / ball.vx);
                    ball.vx *= -1;
                    ball.vy *= -1;
                }
            }
            else if (paddleHit.hit === HIT.BOTTOM_LEFT) {
                if (ball.vx > 0 && ball.vy < 0) {
                    offsetX = paddleHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                    x = x - offsetX;
                    y = y - ((offsetX * ball.vy) / ball.vx);
                    ball.vx *= -1;
                    ball.vy *= -1;
                }
            }
            else if (paddleHit.hit === HIT.BOTTOM_RIGHT) {
                if (ball.vx < 0 && ball.vy < 0) {
                    offsetX = paddleHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                    x = x + offsetX;
                    y = y + ((offsetX * ball.vy) / ball.vx);
                    ball.vx *= -1;
                    ball.vy *= -1;
                }
            }
        }

        // Check collisions with blocks
        for (var r = 0 ; r < blocks.length ; r++) {
            for (var c = 0 ; c < blocks[r].length ; c++) {
                var block = blocks[r][c];

                if (block.visibility === true) {
                    var blockHit = this.ballCollisionWithRect(x, y, block);
                    var offsetX;

                    if (blockHit.hit !== HIT.NO_HIT) {
                        if (blockHit.hit === HIT.TOP) {
                            x = x - ((blockHit.deltaR * ball.vx) / ball.vy);
                            y = y - blockHit.deltaR;
                            ball.vy *= -1;
                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.BOTTOM) {
                            x = x + ((blockHit.deltaR * ball.vx) / ball.vy);
                            y = y + blockHit.deltaR;
                            ball.vy *= -1;
                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.LEFT) {
                            x = x - blockHit.deltaR;
                            y = y - ((blockHit.deltaR * ball.vy) / ball.vx);
                            ball.vx *= -1;
                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.RIGHT) {
                            x = x + blockHit.deltaR;
                            y = y + ((blockHit.deltaR * ball.vy) / ball.vx);
                            ball.vx *= -1;
                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.TOP_LEFT) {
                            if (ball.vx > 0 && ball.vy > 0) {
                                offsetX = blockHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                                x = x - offsetX;
                                y = y - ((offsetX * ball.vy) / ball.vx);
                                ball.vx *= -1;
                                ball.vy *= -1;
                            }

                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.TOP_RIGHT) {
                            if (ball.vx < 0 && ball.vy > 0) {
                                offsetX = blockHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                                x = x + offsetX;
                                y = y + ((offsetX * ball.vy) / ball.vx);
                                ball.vx *= -1;
                                ball.vy *= -1;
                            }

                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.BOTTOM_LEFT) {
                            if (ball.vx > 0 && ball.vy < 0) {
                                offsetX = blockHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                                x = x - offsetX;
                                y = y - ((offsetX * ball.vy) / ball.vx);
                                ball.vx *= -1;
                                ball.vy *= -1;
                            }

                            block.visibility = false;
                            score += scoreToAdd;
                        }
                        else if (blockHit.hit === HIT.BOTTOM_RIGHT) {
                            if (ball.vx < 0 && ball.vy < 0) {
                                offsetX = blockHit.deltaR / (Math.sqrt(1 + ((ball.vx * ball.vx) / (ball.vy * ball.vy))));
                                x = x + offsetX;
                                y = y + ((offsetX * ball.vy) / ball.vx);
                                ball.vx *= -1;
                                ball.vy *= -1;
                            }

                            block.visibility = false;
                            score += scoreToAdd;
                        }
                    }
                }
            }
        }

        // Update highscore
        if (score > highscore) {
            this.saveHighscore(score);
        }

        // Update ball position
        ball.x = x;
        ball.y = y;
    };

    this.clamp = function (min, max, value) {
        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }
        else {
            return value;
        }
    };

    this.ballCollisionWithRect = function(x, y, rect) {
        var pointOnRectX = this.clamp(rect.x, (rect.x + rect.width), x);
        var pointOnRectY = this.clamp(rect.y, (rect.y + rect.height), y);
        var a;
        var b;
        var c;
        var dr;

        if (pointOnRectX === rect.x) {
            if (pointOnRectY === rect.y) { // Left top
                a = rect.x - x;
                b = rect.y - y;
                c = Math.sqrt((a * a) + (b * b));
                dr = ball.radius - c;

                if (dr >= 0) {
                    return {
                        hit: HIT.TOP_LEFT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
            else if (pointOnRectY === y) { // Left middle
                dr = ball.radius - (rect.x - x);

                if (dr >= 0) {
                    return {
                        hit: HIT.LEFT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
            else { // Left bottom
                a = rect.x - x;
                b = y - (rect.y + rect.height);
                c = Math.sqrt((a * a) + (b * b));
                dr = ball.radius - c;

                if (dr >= 0) {
                    return {
                        hit: HIT.BOTTOM_LEFT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
        }
        else if (pointOnRectX === x) {
            if (pointOnRectY === rect.y) { // Middle top
                dr = ball.radius - (rect.y - y);

                if (dr >= 0) {
                    return {
                        hit: HIT.TOP,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
            else if (pointOnRectY === y) { // Middle middle
                return {
                    hit: HIT.MIDDLE,
                    deltaR: -1
                };
            }
            else { // Middle bottom
                dr = ball.radius - (y - (rect.y + rect.height));

                if (dr >= 0) {
                    return {
                        hit: HIT.BOTTOM,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
        }
        else
        {
            if (pointOnRectY === rect.y) { // Right top
                a = x - (rect.x + rect.width);
                b = rect.y - y;
                c = Math.sqrt((a * a) + (b * b));
                dr = ball.radius - c;

                if (dr >= 0) {
                    return {
                        hit: HIT.TOP_RIGHT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
            else if (pointOnRectY === y) { // Right middle
                dr = ball.radius - (x - (rect.x + rect.width));

                if (dr >= 0) {
                    return {
                        hit: HIT.RIGHT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
            else { // Right bottom
                a = x - (rect.x + rect.width);
                b = y - (rect.y + rect.height);
                c = Math.sqrt((a * a) + (b * b));
                dr = ball.radius - c;

                if (dr >= 0) {
                    return {
                        hit: HIT.BOTTOM_RIGHT,
                        deltaR: dr
                    };
                }
                else {
                    return {
                        hit: HIT.NO_HIT,
                        deltaR: -1
                    };
                }
            }
        }
    };

    this.isLose = function () {
        return lose;
    };

    this.isWin = function() {
        for (var r = 0; r < blocks.length; r++) {
            for(var c = 0; c < blocks[r].length; c++) {
                if(blocks[r][c].visibility === true) {
                    return false;
                }
            }
        }

        return true;
    };
}

function Block(x, y, width, height, colour, visibility) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.visibility = visibility;
}

function testLocalStorage() {
    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem('feature_test', 'yes');
            if (localStorage.getItem('feature_test') === 'yes') {
                localStorage.removeItem('feature_test');
                return true;
            }
            else {
                return false;
            }
        }
        catch(e) {
            return false;
        }
    }
    else {
        return false;
    }
}