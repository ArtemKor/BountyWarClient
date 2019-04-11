import * as PIXI from 'pixi.js';
import Mouse from 'pixi.js-mouse';
import Keyboard from 'pixi.js-keyboard';

// var cnX = new PIXI.Text("X:")
// var cnY = new PIXI.Text("Y:")

var currentScreen = 0;

var tx;
var CellSize   = 64;
var ChunkSize  = 8;
var WorldSize  = 3;
var WorldGround = [];
for(let i = 0; i < WorldSize+2; i++){
    WorldGround[i] = [];
}
var CellMulty  = 256.0 / CellSize;
var ChunkMulty = CellSize * ChunkSize;

var width = window.innerWidth/2;
var height = window.innerHeight/2;
var app, character, player, iD, to;
var deltaTime;

var outPocket = [];

var world;
var worldGroundLayer;
var worldObjectLayer;
var emptyTexture;
var groundTextures = [];
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
app.view.addEventListener("contextmenu", (e) => e.preventDefault());
// Mouse.init();

PIXI.loader
    .add("assets/map2.png")
    .add("assets/ground_object.png")
    .add("assets/tank_base_Green.png")
    .add("assets/tank_weapon_Green.png")
    .add("assets/tank_ammo.png")
    .add("assets/tank_ammo_splash.png")
    .add("assets/box.png")
    .add("assets/particle.png")
    .add("assets/G.png")
    .add("assets/G_C.png")
    .add("assets/G_Waste.png")
    .load(setup);


function setup() {

    groundTextures[0] = new PIXI.Texture(resources["assets/G.png"].texture.baseTexture, new Rectangle(0, 0, 64, 64));
    groundTextures[1] = [];
    groundTextures[1][0] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 128, 32, 32));// 0 - all
    groundTextures[1][1] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 128, 32, 32));
    groundTextures[1][2] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 96, 32, 32));
    groundTextures[1][3] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 96, 32, 32));
    groundTextures[1][4] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 64, 32, 32));// 4 - gor
    groundTextures[1][5] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 64, 32, 32));
    groundTextures[1][6] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 160, 32, 32));
    groundTextures[1][7] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 160, 32, 32));
    groundTextures[1][8] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(0, 128, 32, 32));// 8 - ver
    groundTextures[1][9] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(96, 128, 32, 32));
    groundTextures[1][10] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(96, 96, 32, 32));
    groundTextures[1][11] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(0, 96, 32, 32));
    groundTextures[1][12] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(0, 0, 32, 32)); // 12 - out corner
    groundTextures[1][13] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 0, 32, 32));
    groundTextures[1][14] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(32, 32, 32, 32));
    groundTextures[1][15] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(0, 32, 32, 32));
    groundTextures[1][16] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 0, 32, 32)); // 16 - inner corner
    groundTextures[1][17] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(96, 0, 32, 32));
    groundTextures[1][18] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(96, 32, 32, 32));
    groundTextures[1][19] = new PIXI.Texture(resources["assets/G_C.png"].texture.baseTexture, new Rectangle(64, 32, 32, 32));
    groundTextures[2] = [];
    groundTextures[2][0] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 128, 32, 32));// 0 - all
    groundTextures[2][1] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 128, 32, 32));
    groundTextures[2][2] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 96, 32, 32));
    groundTextures[2][3] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 96, 32, 32));
    groundTextures[2][4] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 64, 32, 32));// 4 - gor
    groundTextures[2][5] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 64, 32, 32));
    groundTextures[2][6] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 160, 32, 32));
    groundTextures[2][7] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 160, 32, 32));
    groundTextures[2][8] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(0, 128, 32, 32));// 8 - ver
    groundTextures[2][9] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(96, 128, 32, 32));
    groundTextures[2][10] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(96, 96, 32, 32));
    groundTextures[2][11] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(0, 96, 32, 32));
    groundTextures[2][12] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(0, 0, 32, 32)); // 12 - out corner
    groundTextures[2][13] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 0, 32, 32));
    groundTextures[2][14] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(32, 32, 32, 32));
    groundTextures[2][15] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(0, 32, 32, 32));
    groundTextures[2][16] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 0, 32, 32)); // 16 - inner corner
    groundTextures[2][17] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(96, 0, 32, 32));
    groundTextures[2][18] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(96, 32, 32, 32));
    groundTextures[2][19] = new PIXI.Texture(resources["assets/G_Waste.png"].texture.baseTexture, new Rectangle(64, 32, 32, 32));



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

    app.ticker.add(delta => gameLoop(delta));
    //console.log("ws://" + location.hostname + ":" + location.port);


    // let chunk:any = {};
    // chunk.data = [];
    // for(let i = 0; i < ChunkSize; i++) {
    //     chunk.data[i] = [];
    // }
    //
    // chunk.data[0][2] = 5;
    // chunk.data[1][1] = 5;
    //
    // let t = chunk.data[0][2];
    // console.log(t);
    // t = chunk.data[1][1];
    // console.log(t);


    //socket = new WebSocket("wss://bountywar.herokuapp.com/bountywar");
    socket = new WebSocket("ws://192.168.0.146:8082/bountywar");//bountywar
    socket.binaryType = 'arraybuffer';
    socket.onopen = function () {

    };

    socket.onclose = function (event) {
        alert("Disconnected !!!");
    };

    socket.onmessage = function (event) {
        var k = new Int8Array(event.data);
        // console.log('Get Data: '+ k);
        incomePoket(k);
        //delete(event);
    };

    socket.onerror = function (error) {
        alert("Disconnected !!!");
    };
    startMenue()
}

