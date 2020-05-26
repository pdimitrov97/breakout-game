"use strict";

var breakoutView = new BreakoutView();
var breakoutModel = new BreakoutModel();
var breakoutController = null;

function BreakoutController() {
    var updateRate = 16.67; // 60fps
    var gamma = 0;
    var started = false;
    var running = false;

    this.init = function() {
        breakoutModel.initializeModel();
        breakoutView.initializeView();

        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", function (event) {
                gamma = Math.round(event.gamma);
            });
        }
        else if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", function (event) {
                var x = event.accelerationIncludingGravity.x;
                var y = event.accelerationIncludingGravity.y;
                var z = event.accelerationIncludingGravity.z;

                var roll = Math.round(Math.atan(-x / Math.sqrt(y * y + z * z)) * 180 / Math.PI);
                gamma = roll;
            });
        }

        breakoutView.setPlayPauseButtonClick( function () {
            breakoutView.hideRestartConfirmation();
            breakoutController.togglePlayPause();
        });

        breakoutView.setRestartButtonClick( function () {
            if (breakoutModel.isLose() === true || breakoutModel.isWin() === true) {
                breakoutController.restart();
            }
            else {
                if (running === true) {
                    breakoutController.togglePlayPause();
                }

                breakoutView.showRestartConfirmation();
            }
        });

        breakoutView.setRestartConfirmationYesButtonClick( function () {
            breakoutView.hideRestartConfirmation();
            breakoutController.restart();
        });

        breakoutView.setRestartConfirmationNoButtonClick( function () {
            if (started === true) {
                breakoutController.togglePlayPause();
            }

            breakoutView.hideRestartConfirmation();
        });

        breakoutView.updateView();
        window.setInterval(function () { breakoutController.update(); }, updateRate);
    };

    this.update = function () {
        if (running === true) {
            if (breakoutModel.isLose() === true) {
                breakoutView.showMessage("You lose!", "#FFFFFF");
                breakoutController.togglePlayPause();
                breakoutView.setPlayPauseButtonVisibility(false);
            }
            else if (breakoutModel.isWin() === true) {
                breakoutView.showMessage("You win!", "#FFFFFF");
                breakoutController.togglePlayPause();
                breakoutView.setPlayPauseButtonVisibility(false);
            }
            else {
                breakoutModel.updateModel(gamma);
                breakoutView.updateView();
            }
        }
    };

    this.restart = function () {
        started = false;
        running = false;
        breakoutView.setPlayPauseButtonText("Start");
        breakoutView.setPlayPauseButtonVisibility(true);
        breakoutModel = new BreakoutModel();
        breakoutModel.initializeModel();
        breakoutView.updateView();
    };

    this.togglePlayPause = function () {
        if (running === false) {
            breakoutView.setPlayPauseButtonText("Pause");
            started = true;
            running = true;
        }
        else {
            breakoutView.setPlayPauseButtonText("Play");
            running = false;
        }
    };
}

breakoutController = new BreakoutController();
window.addEventListener("load", breakoutController.init);
