import * as PIXI from 'pixi.js';
import Keyboard from 'pixi.js-keyboard';
import * as Mouse from 'pixi.js-mouse';

var width = window.innerWidth/2;
var height = window.innerHeight/2;
var app, character, player, iD, to;
var deltaTime;

var outPocket = [];

var world;
var emptyTexture;
var groundObjectTextures = [];
var groundObject = new Array(32);
for(let i = 0; i < 32; i++){
    groundObject[i] = new Array(32);
}
var ammoTextures = [];
var splashTextures = [];
var bodyTextures = [];
var weaponTextures = [];
var boxTextures = [];

var boxes = [];
var ammos = [];
var particles = [];

var socket;
var wT = 3;

var currentTime = Date.now();

var objects = {};



let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1
});

document.body.appendChild(app.view);


PIXI.loader
    .add("assets/map2.png")
    .add("assets/ground_object.png")
    .add("assets/tank_base_Green.png")
    .add("assets/tank_weapon_Green.png")
    .add("assets/tank_ammo.png")
    .add("assets/tank_ammo_splash.png")
    .add("assets/box.png")
    .add("assets/particle.png")
    .load(setup);


function setup() {

    world = new Sprite(emptyTexture);
    let spriteL = new Sprite(resources["assets/map2.png"].texture);

    groundObjectTextures[1] = new PIXI.Texture(resources["assets/ground_object.png"].texture.baseTexture, new Rectangle(0, 0, 96, 96));
    //let spriteW = new Sprite(resources["assets/ground_object.png"].texture);
    //emptyTexture = new PIXI.Texture(resources["assets/tank_base.png"].texture, new Rectangle(0, 0, 1, 1));

    ammoTextures[0] = new PIXI.Texture(resources["assets/tank_ammo.png"].texture.baseTexture, new Rectangle(0, 0, 32, 32));
    ammoTextures[1] = new PIXI.Texture(resources["assets/tank_ammo.png"].texture.baseTexture, new Rectangle(32, 0, 32, 32));
    ammoTextures[2] = new PIXI.Texture(resources["assets/tank_ammo.png"].texture.baseTexture, new Rectangle(64, 0, 32, 32));
    ammoTextures[3] = new PIXI.Texture(resources["assets/tank_ammo.png"].texture.baseTexture, new Rectangle(96, 0, 32, 32));


    splashTextures[0] = new PIXI.Texture(resources["assets/tank_ammo_splash.png"].texture.baseTexture, new Rectangle(0, 0, 32, 32));
    splashTextures[1] = new PIXI.Texture(resources["assets/tank_ammo_splash.png"].texture.baseTexture, new Rectangle(32, 0, 32, 32));
    splashTextures[2] = new PIXI.Texture(resources["assets/tank_ammo_splash.png"].texture.baseTexture, new Rectangle(64, 0, 32, 32));
    splashTextures[99] = new PIXI.Texture(resources["assets/particle.png"].texture.baseTexture, new Rectangle(0, 0, 64, 64));

    weaponTextures[0] = new PIXI.Texture(resources["assets/tank_weapon_Green.png"].texture.baseTexture, new Rectangle(0, 0, 64, 64));
    weaponTextures[1] = new PIXI.Texture(resources["assets/tank_weapon_Green.png"].texture.baseTexture, new Rectangle(64, 0, 64, 64));
    weaponTextures[2] = new PIXI.Texture(resources["assets/tank_weapon_Green.png"].texture.baseTexture, new Rectangle(128, 0, 64, 64));
    weaponTextures[3] = new PIXI.Texture(resources["assets/tank_weapon_Green.png"].texture.baseTexture, new Rectangle(192, 0, 64, 64));
    weaponTextures[4] = new PIXI.Texture(resources["assets/tank_weapon_Green.png"].texture.baseTexture, new Rectangle(256, 0, 64, 64));

    bodyTextures[0] = new PIXI.Texture(resources["assets/tank_base_Green.png"].texture.baseTexture, new Rectangle(0, 0, 64, 64));
    bodyTextures[1] = new PIXI.Texture(resources["assets/tank_base_Green.png"].texture.baseTexture, new Rectangle(64, 0, 64, 64));

    boxTextures[0] = new PIXI.Texture(resources["assets/box.png"].texture.baseTexture, new Rectangle(0, 0, 64, 64));
    boxTextures[1] = new PIXI.Texture(resources["assets/box.png"].texture.baseTexture, new Rectangle(64, 0, 64, 64));

    app.stage.addChild(world);
    world.x = width;
    world.y = height;
    world.addChild(spriteL);
    spriteL.x = -32;
    spriteL.y = -32;

    app.ticker.add(delta => gameLoop(delta));
    player = getGameObject(0);
    //console.log("ws://" + location.hostname + ":" + location.port);


    //socket = new WebSocket("wss://bountywar.herokuapp.com/bountywar");
    socket = new WebSocket("ws://192.168.111.164:8082/bountywar");//bountywar
    socket.binaryType = 'arraybuffer';
    socket.onopen = function () {

    };

    socket.onclose = function (event) {
        alert("Disconnected !!!");
    };

    socket.onmessage = function (event) {
        var k = new Int8Array(event.data);
        //console.log('Get Data: '+ k);
        incomePoket(k);
        //delete(event);
    };

    socket.onerror = function (error) {
        alert("Disconnected !!!");
    };

}

