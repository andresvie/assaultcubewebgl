function KeyBoardHandler() {
    var backwardPress = false;
    var forwardPress = false;
    var timeForward = null;
    var timeBackward = null;
    var leftPress = false;
    var timeLeft = null;
    var rightPress = false;
    var jump = false;
    var reloadPress = false;
    var spaceKeyCode = 32;
    var timeRight = null;
    this.isForwardEnable = function () {
        return forwardPress;
    };
    this.isLeftEnable = function () {
        return leftPress;
    };
    this.isRightEnable = function()
    {
        return rightPress;
    };
    this.shouldJump = function()
    {
        var aux = jump;
        jump = false;
        return aux;
    };


    this.isBackwardEnable = function () {
        return backwardPress;
    };
    $(document).ready(function () {
        $(document).keyup(function (event) {
            if(isJumpEvent(event))
            {
                event.preventDefault();
                jump = true;
            }
            if (isForwardEvent(event)) {
                event.preventDefault();
                onForwardKeyUp();
            }
            if (isBackwardEvent(event)) {
                event.preventDefault();
                onBackwardKeyUp();
            }
            if(isLeftEvent(event))
            {
                event.preventDefault();
                onLeftKeyUp();
            }
            if(isRightEvent(event))
            {
                event.preventDefault();
                onRightKeyUp();
            }

        });

        $(document).keydown(function (event) {
            if (isForwardEvent(event)) {
                event.preventDefault();
                onForwardKeyDown();
            }
            if (isBackwardEvent(event)) {
                event.preventDefault();
                onBackwardKeyDown();
            }
            if(isLeftEvent(event))
            {
                event.preventDefault();
                onLeftKeyDown();
            }

            if(isRightEvent(event))
            {
                event.preventDefault();
                onRightKeyDown();
            }

        });

    });

    function shouldHandlerEvent(event)
    {
        var handlerEvent = isBackwardEvent(event) || isForwardEvent(event) || isLeftEvent(event) || isRightEvent(event);
        handlerEvent = handlerEvent|| isJumpEvent(event);
        return handlerEvent;
    }


    function isJumpEvent(event)
    {
        return getCodeFromEvent(event) == spaceKeyCode
    }


    function isForwardEvent(event)
    {
        return getCodeFromEvent(event) == 87;
    }

    function isBackwardEvent(event)
    {
        return getCodeFromEvent(event) == 83;
    }

    function isLeftEvent(event)
    {
        return getCodeFromEvent(event) == 65;
    }


    function isRightEvent(event) {
        return getCodeFromEvent(event) == 68;
    }

    function getCodeFromEvent(event) {
        return event.keyCode || event.which;
    }

    function onForwardKeyUp() {
        forwardPress = false;
        timeForward = null;
    }

    function onLeftKeyUp() {
        leftPress = false;
        timeLeft = null;
    }

    function onRightKeyUp() {
        rightPress = false;
        timeRight = null;
    }

    function onLeftKeyDown() {
        leftPress = true;
        timeLeft = new Date();
    }

    function onRightKeyDown() {
        rightPress = true;
        timeRight = new Date();
    }

    function onForwardKeyDown() {
        forwardPress = true;
        timeForward = new Date();
    }

    function onBackwardKeyUp() {
        backwardPress = false;
        timeBackward = null;
    }

    function onBackwardKeyDown() {
        backwardPress = true;
        timeBackward = new Date();
    }


}