function startProcess() {
    app.stage.removeChild(world);
    world = new Sprite(emptyTexture);
    // worldGroundLayer = new Sprite(emptyTexture);
    // worldObjectLayer = new Sprite(emptyTexture);
    world.addChild(worldGroundLayer);
    world.addChild(worldObjectLayer);

    // let spriteL = new Sprite(resources["assets/map2.png"].texture);
    app.stage.addChild(world);
    world.x = width;
    world.y = height;
    // world.addChild(spriteL);
    // spriteL.x = -32;
    // spriteL.y = -32;

    if (player === undefined) {
        player = getGameObject(6)
    } else {
        worldObjectLayer.addChild(player.body);
    }
    // player.body.addChild(cnX);
    // cnX.y = -40;
    // player.body.addChild(cnY);
    // cnY.y = -20;

    //console.log(world);
}

function startMenue() {
    app.stage.removeChild(world);
    world = new Sprite(emptyTexture);
    worldGroundLayer = new Sprite(emptyTexture);
    worldObjectLayer = new Sprite(emptyTexture);
    app.stage.addChild(world);
    world.x = width;
    world.y = height;
    let txs = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    })
    tx = new PIXI.Text("Create new Tank", txs)
    world.addChild(tx);
    tx.x = 0;
    tx.y = 0;
}

function gameLoop(delta) {
    deltaTime = Date.now() - currentTime;
    currentTime = Date.now();
    Keyboard.update();
    Mouse.update();
    if (currentScreen === 1) {
        play(deltaTime);
    } else if (currentScreen === 0) {
        menue(deltaTime);
    }
}

function menue(delta) {
    if (Keyboard.isKeyDown('Enter')){
        let out = [];
        out.push(1);
        out.push(6);
        let arr = new Int8Array(out);
        socket.send(arr.buffer);
    }
    if (iD != undefined){
        startProcess();
        currentScreen = 1
    }
}