function gameLoop(delta) {
    deltaTime = Date.now() - currentTime;
    currentTime = Date.now();
    Keyboard.update();
    //Mouse.update();
    play(deltaTime);
}

function play(delta) {

    //console.log(delta);
    //console.log('Game Update');
    boxes.forEach(boxUpdate);
    ammos.forEach(ammoUpdate);
    particles.forEach(particleUpdate);
    var mousePosition = app.renderer.plugins.interaction.mouse.global;

    if (Keyboard.isKeyDown('ArrowLeft', 'KeyQ')){
        world.scale.x -= 0.03;
        world.scale.y -= 0.03;
    }
    if (Keyboard.isKeyDown('ArrowRight', 'KeyE')) {
        world.scale.x += 0.03;
        world.scale.y += 0.03;
    }

    world.pivot.set(player.body.x,player.body.y);
    //world.rotation = -player.body.rotation;
    if (iD !== undefined && socket.readyState === 1)
        generateButtonProtocol(mousePosition.x, mousePosition.y);

    //console.log("socket.readyState:"+socket.readyState+"   outPocket.length:" + outPocket.length);
    if (socket.readyState === 1 && outPocket.length > 0){
        let arr = new Int8Array(outPocket);
        socket.send(arr.buffer);
        // @ts-ignore
        arr = null
        //delete arr;
        // @ts-ignore
        outPocket = null
        //delete outPocket;
        outPocket = [];
    }
}


function incomePoket(pocket) {
    for(let i = 0; i < pocket.length;){
        if(pocket[i] === 0){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            iD = "" + id;
            objects["" + id] = player;
            outPocket.push(5);
            outPocket.push(pocket[i+1]);
            outPocket.push(pocket[i+2]);
            outPocket.push(pocket[i+3]);
            outPocket.push(pocket[i+4]);
            i += 5;
        } else if(pocket[i] === 1){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] === undefined) {
                objects["" + id] = getGameObject(0);
                outPocket.push(5);
                outPocket.push(pocket[i+1]);
                outPocket.push(pocket[i+2]);
                outPocket.push(pocket[i+3]);
                outPocket.push(pocket[i+4]);
            }
            objects["" + id].body.x = getCoord(pocket[i+5], pocket[i+6], pocket[i+7]);
            //console.log("bytes:// " + pocket[i+5] + "," + pocket[i+6] + "," + pocket[i+7]);
            //console.log("ws://" + objects["" + id].body.x);
            objects["" + id].body.y = getCoord(pocket[i+8], pocket[i+9], pocket[i+10]);
            objects["" + id].body.rotation = getRadians(pocket[i+11], pocket[i+12]);
            objects["" + id].tower.rotation = getRadians(pocket[i+13], pocket[i+14]) - objects["" + id].body.rotation;
            i += 15;
        } else if(pocket[i] === 2){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] === undefined) {
            } else {
                objects["" + id].changeTower(pocket[i + 5]);
            }
            i += 6;
        } else if (pocket[i] === 3){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] === undefined) {
                let am = getAmmo("" + id, pocket[i+5], getCoord(pocket[i+6], pocket[i+7], pocket[i+8]), getCoord(pocket[i+9], pocket[i+10], pocket[i+11]), getRadians(pocket[i+12], pocket[i+13]));
                objects["" + id] = am;
                ammos.push(am);
            } else {
                objects["" + id].sprite.x = getCoord(pocket[i+6], pocket[i+7], pocket[i+8]);
                objects["" + id].sprite.y = getCoord(pocket[i+9], pocket[i+10], pocket[i+11]);
                objects["" + id].sprite.rotation = getRadians(pocket[i+12], pocket[i+13]);
            }
            i += 14;
        } else if (pocket[i] === 4){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] === undefined) {
            } else {
                world.removeChild(objects["" + id].body);
                delete objects["" + id];
            }
            i += 5;
        } else if (pocket[i] === 12){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] !== undefined) {
                world.removeChild(objects["" + id].sprite);
                objects["" + id].live = 0;
                objects["" + id].splash(getCoord(pocket[i+5], pocket[i+6], pocket[i+7]), getCoord(pocket[i+8], pocket[i+9], pocket[i+10]));
                delete objects["" + id];
            }
            i += 11;
        } else if (pocket[i] === 14){
            for(let p = 0; p < 1024; p++){
                if(pocket[i+p+1] === 1){
                    let kx = (p%32);
                    let ky = ~~(p/32);
                    //console.log("x: " + kx + "   y: " + ky);
                    groundObject[kx][ky] = new Sprite(groundObjectTextures[1]);
                    groundObject[kx][ky].position.set(kx*64, ky*64);
                    world.addChild(groundObject[kx][ky]);
                }
            }
            i += 1025;
            //console.log("14");
        } else {
            //console.log("Illegal Data From Server!!!");
            break;
        }
    }
    // @ts-ignore
    pocket = null
    //delete pocket;
}

