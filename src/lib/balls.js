let balls = [];
let startStopFlag = null;

function Ball(canvasContainer, x, y, id, color, aoa, weight) {
    this.mother = id<4;
    this.posX = this.mother ? x : x % (450 - 2 * weight) + weight; // cx
    this.posY = this.mother ? y : y % (450 - 2 * weight) + weight; // cy
    this.color = color;
    this.radius = weight;
    this.jumpSize = 0.00001;
    this.canvasContainer = canvasContainer;
    this.id = 'n'+ id;
    this.aoa = aoa;
    this.weight = weight;
    this.mass =  this.radius ** 6;

    let thisobj = this;

    this.vx = Math.cos(thisobj.aoa) * thisobj.jumpSize; // velocity x
    this.vy = Math.sin(thisobj.aoa) * thisobj.jumpSize; // velocity y

    this.Draw = function () {
        let canvasContainer = thisobj.canvasContainer;
        let ball = document.getElementById(thisobj.id);

        if (!ball) {
            ball = document.createElement('div');
            ball.style.width = thisobj.radius * 2 + 'px';
            ball.style.height = thisobj.radius * 2 + 'px';
            ball.style.background = ((c) => {
                const r = parseInt(c[1] + c[2], 16);
                const g = parseInt(c[3] + c[4], 16);
                const b = parseInt(c[5] + c[6], 16);
                const [h, s, l] = rgbToHsl(r, g, b);
                const res = `hsla(${h * 360},${s * 1.8 * 100}%,${l / 2 * 100}%,${.5})`;
                return res;
            })(thisobj.color);
            ball.classList.add('ball');
            ball.setAttribute('id', thisobj.id);
            canvasContainer.appendChild(ball);
        }

        ball.style.left = thisobj.posX - thisobj.radius + 'px';
        ball.style.top = thisobj.posY - thisobj.radius + 'px';
    };

const tens = 0.8

    this.Move = function () {
        if (thisobj.mother) return;
        let canvasContainer = thisobj.canvasContainer;

        thisobj.posX += thisobj.vx;
        thisobj.posY += thisobj.vy;

        if (canvasContainer.offsetWidth <= (thisobj.posX + thisobj.radius)) {
            thisobj.posX = canvasContainer.offsetWidth - thisobj.radius;
            thisobj.vx = -thisobj.vx * tens;
        } else  {

            if (thisobj.posX < thisobj.radius) {
                thisobj.posX = thisobj.radius;
                thisobj.vx = -thisobj.vx * tens;
            }
        }
        if (canvasContainer.offsetHeight < (thisobj.posY + thisobj.radius)) {
            thisobj.posY = canvasContainer.offsetHeight - thisobj.radius;
            thisobj.vy = -thisobj.vy * tens;
        }  else {

            if (thisobj.posY < thisobj.radius) {
                thisobj.posY = thisobj.radius;
                thisobj.vy = -thisobj.vy * tens;
            }
        }
    };
}

const  gravitation = 0.06;

function CheckCollision(ball1, ball2, agglutinate) {
    let dx = ball2.posX - ball1.posX;
    let dy = ball2.posY - ball1.posY;

    const sqDistance = dx**2 + dy**2;
    if(sqDistance<.00000001) {
        ball2.posX+=0.00000002;
    }
    let qradius = (ball1.radius + ball2.radius)**2;


    if (sqDistance - qradius < -qradius * 0.0) {
        if(agglutinate) {return true;}
        let difx = (ball2.posX - ball2.vx) - (ball1.posX - ball1.vx);
        let dify = (ball2.posY - ball2.vy) - (ball1.posY - ball1.vy);
        let dif_distance = (difx * difx) + (dify * dify);
        if (dif_distance - sqDistance > 0. && !ball1.mother) return true;
    }

    /* притяжение начало */
    const Mm = ball2.mass * ball1.mass;
    const F = Mm / sqDistance * ball1.jumpSize * gravitation;
    const a1 = F / ball1.mass;
    const a2 = F / ball2.mass;
    const distance = sqDistance **.5;  //  извлечение корня
    dx /= distance;
    dy /= distance;
    if(!ball1.mother){
        ball1.vx += dx * a1;
        ball1.vy += dy * a1;
    }

    if(!ball2.mother){
        ball2.vx += dx * -a2;
        ball2.vy += dy * -a2;
    }
    /* притяжение конец */

    return false;
}

