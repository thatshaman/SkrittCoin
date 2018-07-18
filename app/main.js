var urlParams = {};
var hashParams = {};

// Parse URL parameters + hash
(window.onpopstate = function () {
    var match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); }, query = window.location.search.substring(1);
    while (match = search.exec(query)) urlParams[decode(match[1])] = decode(match[2]);

    var e, a = /\+/g, r = /([^&;=]+)=?([^&;]*)/g, d = function (s) { return decodeURIComponent(s.replace(a, " ")); }, q = window.location.hash.substring(1);
    while (e = r.exec(q)) hashParams[d(e[1])] = d(e[2]);
})();

var seed = Math.abs(Math.floor(parseInt("0x" + urlParams.s))) || 0;
if (seed === 0) {
    seed = Math.floor(Math.random() * 4294967295) + 1;
}

var seededRandom = new SeededRandom(seed);
window.history.replaceState(undefined, undefined, '?s=' + seed.toString(16).toUpperCase());

var renderSize = 640;
var tilesize = 32;
//

var renderer = PIXI.autoDetectRenderer(renderSize, renderSize, { backgroundColor: 0xFFFFFF });
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var gridContainer = new PIXI.Container();
var overlayContainer = new PIXI.Container();

var skritt;
var level;
var messagestack = new Messagestack();

var playerSprite = new PIXI.Sprite();
var lightmap1 = new PIXI.Sprite();
var lightmap2 = new PIXI.Sprite();
var background = new PIXI.Sprite();
var overworld = new PIXI.Sprite();
var overworldFront = [];
var effects = new PIXI.Sprite();

var grid = [];

var overlay = [];
var overlayPostion = { left: 0, right: 1, top: 2, bottom: 3 };

var states = { unknown: -1, loading: 0, menu: 1, killed: 2, playing: 3 }
var state = states.unknown;
var previousState = states.unknown;

var gridSize = Math.floor(renderSize / tilesize) + 2;
var gridCenter = Math.floor(gridSize / 2);
var lastTileUpdate = 0;
var refreshTiles = true;
var previoustimestamp = 0;
var timedelta = 0;
var pushtime = 0;

var score = 0;
var loot;

var player = { x: 0, y: 0, tx: 0, ty: 0 };
var target = { x: 0, y: 0, tx: 0, ty: 0 };

var debug = { noclip: false, god: false, statistics: true };

var animations = {
    dirt: [],
    dirtCounter: 0,
    sand: undefined,
    gravel: undefined,
    shiny: undefined,
    chest: undefined,
    playerIdle: undefined,
    playerMove: undefined,
    playerPush: undefined
};


// Chain load texture callback hell
function load() {
    setState(states.loading);
    PIXI.loader.add("graphics/tiles.json").load(function () {
        PIXI.loader.add("backdrop", "graphics/backdrop.jpg").load(function () {
            PIXI.loader.add("overworld", "graphics/overworld.png").load(function () {
                PIXI.loader.add("overworld2", "graphics/overworld2.png").load(function () {
                    PIXI.loader.add("lightmap1", "graphics/lightmap1.jpg").load(function () {
                        PIXI.loader.add("lightmap2", "graphics/lightmap2.jpg").load(function () {
                            initialize();
                        });
                    });
                });
            });
        });
    });
}

// Pause game from menu or button
function pause() {
    sfx.click.play();
    previousState = state;
    state = states.pause;
    document.getElementById("gameMenu").style.display = "flex";
}

// Resume game from menu or button
function unpause() {
    sfx.click.play();
    state = previousState;
    document.getElementById("gameMenu").style.display = "none";
}

// RIP
function abandon() {
    skritt = new Skritt();
    document.getElementById("skritt").innerText = skritt.Name;

    level.setTile(player.tx, player.ty, level.tiletypes.none, false);
    player.tx = Math.floor(level.dimensions.width / 2);
    player.ty = 0;
    player.x = (player.tx * 32) + 16;
    player.y = 16;
    level.setTile(player.tx, player.ty, level.tiletypes.player, false);
    unpause();
}

function newLevel() {
    seed = Math.floor(Math.random() * 4294967295) + 1;
    seededRandom = new SeededRandom(seed);
    window.history.replaceState(undefined, undefined, '?s=' + seed.toString(16).toUpperCase());
    unpause();
    setState(states.loading);
    newGame();
}

// Only show the touch controls on touch devices
window.addEventListener('touchstart', function () {
    document.getElementById("touch").style.display = "block";
});

// Disable context menu on touch elements
window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};