function getID(byte1, byte2, byte3, byte4): number{
    return toInt(byte4) + toInt(byte3)*256 + toInt(byte2)*65536 + toInt(byte1)*16777216;
}

function toInt(byte){
    if(byte < 0)
        byte += 256;
    return byte;
}

function toIntSoft(byte){
    let int = byte;
    return int;
}

function getCoord(byte1, byte2, byte3){
    return toInt(byte1)*2048 + toInt(byte2)*64 + toInt(byte3)/4.0;
}

function getRadians(byte1, byte2){
    return byte1 + byte2/100.0;
}

function addRadiansToByteArray(rad, arr){
    arr.push(~~rad);
    arr.push(~~((rad%1.0)*100));
}

function addMouseToByteArray(x, y, arr){
    arr.push(~~(x%256));
    arr.push(~~(x/256));
    arr.push(~~(y%256));
    arr.push(~~(y/256));
}


function generateButtonProtocol(mouseX, mouseY) {
    outPocket.push(6);
    let l = 0;
    if (Keyboard.isKeyDown('ArrowUp', 'KeyW'))
        l+=1;
    if (Keyboard.isKeyDown('ArrowDown', 'KeyS'))
        l+=2;
    if (Keyboard.isKeyDown('ArrowLeft', 'KeyA'))
        l+=4;
    if (Keyboard.isKeyDown('ArrowRight', 'KeyD'))
        l+=8;
    if (Keyboard.isKeyDown('Space'))
        l+=16;


    outPocket.push(l);
    let x = mouseX - width;
    let y = mouseY - height;
    //let r = player.getTowerRotate(mouseX, mouseY);
    /*while(r > Math.PI*2 || r < Math.PI*-2){
        if(r > Math.PI*2)
            r -= Math.PI*2;
        else if(r < Math.PI*-2)
            r += Math.PI*2;
    }*/
    //addRadiansToByteArray(r, outPocket);
    addMouseToByteArray(x, y, outPocket);
}


function getGameObject(type) {
    if (type === 0)
        return getTank(0);
    return {};
}