function ProcessCollision(ball1, ball2, agglutinate) {

    ball1 = balls[ball1];
    ball2 = balls[ball2];

    if (CheckCollision(ball1, ball2, agglutinate)) {
        let m1 = ball1.mass;// массы
        let m2 = ball2.mass;

        let v1_x = ball1.vx;// скорости
        let v1_y = ball1.vy;
        let v2_x = ball2.vx;
        let v2_y = ball2.vy;

        let p1_x = ball1.posX; // -= v1_x/2;// точки центров шаров
        let p1_y = ball1.posY; // -= v1_y/2;
        let p2_x = ball2.posX; // -= v2_x/2;
        let p2_y = ball2.posY; // -= v2_y/2;
// нормаль к удару, касательная
// создаём и нормируем вектор из двух точек
        let pdpx = p2_x - p1_x;
        let pdpy = p2_y - p1_y;
        let Qpdpx = pdpx * pdpx;
        let Qpdpy = pdpy * pdpy;
        let Denom = Qpdpx + Qpdpy;

        let norm_x = (pdpx < 0 ? -Qpdpx : Qpdpx) / Denom;
        let norm_y = (pdpy < 0 ? -Qpdpy : Qpdpy) / Denom;

// находим вектор ортогональный заданному
        let tang_x = norm_y;
        let tang_y = -norm_x;

// проэкции скоростей на нормаль и касательную
// vect - что проэцируем, line - куда проэцируем
        let Denomnorm = norm_x * norm_x + norm_y * norm_y;
        let tmpnorm1 = (v1_x * norm_x + v1_y * norm_y) / Denomnorm;

        let v1n_x = norm_x * tmpnorm1;
        let v1n_y = norm_y * tmpnorm1;

// vect - что проэцируем, line - куда проэцируем
        let tmpnorm2 = (v2_x * norm_x + v2_y * norm_y) / Denomnorm;

        let v2n_x = norm_x * tmpnorm2;
        let v2n_y = norm_y * tmpnorm2;

        let Denomtang = tang_x * tang_x + tang_y * tang_y;
        let tmptang1 = (v1_x * tang_x + v1_y * tang_y) / Denomtang;

        let v1t_x = tang_x * tmptang1;
        let v1t_y = tang_y * tmptang1;

// vect - что проэцируем, line - куда проэцируем
        let tmptang2 = (v2_x * tang_x + v2_y * tang_y) / Denomtang;

        let v2t_x = tang_x * tmptang2;
        let v2t_y = tang_y * tmptang2;

// считаем импульсы
        let msm = (m1 + m2);
        let mdm = m1 - m2;
        let v1res_x = (2 * m2 * v2n_x + mdm * v1n_x) / msm;
        let v1res_y = (2 * m2 * v2n_y + mdm * v1n_y) / msm;
        let v2res_x = (2 * m1 * v1n_x - mdm * v2n_x) / msm;
        let v2res_y = (2 * m1 * v1n_y - mdm * v2n_y) / msm;

// сумма векторов проэкций = результат
        let vx1 = v1res_x + v1t_x;
        let vy1 = v1res_y + v1t_y;

        let vx2 = v2res_x + v2t_x;
        let vy2 = v2res_y + v2t_y;


        ball1.vx = vx1;
        ball1.vy = vy1;
        ball2.vx = vx2;
        ball2.vy = vy2;
    }
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                alert('NLO atakked !!!!!');
        }
        h /= 6;
    }
    return [h, s, l];
}

export function Initialize(container, ballsAmount) {
    const canvasContainer = container;
    const colors = [
        '#1f77b480',
        '#aec7e880',
        '#ff7f0e80',
        '#ffbb7880',
        '#2ca02c80',
        '#98df8a80',
        '#d6272880',
        '#ff989680',
        '#9467bd80',
        '#c5b0d580',
        '#8c564b80',
        '#c49c9480',
        '#e377c280',
        '#f7b6d280',
        '#7f7f7f80',
        '#c7c7c780',
        '#bcbd2280',
        '#dbdb8d80',
        '#17becf80',
        '#9edae580',
        '#1f77b480',
        '#aec7e880',
        '#ff7f0e80',
        '#ffbb7880',
        '#2ca02c80',
        '#98df8a80'
    ];


    const rc = 12;
    balls.push(new Ball(canvasContainer, -50, 225, 0,'#000000',0,rc));
    balls.push(new Ball(canvasContainer, 500, 225, 1,'#000000',0,rc));
    balls.push(new Ball(canvasContainer, 225, -50, 2,'#000000',0,rc));
    balls.push(new Ball(canvasContainer, 225, 500, 3,'#000000',0,rc));

    for (let i = 4; i < ballsAmount; ++i) {
        balls.push(new Ball(
            canvasContainer, 15 * i,
            15 * i/8,
            i,
            colors[i % 25],
            0.1,
            (i % 99) === 0 ? 4 : (4 + (i * 5) ** .5) / 3
        ));
    }

    for (let i = 0; i < balls.length; ++i) {
        balls[i].Draw();
    }

    return canvasContainer;
}

let ciclesDrawRelation = 30;
let globCicles = 0;

export function StartStopGame(agglutinate) {
    if (startStopFlag == null) {
        let timer = setTimeout(function tick() {
            let start =  Date.now();
            for(let kz = ciclesDrawRelation; kz--;) {
                for (let i = 0; i < balls.length; ++i) {
                    balls[i].Move();
                    for (let j = i + 1; j < balls.length; ++j) {
                        ProcessCollision(i, j, agglutinate);
                    }
                }
                balls.forEach(v => {
                     // v.vy+=0.12;   // вес вниз
                     // v.vx+=0.12;   // вес вправо
                });
            }
            if(!(globCicles++%300)){ console.log(`${ciclesDrawRelation} циклов за ${Date.now() - start} мс`);}
            balls.forEach(v => {
                v.Draw();
            });

            timer = setTimeout(tick, 15);

            if (startStopFlag == null) {
                clearTimeout(timer);
                return true;
            }
            else {
                return false;
            }
        }, 15);

        startStopFlag = 1;
    }
    else {
        startStopFlag = null;
    }
}

export function RemoveBalls(container) {
    let canvasContainer = container;

    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }

    startStopFlag = null;

    balls.splice(0, balls.length);
    Initialize(canvasContainer, 0);
}