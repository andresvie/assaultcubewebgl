function GunInfoState(gunChangingTime, gunReloadingTime, gunRecoil, timeToAttack) {
    var changing = false;
    var reloading = false;
    var timeInterpolation;
    var maxAngle = -90;
    var timeAttack = 0;
    var interpolationFunction;
    this.setChangingState = function () {
        changing = true;
        timeInterpolation = new Date().getTime();
        interpolationFunction = changingInterpolation;
    };
    this.setReloadingState = function () {
        reloading = true;
        timeInterpolation = new Date().getTime();
        interpolationFunction = reloadingInterpolation;
    };
    this.attack = function () {
        timeAttack = new Date().getTime();
    };
    this.isAllowedAttack = function () {
        var currentTime = new Date().getTime() - timeAttack;
        return currentTime > timeToAttack;
    };
    this.getGunAttackRecoilInterpolation = function (lastMillis) {
        var recoilThreadHold = 1.5;
        var timeDiff = lastMillis - timeAttack;
        var recoilProgress = clamp(timeDiff / timeToAttack, 0.0, 1.0) * recoilThreadHold;
        var recoilGun = Math.sin(Math.pow(recoilProgress - recoilThreadHold, 3));
        recoilGun = gunRecoil * recoilGun / 10.0;
        return recoilGun;
    };
    this.getInterpolationAnimationValue = function (lastMillis) {
        if (changing || reloading) {
            return interpolationFunction(lastMillis);
        }
        return 0.0;
    };
    this.isChanging = function () {
        return changing;
    };
    this.isReloading = function () {
        return reloading;
    };
    this.update = function () {
        var timeFinishAnimation = new Date().getTime() - timeInterpolation;
        changing = timeFinishAnimation < gunChangingTime;
        reloading = timeFinishAnimation < gunReloadingTime;
    };


    function reloadingInterpolation(lastMillis) {
        var reloadingTime = (lastMillis - interpolationFunction) / gunReloadingTime;
        return maxAngle * Math.sin(clamp(reloadingTime, 0.0, 1.0) * Math.PI);
    }

    function changingInterpolation(lastMillis) {
        var changingTime = (lastMillis - timeInterpolation) / gunChangingTime;
        return maxAngle * Math.sin(clamp(changingTime, 0.0, 1.0) * Math.PI);
    }
}