function getTank(type) {
    let tank: any = {};
    tank.track = new Sprite(bodyTextures[0]);
    tank.corp = new Sprite(bodyTextures[1]);
    tank.tower = new Sprite(weaponTextures[wT]);

    tank.body = new Sprite(emptyTexture);
    tank.body.position.set(256, 256);


    tank.body.addChild(tank.track);
    tank.body.addChild(tank.corp);
    tank.body.addChild(tank.tower);

    tank.track.pivot.set(32, 32);
    tank.corp.pivot.set(32, 32);
    tank.tower.pivot.set(32, 32);

    world.addChild(tank.body);

    tank.move = function (speed) {
        let x = speed * Math.sin(-this.body.rotation);
        let y = speed * Math.cos(-this.body.rotation);
        //tangLog(this.body.x, this.body.y, this.body.x - x, this.body.y - y);
        this.body.x -= x;
        this.body.y -= y;
    };

    tank.towerRotate = function (mouseX, mouseY) {
        let x = mouseX - width;
        let y = mouseY - height;
        let atan = Math.atan(y / x) + Math.PI / 2.0;
        if (x < 0)
            atan = atan + Math.PI;
        this.tower.rotation = atan - this.body.rotation;
    };

    tank.getTowerRotate = function (mouseX, mouseY) {
        let x = mouseX - width;
        let y = mouseY - height;
        let atan = Math.atan(y / x) + Math.PI / 2.0;
        if (x < 0)
            atan = atan + Math.PI;
        return atan;
    };

    tank.changeTower = function (tip) {
        this.tower.texture = weaponTextures[tip];
    };

    tank.generateConditionProtocol = function () {
        let con = {
            param1: this.body.x,
            param2: this.body.y,
            param3: this.body.rotation,
            param4: this.tower.rotation + this.body.rotation
        };
        let prot = {
            type: 6,
            content: JSON.stringify(con)
        };
        return JSON.stringify(prot);
    };

    return tank;
}




function getAmmo(iD, tipe, posX, posY, dir){
    let ammo = {
        sprite: new Sprite(ammoTextures[tipe]),
        iD: iD,
        type: tipe,
        speed: 0,
        rotata: 0,
        rotate: 0,
        live: 400,
        move: (radians: number) => {},
        splash: (x: number, y: number) => {}
    };
    ammo.sprite = new Sprite(ammoTextures[tipe]);
    ammo.sprite.x = posX;
    ammo.sprite.y = posY;
    ammo.sprite.rotation = dir;
    if(tipe === 3)
        ammo.sprite.pivot.set(16, 16);
    else
        ammo.sprite.pivot.set(16, 4);
    world.addChild(ammo.sprite);


    ammo.move = (radians: number): void => {
        let x = -this.speed * Math.sin(-radians) * deltaTime;
        let y = -this.speed * Math.cos(-radians) * deltaTime;
        /*let pX = Math.floor((this.sprite.x - x) / 64);
        let pY = Math.floor((this.sprite.y - y) / 64);
        if(pX === 1 & pY === 1){
            if(this.type !== 3){
                this.live = 0;
                this.splash(this.sprite.x, this.sprite.y);
            }
            return;
        }
        else{
            this.sprite.x += x;
            this.sprite.y += y;
        }*/
        this.sprite.x += x;
        this.sprite.y += y;
    };

    ammo.splash = function (x, y){
        if(tipe === 0){
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
        }
        if(tipe === 1){
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
        }
        if(tipe === 2){
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
            particles.push(getParticle(this.type, x, y));
        }
    };
    //ammo.speed = 24;
    //ammo.move(dir);

    if(tipe === 0) ammo.speed = 0.6;
    if(tipe === 1){
        ammo.speed = 0.9;
        ammo.live = 440;
    }
    if(tipe === 3){
        ammo.speed = 0.6;
        ammo.rotata = dir;
        ammo.sprite.scale.set(0.1, 0.1);
        ammo.sprite.rotation = Math.random()*Math.PI*2;
        ammo.rotate = (Math.random()*Math.PI*2)/100;
        ammo.live = 480;
    }

    if(tipe === 2){
        ammo.speed = 0.1;
        ammo.live = 410;
    }



    return ammo;
}

function ammoUpdate(ammo, index, ar) {
    if (ammo !== undefined) {
        ammo.live -= 1;
        if (ammo.live > 0) {
            if (ammo.type === 0 || ammo.type === 1) {
                ammo.move(ammo.sprite.rotation);
            } else if (ammo.type === 3) {
                if (ammo.sprite.scale.x < 1) {
                    ammo.sprite.scale.x += 0.02;
                    ammo.sprite.scale.y += 0.02;
                }
                //ammo.speed = ammo.speed * 0.93;
                for(let i = 0; i < deltaTime; i++){
                    ammo.speed *= 0.9966;
                }
                ammo.sprite.rotation += ammo.rotate;
                ammo.move(ammo.rotata);
            } else if (ammo.type === 2) {
                //ammo.speed = ammo.speed * 1.05;
                for(let i = 0; i < deltaTime; i++){
                    ammo.speed *= 1.0024;
                }
                ammo.move(ammo.sprite.rotation);
            }
        }
        if (ammo.live < 1) {
            world.removeChild(ammo.sprite);
            delete ar[index];
            ar[index] = undefined;
        }
    }
}