function play(delta) {

    // console.log(Mouse.getPosX());
    // if (Mouse.isButtonDown(Mouse.Button.LEFT))
    //     console.log("LEFT");
    // if (Mouse.isButtonDown(Mouse.Button.RIGHT))
    //     console.log("RIGHT");
    // if (Mouse.isButtonDown(Mouse.Button.MIDDLE))
    //     console.log("MIDDLE");
    // if (Mouse.isButtonDown(Mouse.Button.FOURTH))
    //     console.log("FOURTH");
    // if (Mouse.isButtonDown(Mouse.Button.FIFTH))
    //     console.log("FIFTH");
    // cnX.text = "X: "+ player.body.x/ChunkMulty
    // cnY.text = "Y: "+ player.body.y/ChunkMulty
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
        arr = null;
        //delete arr;
        // @ts-ignore
        outPocket = null;
        //delete outPocket;
        outPocket = [];
    }
}


function incomePoket(pocket) {
    for(let i = 0; i < pocket.length;){
        if(pocket[i] === 0){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            iD = "" + id;
            // console.log('Ressive ID: '+ id);
            player = getGameObject(6);
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
                objects["" + id] = getGameObject(6);
                outPocket.push(5);
                outPocket.push(pocket[i+1]);
                outPocket.push(pocket[i+2]);
                outPocket.push(pocket[i+3]);
                outPocket.push(pocket[i+4]);
            }
            if (pocket[i+5] === 6) {
                //console.log('Ressive Position: '+ id);
                objects["" + id].body.x = getCoord(pocket[i + 6], pocket[i + 7], pocket[i + 8]);
                //console.log("bytes:// " + pocket[i+5] + "," + pocket[i+6] + "," + pocket[i+7]);
                //console.log("ws://" + objects["" + id].body.x);
                objects["" + id].body.y = getCoord(pocket[i + 9], pocket[i + 10], pocket[i + 11]);
                objects["" + id].body.rotation = getRadians(pocket[i + 12], pocket[i + 13]);
                objects["" + id].tower.rotation = getRadians(pocket[i + 14], pocket[i + 15]) - objects["" + id].body.rotation;
                //console.log('Ressive Position: '+ id);
                i += 16;
            }
        } else if(pocket[i] === 2){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            // console.log('Ressive Vision: '+ id);
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
            } else if (iD === "" + id ) {
                objects = {};
                app.stage.removeChild(world);
                startMenue();
                currentScreen = 0;
            } else {
                worldObjectLayer.removeChild(objects["" + id].body);
                delete objects["" + id];
            }
            i += 5;
        } else if (pocket[i] === 12){
            let id = getID(pocket[i+1], pocket[i+2], pocket[i+3], pocket[i+4]);
            if (objects["" + id] !== undefined) {
                worldObjectLayer.removeChild(objects["" + id].sprite);
                objects["" + id].live = 0;
                objects["" + id].splash(getCoord(pocket[i+5], pocket[i+6], pocket[i+7]), getCoord(pocket[i+8], pocket[i+9], pocket[i+10]));
                delete objects["" + id];
            }
            i += 11;
        } else if (pocket[i] === 14){
            /*for(let p = 0; p < 1024; p++){
                if(pocket[i+p+1] === 1){
                    let kx = (p%32);
                    let ky = ~~(p/32);
                    //console.log("x: " + kx + "   y: " + ky);
                    groundObject[kx][ky] = new Sprite(groundObjectTextures[1]);
                    groundObject[kx][ky].position.set(kx*64, ky*64);
                    world.addChild(groundObject[kx][ky]);
                }
            }
            i += 1025;*/
            generateGround(i, pocket);
            i += 3;
            i += ChunkSize*ChunkSize;
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

function drawCell(nx, ny, Cxx, Cyy, t, container) {
    if (t === 0) {
        let sp = new PIXI.Sprite(groundTextures[0]);
        sp.x = 64 * nx;
        sp.y = 64 * ny;
        container.addChild(sp)
    } else if (t === 1 || t === 2) {
        let k0 = false;
        let k1 = false;
        let k2 = false;
        let k3 = false;

        let k5 = false;
        let k6 = false;
        let k7 = false;
        let k8 = false;
        let p = getCell(nx + Cxx - 1, ny + Cyy - 1);
        if (p === t) {
            k0 = true
        }
        p = getCell(nx + Cxx, ny + Cyy - 1);
        if (p === t) {
            k1 = true
        }
        p = getCell(nx + Cxx + 1, ny + Cyy - 1);
        if (p === t) {
            k2 = true
        }
        p = getCell(nx + Cxx - 1, ny + Cyy);
        if (p === t) {
            k3 = true
        }
        p = getCell(nx + Cxx + 1, ny + Cyy);
        if (p === t) {
            k5 = true
        }
        p = getCell(nx + Cxx - 1, ny + Cyy + 1);
        if (p === t) {
            k6 = true
        }
        p = getCell(nx + Cxx, ny + Cyy + 1);
        if (p === t) {
            k7 = true
        }
        p = getCell(nx + Cxx + 1, ny + Cyy + 1);
        if (p === t) {
            k8 = true
        }

        let d = 0;
        if (k0 && k1 && k3)
            d = 0;
        else if (!k0 && k1 && k3)
            d = 4;
        else if (!k1 && k3)
            d = 1;
        else if (k1 && !k3)
            d = 2;
        else if (!k1 && !k3)
            d = 3;
        let sp = new PIXI.Sprite(groundTextures[t][d * 4]);
        sp.x = 64 * nx;
        sp.y = 64 * ny;
        container.addChild(sp)

        if (k2 && k1 && k5)
            d = 0;
        else if (!k2 && k1 && k5)
            d = 4;
        else if (!k1 && k5)
            d = 1;
        else if (k1 && !k5)
            d = 2;
        else if (!k1 && !k5)
            d = 3;
        sp = new PIXI.Sprite(groundTextures[t][1 + d * 4]);
        sp.x = 64 * nx + 32;
        sp.y = 64 * ny;
        container.addChild(sp)

        if (k8 && k7 && k5)
            d = 0;
        else if (!k8 && k7 && k5)
            d = 4;
        else if (!k7 && k5)
            d = 1;
        else if (k7 && !k5)
            d = 2;
        else if (!k7 && !k5)
            d = 3;
        sp = new PIXI.Sprite(groundTextures[t][2 + d * 4]);
        sp.x = 64 * nx + 32;
        sp.y = 64 * ny + 32;
        container.addChild(sp)

        if (k6 && k7 && k3)
            d = 0;
        else if (!k6 && k7 && k3)
            d = 4;
        else if (!k7 && k3)
            d = 1;
        else if (k7 && !k3)
            d = 2;
        else if (!k7 && !k3)
            d = 3;
        sp = new PIXI.Sprite(groundTextures[t][3 + d * 4]);
        sp.x = 64 * nx;
        sp.y = 64 * ny + 32;
        container.addChild(sp)
    }
}

function updateGround(Cx, Cy){

    let chunks = WorldGround[Cx];
    if (chunks === undefined)
        return;
    // console.log("Cy: " + Cy)
    let chunk = chunks[Cy];
    if (chunk === undefined)
        return;

    let container = new PIXI.Container();

    let Cxx = Cx * ChunkSize;
    let Cyy = Cy * ChunkSize;
    // console.log("Cxx: " + Cxx + "   Cyy: " + Cyy);
    for(let nx = 0; nx < ChunkSize; nx++){
        for(let ny = 0; ny < ChunkSize; ny++){
            // if (nx === 0 || nx === ChunkSize-1 || ny === 0 || ny === ChunkSize-1) {
                let t = chunk.data[nx][ny];
                // console.log(nx + ", " + ny)
                // console.log(t)
                drawCell(nx, ny, Cxx, Cyy, t, container)
            // }
        }
    }
    app.renderer.render(container, chunk.rt);
}

function generateGround(shift, arr){
    let Cx = arr[shift+1];
    let Cy = arr[shift+2];
    let brt = new PIXI.BaseRenderTexture(ChunkMulty, ChunkMulty, PIXI.SCALE_MODES.LINEAR, 1);
    let rt = new PIXI.RenderTexture(brt);
    let container = new PIXI.Container();
    let chunk:any = {};
    chunk.sprite = new PIXI.Sprite(rt);
    chunk.rt = rt;
    chunk.sprite.x = Cx * ChunkMulty;
    chunk.sprite.y = Cy * ChunkMulty;
    chunk.data = [];
    for(let i = 0; i < ChunkSize; i++) {
        chunk.data[i] = [];
    }
    for(let i = 0; i < ChunkSize*ChunkSize; i++){
        let n = arr[shift + 3 + i];
        // console.log(n);
        let x = i % ChunkSize;
        let y = ~~(i / ChunkSize);
        // console.log(x + ", " + y)
        chunk.data[x][y] = n
    }


    if (WorldGround[Cx][Cy] != undefined) {
        worldGroundLayer.removeChild(WorldGround[Cx][Cy].sprite)
    }
    WorldGround[Cx][Cy] = chunk;
    worldGroundLayer.addChild(WorldGround[Cx][Cy].sprite)


    let Cxx = Cx * ChunkSize;
    let Cyy = Cy * ChunkSize;
    // console.log("Cxx: " + Cxx + "   Cyy: " + Cyy);
    for(let nx = 0; nx < ChunkSize; nx++){
        for(let ny = 0; ny < ChunkSize; ny++){
            let t = chunk.data[nx][ny];
            // console.log(nx + ", " + ny)
            // console.log(t)
            drawCell(nx, ny, Cxx, Cyy, t, container)
        }
    }

    app.renderer.render(container, rt);

    updateGround(Cx-1, Cy-1);
    updateGround(Cx, Cy-1);
    updateGround(Cx+1, Cy-1);
    updateGround(Cx-1, Cy);
    updateGround(Cx+1, Cy);
    updateGround(Cx-1, Cy+1);
    updateGround(Cx, Cy+1);
    updateGround(Cx+1, Cy+1);
}

function getCell(x, y): number{
    // console.log("X: " + x + "   Y: " + y)
    let Cx = ~~(x / ChunkSize);
    // console.log("Cx: " + Cx)
    let chunks = WorldGround[Cx];
    if (chunks === undefined)
        return;
    let Cy = ~~(y / ChunkSize);
    // console.log("Cy: " + Cy)
    let chunk = chunks[Cy];
    if (chunk === undefined)
        return;
    let nx = x % ChunkSize;
    // console.log("nx: " + nx)
    let column = chunk.data[nx];
    if (column === undefined)
        return;
    let ny = y % ChunkSize;
    // console.log("ny: " + ny)
    // console.log("return: " + column[ny])
    return column[ny];
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
    return toInt(byte1)*ChunkMulty + toInt(byte2)*CellSize + toInt(byte3)/CellMulty;
}

function getRadians(byte1, byte2){
    return byte1 + byte2/100.0;
}

function addRadiansToByteArray(rad, arr){
    arr.push(~~rad);
    arr.push(~~((rad%1.0)*100));
}

function addMouseToByteArray(x, y, arr){
    arr.push(~~(x/256));
    arr.push(~~(x%256));
    arr.push(~~(y/256));
    arr.push(~~(y%256));
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
    let x = mouseX - width + 32768;
    let y = mouseY - height + 32768;
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
    if (type === 6)
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

    worldObjectLayer.addChild(tank.body);

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
    worldObjectLayer.addChild(ammo.sprite);


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
            worldObjectLayer.removeChild(ammo.sprite);
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


    worldObjectLayer.addChild(box.body);

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
            worldObjectLayer.removeChild(box.body);
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
    worldObjectLayer.addChild(ammo.sprite);

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
            worldObjectLayer.removeChild(ammo.sprite);
            delete ar[index];
            ar[index] = undefined;
        }
    }
}
