function KeyBoardInput(element) {
    var forwardKeyCode = 87;
    var backKeyCode = 83;
    var upKeyCode = 88;
    var downKeyCode = 67;
    var jumpKeyCode = 32;
    var leftKeyCode = 65;
    var rightKeyCode = 68;
    var crouchKeyCode = 16;
    var keyboardsStates = {};

    function isLeft() {
        return getKeyCodeStatus(leftKeyCode);
    }

    function isDown() {
        return getKeyCodeStatus(downKeyCode);
    }

    function isUp() {
        return getKeyCodeStatus(upKeyCode);
    }

    function isRight() {
        return getKeyCodeStatus(rightKeyCode);
    }

    function isBack() {
        return getKeyCodeStatus(backKeyCode);
    }

    function isForward() {
        return getKeyCodeStatus(forwardKeyCode);
    }

    function isJump() {
        return getStatusOnce(jumpKeyCode);
    }

    function isCrouch() {
        return getKeyCodeStatus(crouchKeyCode);
    }

    function getStatusOnce(keyCode) {
        var status = getKeyCodeStatus(keyCode);
        keyboardsStates[keyCode] = false;
        return status;
    }

    function getKeyCodeStatus(keyCode) {
        return keyboardsStates[keyCode] || false;
    }

    function setEvents() {
        element.addEventListener("keydown", onKeyDown);
        element.addEventListener("keyup", onKeyUp);
    }

    function onKeyDown(event) {
        keyboardsStates[event.keyCode] = true;
    }

    function onKeyUp(event) {
        keyboardsStates[event.keyCode] = false;
    }


    this.isLeft = isLeft;
    this.isRight = isRight;
    this.isBack = isBack;
    this.isJump = isJump;
    this.isDown = isDown;
    this.isUp = isUp;
    this.isForward = isForward;
    this.isCrouch = isCrouch;
    setEvents();
}