function getBox(type) {
    let box: { body: PIXI.Sprite; live: number; height: number; box: PIXI.Sprite; shadow: PIXI.Sprite; };

    box.height = 5000;
    box.live = 2000;
    box.body = new Sprite(emptyTexture);
    box.box = new Sprite(boxTextures[type]);
    box.shadow = new Sprite(boxTextures[1]);
    box.body.position.set(player.body.x, player.body.y);

    box.box.pivot.set(32, 32);
    box.shadow.pivot.set(32, 32);
    box.body.addChild(box.shadow);
    box.body.addChild(box.box);


    world.addChild(box.body);

    return box;
}

function boxUpdate(box, index, ar) {
    if (box !== undefined) {
        if (box.height > 0) {
            box.height -= deltaTime;
            if(box.height < 0)
                box.height = 0;
            box.box.alpha = 0.0002 * (5000 - box.height);
            box.shadow.alpha = 0.0002 * (5000 - box.height);
            let scale = 0.0004 * box.height + 2;
            box.box.scale.set(scale, scale);
            box.shadow.scale.set(scale, scale);
            box.shadow.x = 0.0768 * box.height;
            box.shadow.y = 0.0768 * box.height;
        } else {
            box.live -= deltaTime;
        }
        if (box.live < 1) {
            world.removeChild(box.body);
            particles.push(getParticle(99, box.body.x, box.body.y));
            particles.push(getParticle(99, box.body.x, box.body.y));
            particles.push(getParticle(99, box.body.x, box.body.y));
            particles.push(getParticle(99, box.body.x, box.body.y));
            particles.push(getParticle(99, box.body.x, box.body.y));
            particles.push(getParticle(99, box.body.x, box.body.y));
            delete ar[index];
            ar[index] = undefined;
        }
    }
}

function getParticle(tipe, posX, posY){
    let ammo: { rotate: number; sprite: PIXI.Sprite; type: any; rotata: number; speed: number; live: number; move: (radians: number) => void };
    ammo = {
        sprite: new Sprite(splashTextures[tipe]),
        type: tipe,
        speed: 4,
        rotata: 0,
        rotate: 0,
        live: 3,
        move: (radians: number) => {
            let x = -this.speed * Math.sin(-radians);
            let y = -this.speed * Math.cos(-radians);
            let pX = Math.floor((this.sprite.x - x) / 64);
            let pY = Math.floor((this.sprite.y - y) / 64);
            this.sprite.x += x;
            this.sprite.y += y;
        }
    };
    ammo.sprite = new Sprite(splashTextures[tipe]);
    ammo.sprite.x = posX;
    ammo.sprite.y = posY;
    ammo.sprite.rotation = Math.random()*Math.PI*2;
    ammo.sprite.pivot.set(16, 16);
    world.addChild(ammo.sprite);

    if(tipe === 99){
        ammo.live = 1500;
        ammo.rotata = ammo.sprite.rotation;
        ammo.rotate = (Math.random()*Math.PI*2)/100;
        ammo.speed = 0.8;
        ammo.sprite.pivot.set(32, 32);
    }


    return ammo;
}

function particleUpdate(ammo, index, ar) {
    if (ammo !== undefined) {
        if (ammo.type === 99) {
            ammo.move(ammo.rotata);
            ammo.sprite.rotation += ammo.rotate;
            ammo.live -= deltaTime;
            if(ammo.live < 0)
                ammo.live = 0;
            ammo.sprite.alpha = 0.00066 * ammo.live;
            let scale = 0.0009 * (1500 - ammo.live)+ 0.5;
            ammo.sprite.scale.set(scale, scale);
        } else {
            ammo.move(ammo.sprite.rotation);
            ammo.live -= 1;
        }
        if (ammo.live < 1) {
            world.removeChild(ammo.sprite);
            delete ar[index];
            ar[index] = undefined;
        }
    }
}