// Long press bug fix for iOS safari
document.ontouchmove = function (event) {
    event.preventDefault();
}

// fullscreen support for all browsers except (drumroll please) Safari
function toggleFullscreen() {
    sfx.click.play();
    var elem = document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function initialize() {

    newGame();

    background = new PIXI.Sprite();
    background.texture = PIXI.utils.TextureCache["backdrop"];
    stage.addChild(background);

    overworld = new PIXI.Sprite();
    overworld.texture = PIXI.utils.TextureCache["overworld"];
    stage.addChild(overworld);

    for (i = 0; i < 2; i++) {
        overworldFront[i] = new PIXI.Sprite();
        overworldFront[i].texture = PIXI.utils.TextureCache["overworld2"];
        stage.addChild(overworldFront[i]);
    }

    createGrid();

    //// PLAYER

    var playerIdleFrames = [];
    for (var i = 0; i < 50; i++) {
        playerIdleFrames.push(PIXI.utils.TextureCache["player_idle_0"]);
    }
    playerIdleFrames.push(PIXI.utils.TextureCache["player_idle_1"]);
    playerIdleFrames.push(PIXI.utils.TextureCache["player_idle_2"]);
    playerIdleFrames.push(PIXI.utils.TextureCache["player_idle_1"]);
    animations.playerIdle = new PIXI.extras.AnimatedSprite(playerIdleFrames);
    animations.playerIdle.animationSpeed = 0.1;
    animations.playerIdle.play();
    playerSprite.addChild(animations.playerIdle);

    var playerMoveFrames = [];
    for (var i = 0; i < 4; i++) {
        playerMoveFrames.push(PIXI.utils.TextureCache["player_move_" + i]);
    }
    animations.playerMove = new PIXI.extras.AnimatedSprite(playerMoveFrames);
    animations.playerMove.animationSpeed = 0.25;
    animations.playerMove.play();
    animations.playerMove.visible = false;
    playerSprite.addChild(animations.playerMove);

    animations.playerPush = new PIXI.Sprite();
    animations.playerPush.visible = false;
    animations.playerPush.texture = PIXI.utils.TextureCache["player_push"];
    playerSprite.addChild(animations.playerPush);

    // center player
    playerSprite.position.x = renderSize / 2 - 16;
    playerSprite.position.y = renderSize / 2 - 16;


    stage.addChild(playerSprite);

    //////////////////

    // dirt animation
    var dirtFrames = [];
    for (var i = 0; i < 4; i++) {
        dirtFrames.push(PIXI.utils.TextureCache["tile_20a" + i]);
    }
    dirtFrames.push(PIXI.utils.TextureCache["animationend"]);


    for (i = 0; i < 3; i++) {
        animations.dirt[i] = new PIXI.extras.AnimatedSprite(dirtFrames);
        animations.dirt[i].anchor.set(0.25);
        animations.dirt[i].animationSpeed = 0.3;
        animations.dirt[i].position.x = -9000;
        animations.dirt[i].position.y = -9000;
        animations.dirt[i].loop = false;
        effects.addChild(animations.dirt[i]);
    }

    var sandFrames = [];
    for (var i = 0; i < 4; i++) {
        sandFrames.push(PIXI.utils.TextureCache["tile_3a" + i]);
    }
    sandFrames.push(PIXI.utils.TextureCache["animationend"]);


    // sand animation
    animations.sand = new PIXI.extras.AnimatedSprite(sandFrames);
    animations.sand.anchor.set(0.25);
    animations.sand.animationSpeed = 0.2;
    animations.sand.position.x = -9000;
    animations.sand.position.y = -9000;
    animations.sand.loop = false;
    effects.addChild(animations.sand);

    var gravelFrames = [];
    for (var i = 0; i < 4; i++) {
        gravelFrames.push(PIXI.utils.TextureCache["tile_2a" + i]);
    }
    gravelFrames.push(PIXI.utils.TextureCache["animationend"]);

    // gravel animation
    animations.gravel = new PIXI.extras.AnimatedSprite(gravelFrames);
    animations.gravel.anchor.set(0.25);
    animations.gravel.animationSpeed = 0.2;
    animations.gravel.position.x = -9000;
    animations.gravel.position.y = -9000;
    animations.gravel.loop = false;
    effects.addChild(animations.gravel);


    var shinyFrames = [];
    for (var i = 0; i < 4; i++) {
        shinyFrames.push(PIXI.utils.TextureCache["tile_10a" + i]);
    }
    shinyFrames.push(PIXI.utils.TextureCache["animationend"]);

    // shiny animation
    animations.shiny = new PIXI.extras.AnimatedSprite(shinyFrames);
    animations.shiny.anchor.set(0.25);
    animations.shiny.animationSpeed = 0.3;
    animations.shiny.position.x = -9000;
    animations.shiny.position.y = -9000;
    animations.shiny.loop = false;
    effects.addChild(animations.shiny);


    var chestFrames = [];
    for (var i = 0; i < 4; i++) {
        chestFrames.push(PIXI.utils.TextureCache["tile_11a" + i]);
    }

    for (var i = 0; i < 6; i++) {
        chestFrames.push(PIXI.utils.TextureCache["tile_11a3"]);
    }
    chestFrames.push(PIXI.utils.TextureCache["animationend"]);

    // shiny animation
    animations.chest = new PIXI.extras.AnimatedSprite(chestFrames);
    animations.chest.anchor.set(0.25);
    animations.chest.animationSpeed = 0.2;
    animations.chest.position.x = -9000;
    animations.chest.position.y = -9000;
    animations.chest.loop = false;
    effects.addChild(animations.chest);

    effects.position.x = 0;
    effects.position.y = 0;

    stage.addChild(effects);


    lightmap1.texture = PIXI.utils.TextureCache["lightmap1"];
    lightmap1.alpha = 0;
    lightmap1.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    stage.addChild(lightmap1);

    lightmap2.texture = PIXI.utils.TextureCache["lightmap2"];
    lightmap2.alpha = 1;
    lightmap2.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    stage.addChild(lightmap2);

    resize();
    draw();
};

function createGrid() {
    for (var y = 0; y < gridSize; y++) {
        grid[y] = [];
        overlay[y] = [];
        for (var x = 0; x < gridSize; x++) {

            grid[y][x] = new PIXI.Sprite();
            grid[y][x].position.x = (x * 32);
            grid[y][x].position.y = (y * 32);
            grid[y][x].texture = PIXI.utils.TextureCache["tile_5"];
            gridContainer.addChild(grid[y][x]);

            overlay[y][x] = [];
            for (o = 0; o < 4; o++) {
                overlay[y][x][o] = new PIXI.Sprite();
                overlay[y][x][o].position.y = y * 32;
                overlay[y][x][o].position.x = x * 32;
                overlayContainer.addChild(overlay[y][x][o]);
            }

            overlay[y][x][overlayPostion.left].position.x = (x * 32) - tilesize / 2;
            overlay[y][x][overlayPostion.left].texture = PIXI.utils.TextureCache["overlay_L"];

            overlay[y][x][overlayPostion.right].position.x = (x * 32) + tilesize / 2;
            overlay[y][x][overlayPostion.right].texture = PIXI.utils.TextureCache["overlay_R"];

            overlay[y][x][overlayPostion.top].position.y = (y * 32) - tilesize / 2;
            overlay[y][x][overlayPostion.top].texture = PIXI.utils.TextureCache["overlay_T"];

            overlay[y][x][overlayPostion.bottom].position.y = (y * 32) + tilesize / 2;
            overlay[y][x][overlayPostion.bottom].texture = PIXI.utils.TextureCache["overlay_B"];

        }
    }

    stage.addChild(gridContainer);
    stage.addChild(overlayContainer);
}

function setState(newstate) {

    if (state === states.loading) {
        document.getElementById("loading").style.display = "none";
    }

    if (newstate === states.loading) {
        document.getElementById("loading").style.display = "flex";
    }
    state = newstate;
}

function showAnimation(type, x, y) {

    if (type >= level.tiletypes.mud && type < level.tiletypes.stone) {
        animations.dirt[animations.dirtCounter].x = x;
        animations.dirt[animations.dirtCounter].y = y;
        animations.dirt[animations.dirtCounter].gotoAndPlay(0);
        animations.dirtCounter = (animations.dirtCounter + 1) % 3;
    } else if (type === level.tiletypes.sand) {
        animations.sand.x = x;
        animations.sand.y = y;
        animations.sand.gotoAndPlay(0);
    } else if (type === level.tiletypes.gravel) {
        animations.gravel.x = x;
        animations.gravel.y = y;
        animations.gravel.gotoAndPlay(0);
    } else if (type === level.tiletypes.shiny) {
        animations.shiny.x = x;
        animations.shiny.y = y;
        animations.shiny.gotoAndPlay(0);
    } else if (type === level.tiletypes.chest) {
        animations.chest.x = x;
        animations.chest.y = y;
        animations.chest.gotoAndPlay(0);
    }
}

function addShinies(val) {
    score += val;
    document.getElementById("score").innerText = score;
}

function newGame() {

    setState(states.loading);
    messagestack.Reset();

    skritt = new Skritt();
    document.getElementById("skritt").innerText = skritt.Name;

    level = new Level(seed);
    loot = new Loot(seed);
    score = 0;
    addShinies(0);

    player.tx = Math.floor(level.dimensions.width / 2);
    player.ty = 0;
    player.x = (player.tx * 32) + 16;
    player.y = 16;

    level.setTile(player.tx, player.ty, level.tiletypes.player, false);

    setState(states.playing);
}

function toggleOverlay(x, y, position, tile, neighbour) {
    if (tile >= level.tiletypes.stone && neighbour < level.tiletypes.stone) {
        overlay[y][x][position].visible = true;
    }
    else {
        overlay[y][x][position].visible = false;
    }
}

draw = function (timestamp) {

    timedelta = timestamp - previoustimestamp;
    previoustimestamp = timestamp;

    if (refreshTiles) {
        for (var y = 0; y < gridSize; y++) {
            for (var x = 0; x < gridSize; x++) {

                var tx = Math.floor(player.x / tilesize) - gridCenter + x;
                var ty = Math.floor(player.y / tilesize) - gridCenter + y;

                grid[y][x].position.y = (y * 32);

                if (ty < 0) {
                    grid[y][x].texture = PIXI.utils.TextureCache["tile_" + level.tiletypes.none];
                } else if (ty >= level.dimensions.height) {
                    grid[y][x].texture = PIXI.utils.TextureCache["tile_" + level.tiletypes.lava];
                } else if (tx < 0) {
                    grid[y][x].texture = PIXI.utils.TextureCache["tile_" + level.tiletypes.stone];
                } else if (tx >= level.dimensions.width) {
                    grid[y][x].texture = PIXI.utils.TextureCache["tile_" + level.tiletypes.stone];
                } else {
                    var tile = level.getTile(tx, ty);
                    if (tile !== level.tiletypes.unknown) {
                        grid[y][x].texture = PIXI.utils.TextureCache["tile_" + tile];
                    } else {
                        grid[y][x].texture = PIXI.utils.TextureCache["tile_" + level.tiletypes.stone];

                    }
                }

                // Overlays
                if (tx > 0 && ty > 0 && tx < level.dimensions.width && ty < level.dimensions.height - 1) {

                    var tile = level.getTile(tx, ty);
                    if ((tile >= 20 && tile < 60)) {
                        toggleOverlay(x, y, overlayPostion.left, tile, level.getTile(tx - 1, ty));
                        toggleOverlay(x, y, overlayPostion.right, tile, level.getTile(tx + 1, ty));
                        toggleOverlay(x, y, overlayPostion.top, tile, level.getTile(tx, ty - 1));
                        toggleOverlay(x, y, overlayPostion.bottom, tile, level.getTile(tx, ty + 1));
                    } else {
                        for (var p = 0; p < 4; p++) {
                            if (overlay[y][x][p].visible) {
                                overlay[y][x][p].visible = false;
                            }
                        }
                    }

                } else {
                    // clear out of bounds
                    for (var p = 0; p < 4; p++) {
                        if (overlay[y][x][p].visible) {
                            overlay[y][x][p].visible = false;
                        }
                    }
                }
            }
        }

        if (player.y > 0) {
            overworld.y = Math.floor(- player.y);
        } else {
            overworld.y = 0;
        }

        overworldFront[0].x = 1024 - Math.floor((player.x / 5) % 1024);
        overworldFront[0].y = overworld.y;
        overworldFront[1].x = 1024 - Math.floor((player.x / 5) % 1024) - 1024;
        overworldFront[1].y = overworld.y;

        refreshTiles = false;
    }

    // move grid and overlay containers in position
    gridContainer.position.x = Math.round(-tilesize - (player.x % tilesize));
    gridContainer.position.y = Math.round(-tilesize - (player.y % tilesize));

    overlayContainer.position.x = gridContainer.position.x;
    overlayContainer.position.y = gridContainer.position.y;

    // make things darker when you go down
    if (player.y > 1200 && lightmap1.alpha !== 1) {
        lightmap1.alpha = 1;
    } else if (player.y > 100) {
        lightmap1.alpha = (player.y - 100) * 0.001;
    }
    else {
        lightmap1.alpha = 0;
    }

    if (player.y > 12000 && lightmap1.alpha !== 1) {
        lightmap2.alpha = 1;
    } else if (player.y > 11000) {
        lightmap2.alpha = (player.y - 11000) * 0.001;
    }
    else {
        lightmap2.alpha = 0;
    }
    
    // make the tiles "fall" down if they have velocity set to true
    var velocityOffset = Math.floor((timestamp - lastTileUpdate) * 0.128);
    for (var y = 0; y < gridSize; y++) {
        for (var x = 0; x < gridSize; x++) {

            var tx = Math.floor(player.x / tilesize) - gridCenter + x;
            var ty = Math.floor(player.y / tilesize) - gridCenter + y;

            if (level.getVelocity(tx, ty)) {
                grid[y][x].y = (y * 32) + (velocityOffset - 32);
            }
        }
    }


    effects.position.x = 320 - player.x;
    effects.position.y = 320 - player.y;

    renderer.render(stage);
    update(timestamp);
    requestAnimationFrame(draw);
};

update = function (timestamp) {

    if (state == states.playing) {
        if (timestamp - lastTileUpdate > 250) {

            var updates = level.Update();
            lastTileUpdate = timestamp;
            if (updates > 0) refreshTiles = true;
        }

        var camspeed = timedelta * 0.15;
        var moved = false;

        target.x = player.x;
        target.y = player.y;
        target.tx = player.tx;
        target.ty = player.ty;


        if (input.right) {
            target.x += camspeed;
            playerSprite.position.x = playerSprite.position.x = renderSize / 2 + 16;
            playerSprite.scale.x = -1;
            moved = true;
        }

        if (input.left) {
            target.x -= camspeed;
            playerSprite.position.x = playerSprite.position.x = renderSize / 2 - 16;
            playerSprite.scale.x = 1;
            moved = true;
        }

        if (input.up) {
            target.y -= camspeed;
            moved = true;
        }


        if (input.down) {
            target.y += camspeed;
            moved = true;
        }

        if (moved) {
            target.tx = Math.floor(target.x / 32);
            target.ty = Math.floor(target.y / 32);


            animations.playerIdle.visible = false;
            animations.playerMove.visible = true;
            animations.playerPush.visible = false;

            var cont = false;
            var tile = level.getTile(target.tx, target.ty);

            if (target.tx >= 0 && target.ty >= 0 && target.ty < level.dimensions.height && target.tx < level.dimensions.width) {

                if (tile === level.tiletypes.sand || tile === level.tiletypes.gravel) {
                    if (pushtime > 250) {
                        cont = true;
                        pushtime = 0;
                    } else {
                        pushtime += timedelta;
                    }
                } else if (tile < level.tiletypes.stone && tile !== level.tiletypes.rock && tile !== level.tiletypes.water && tile !== level.tiletypes.lava) {
                    cont = true;
                    pushtime = 0;
                } else {
                    pushtime = 0;
                }
            }


            if (cont || debug.noclip) {
                if (!debug.noclip) {
                    level.setTile(player.tx, player.ty, level.tiletypes.none, false);
                }

                player.x = target.x;
                player.y = target.y;
                player.tx = target.tx;
                player.ty = target.ty;

                if (tile >= level.tiletypes.mud) {
                    showAnimation(tile, player.tx * 32, player.ty * 32);
                    if (!sfx.digMud.playing()) {
                        sfx.digMud.rate((Math.random() / 10) + 0.9);
                        sfx.digMud.play();
                    }
                }

                if (tile === level.tiletypes.sand || tile === level.tiletypes.gravel) {

                    showAnimation(tile, player.tx * 32, player.ty * 32);
                    sfx.dig.play();
                }

                if (tile === level.tiletypes.shiny) {
                    showAnimation(tile, player.tx * 32, player.ty * 32);
                    sfx.shiny.play();
                    addShinies(1);
                }

                if (tile === level.tiletypes.chest) {
                    showAnimation(tile, player.tx * 32, player.ty * 32);
                    var reward = loot.Next();

                    messagestack.Push(reward);
                    sfx.chest.play();
                    addShinies(reward.value);
                }


                if (!debug.noclip) {
                    level.setTile(player.tx, player.ty, level.tiletypes.player, false);
                }
            } else {
                animations.playerIdle.visible = false;
                animations.playerMove.visible = false;
                animations.playerPush.visible = true;

            }

            refreshTiles = true;
        } else {
            animations.playerIdle.visible = true;
            animations.playerMove.visible = false;
            animations.playerPush.visible = false;
        }
    }
};


window.onresize = resize;

function resize(event) {
    if (window.innerHeight <= window.innerWidth) {
        renderer.view.style.height = "auto";
        renderer.view.style.width = "100%";
    }
    else {
        renderer.view.style.width = "auto";
        renderer.view.style.height = "100%";
    }
};

load();
