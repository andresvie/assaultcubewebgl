function getAimDirection(view)
{
    var viewInverse = getInverseView(view);
    var directionVector = [0.0, 0.0 , 1.0, 0.0];
    var aimDirection = mat4.multiplyVec4(viewInverse, directionVector);
    return aimDirection
}

function getInverseView(view)
{
    var inverseMVP = mat4.create();
    mat4.inverse(view, inverseMVP);
    return inverseMVP;
}
