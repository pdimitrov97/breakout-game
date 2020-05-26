"use strict";

function BreakoutView() {
    var buttonPlayPause = document.getElementById("play_pause");
    var buttonRestart = document.getElementById("restart");
    var displayCurrentScore = document.getElementById("current_score");
    var displayHighscore = document.getElementById("highscore");
    var restartConfirmation = document.getElementById("restart_confirm");
    var restartConfirmationYesButtom = document.getElementById("restart_yes");
    var restartConfirmationNoButtom = document.getElementById("restart_no");

    var game_area = document.getElementById("game_area");
    var canvas = document.getElementById("game_board");
    var context = canvas.getContext("2d");
    var background = "#000000";

    this.initializeView = function () {
        canvas.style.height = game_area.clientHeight + "px";
        canvas.style.width = game_area.clientWidth + "px";
        context.canvas.height = game_area.clientHeight;
        context.canvas.width = game_area.clientWidth;
    };

    this.setPlayPauseButtonClick = function (callback) {
        buttonPlayPause.addEventListener("touchend", callback);
    };

    this.setPlayPauseButtonText = function (text) {
        buttonPlayPause.innerText = text;
    };

    this.setPlayPauseButtonVisibility = function (visibility) {
        if (visibility === true) {
            buttonPlayPause.style.visibility = "visible";
        }
        else {
            buttonPlayPause.style.visibility = "hidden";
        }
    };

    this.setRestartButtonClick = function (callback) {
        buttonRestart.addEventListener("touchend", callback);
    };

    this.setRestartConfirmationYesButtonClick = function (callback) {
        restartConfirmationYesButtom.addEventListener("touchend", callback);
    };

    this.setRestartConfirmationNoButtonClick = function (callback) {
        restartConfirmationNoButtom.addEventListener("touchend", callback);
    };

    this.showRestartConfirmation = function () {
        restartConfirmation.classList.add("show");
    };

    this.hideRestartConfirmation = function () {
        restartConfirmation.classList.remove("show");
    };

    this.showMessage = function (text, color) {
        var textWidth;
        var scaleX;
        var scaleY;

        context.save();

        context.font = "20px 'Titillium Web'";
        textWidth = context.measureText(text).width;
        scaleX = (game_area.clientWidth / (textWidth * 2));
        scaleY = (game_area.clientHeight / (20 * 10));
        context.scale(scaleX, scaleY);
        context.fillStyle = color;
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText(text, (game_area.clientWidth / (2 * scaleX)),(game_area.clientHeight / (2 * scaleY)) - 10);

        context.scale(1 / scaleX, 1 / scaleY);

        context.font = "20px 'Titillium Web'";

        if (breakoutModel.isNewHighscore() === true) {
            text = "New highscore: " + Math.round(breakoutModel.getHighscore());
            textWidth = context.measureText(text).width;
            scaleX = (game_area.clientWidth / (textWidth * 3 / 2));
        }
        else {
            text = "Points: " + Math.round(breakoutModel.getScore());
            textWidth = context.measureText(text).width;
            scaleX = (game_area.clientWidth / (textWidth * 2));
        }

        scaleY = (game_area.clientHeight / (20 * 10));
        context.scale(scaleX, scaleY);
        context.fillStyle = color;
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText(text, (game_area.clientWidth / (2 * scaleX)),(game_area.clientHeight / (2 * scaleY)) + 10);

        context.restore();
    };

    this.updateView = function() {
        this.clearCanvas();
        this.drawPaddle();
        this.drawBlocks();
        this.drawBall();
        this.updateScores();
    };

    this.clearCanvas = function() {
        context.clearRect(0,0, context.canvas.width, context.canvas.height);
        context.fillStyle = background;
        context.fillRect(0,0, context.canvas.width, context.canvas.height);
    };

    this.drawPaddle = function() {
        var paddle = breakoutModel.getPaddle();

        context.fillStyle = "#FF00FF";
        context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    };

    this.drawBlocks = function () {
        var blocks = breakoutModel.getBlocks();

        for (var r = 0 ; r < blocks.length; r++) {
            for (var c = 0; c < blocks[r].length; c++) {
                var block = blocks[r][c];

                if(block.visibility === true) {
                    context.fillStyle = block.colour;
                    context.fillRect(block.x, block.y, block.width, block.height);
                }
            }
        }
    };

    this.drawBall = function () {
        var ball = breakoutModel.getBall();

        context.fillStyle = "#009CFF";
        context.beginPath();
        context.lineWidth = 0;
        context.arc(ball.x, ball.y, ball.radius, 0, (2 * Math.PI));
        context.fill();
    };

    this.updateScores = function () {
        displayCurrentScore.innerText = Math.round(breakoutModel.getScore()) + " points";
        displayHighscore.innerText = "Highscore: " +  Math.round(breakoutModel.getHighscore());
    };
}