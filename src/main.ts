import * as PIXI from 'pixi.js';

import * as CELL from './Cell'

//Create a Pixi Application

let rightWindowWidth = innerWidth / 5

let syssize = [50, 80]
let dx = (innerWidth-rightWindowWidth) / syssize[1]
let dy = innerHeight / syssize[0]

let delta = Math.min(dx, dy)

let buttonSize = delta*4

let app = new PIXI.Application({width: (syssize[1]-1)*delta + rightWindowWidth, height: (syssize[0]-1)*delta});

const max_mass = 1.0
const min_mass = 0.005
const max_comp = 0.25

const min_flow = 0.005
const max_flow = 2
const flow_speed = 1





function draw_cells_sprite(cells : CELL.Cells, sprite_mat : PIXI.Sprite[][])
{
    let c
    for (var i = 0; i < cells.row(); ++i) {
        for (var j = 0; j < cells.col(); ++j) {
            c = cells.get([i, j])
            if (c != null)
                sprite_mat[i][j].tint = c.color()
        }
    }
}

// function print_cell_ascii(cells : Cells) {
//     for (var i = 0; i < cells.row(); ++i) {
//         for (var j = 0; j < cells.col(); ++j) {
//             let v = cells.get([i, j]).mass
//             let c = String(Math.floor(v * 10) / 10)
//             process.stdout.write(
//                 String(c) + ","
//             )
//         }
//         console.log("")
//     }
// }

// // Debug ------
// let cells = new Cells(syssize[0], syssize[1])
// let space = 5
// let half = Math.floor(syssize[1]/2)

// cells = new Cells(syssize[0], syssize[1])
// for (var i = 0; i < syssize[0]; ++i) {
//     cells.set([i, 0], new Ground(9))
//     cells.set([i, syssize[1]], new Ground(9))
// }
// for (var i = 0; i < syssize[0]-space; ++i) {
//     cells.set([i, half], new Ground(9))
// }
// for (var j = 0; j < syssize[1]; ++j) {
//     cells.set([syssize[0]-1, j], new Ground(9))
// }
// cells.set([syssize[0]-2, half], new Water(1))
// print_cell_ascii(cells)

// // set Water
// for (var j = 1; j < half; ++j) {
//     cells.set([5, j], new Water(1))
//     cells.set([4, j], new Water(1))
//     cells.set([3, j], new Water(1))
//     cells.set([2, j], new Water(1))
//     cells.set([1, j], new Water(1))
// }
// cells.update(1)
// cells.update(1)
// cells.update(1)
// cells.update(1)
// cells.update(1)
// print_cell_ascii(cells)

// for (var i = 0; i < 1000; ++i) {
//     cells.update(1)
// }
// print_cell_ascii(cells)

// print_cell_ascii(cells)


// let u = 0.0
// let d = 0.333

// ------------

let cells = new CELL.Cells(syssize[0], syssize[1])


function setup() 
{
    let gameScene = new PIXI.Container()
    app.stage.addChild(gameScene)


    let text = new PIXI.Text("add", {fontSize: 20, fill: "white"})
    text.position.set(syssize[1]*delta,100)
    gameScene.addChild(text);

    let b_add = new PIXI.Sprite(PIXI.Texture.WHITE)
    b_add.interactive = true
    b_add.buttonMode=true
    b_add.width = buttonSize
    b_add.height= buttonSize
    b_add.tint = 0x0000FF
    b_add.position.set(syssize[1]*delta, 0)
    app.stage.addChild(b_add);
    let b_add_text = new PIXI.Text("Water", {fontSize: delta*1.5, fill: "white"})
    b_add_text.position.set(b_add.position.x, b_add.position.y+buttonSize+10)
    app.stage.addChild(b_add_text)

     let b_block = new PIXI.Sprite(PIXI.Texture.WHITE)
     b_block.interactive = true
     b_block.buttonMode=true
     b_block.width = buttonSize
     b_block.height= buttonSize
     b_block.tint = 0xFFFFFF
     b_block.position.set((syssize[1]+2)*delta+buttonSize, 0)
     app.stage.addChild(b_block);
     let b_block_text = new PIXI.Text("Block", {fontSize: delta*1.5, fill: "white"})
     b_block_text.position.set(b_block.position.x, b_block.position.y+buttonSize+10)
     app.stage.addChild(b_block_text)

     let b_delete = new PIXI.Sprite(PIXI.Texture.WHITE)
     b_delete.interactive = true
     b_delete.buttonMode=true
     b_delete.width = buttonSize
     b_delete.height= buttonSize
     b_delete.tint = 0x999999
     b_delete.position.set((syssize[1]+4)*delta+2*buttonSize, 0)
     app.stage.addChild(b_delete);
     let b_delete_text = new PIXI.Text("Delete", {fontSize: delta*1.5, fill: "white"})
     b_delete_text.position.set(b_delete.position.x, b_delete.position.y+buttonSize+10)
     app.stage.addChild(b_delete_text);

    (()=>{
        let isTouched = false
        let click_func = ()=>{}

        b_add.on("mousedown", function (e : PIXI.interaction.InteractionEvent) {
            console.log(innerWidth, innerHeight)
            click_func = function()
            {
                let c
                if (isTouched) {
                    let p = e.data.getLocalPosition(gameScene)
                    for (var i = -1; i <= 1; ++i) {
                        for (var j = -1; j <= 1; ++j) {
                            c = cells.get([Math.floor(p.y/delta)+i, Math.floor(p.x/delta)+j])
                            if (c != null) {
                                console.log(c)
                                c.addmass(1)
                            }
                        }
                    }
                }
            }
        })

        b_block.on("mousedown", function (e : PIXI.interaction.InteractionEvent) {
            console.log("hello")
            click_func = function()
            {
                if (isTouched) {
                    let p = e.data.getLocalPosition(gameScene)
                    let i = Math.floor(p.y/delta)
                    let j =  Math.floor(p.x/delta)
                    let c = cells.get([i, j])
                    if (c != null) {
                        cells.set([i, j], new CELL.Ground())
                    }
                }
            }
        })

        b_delete.on("mousedown", function (e : PIXI.interaction.InteractionEvent) {
            click_func = function()
            {
                if (isTouched) {
                    let p = e.data.getLocalPosition(gameScene)
                    for (var i = -1; i <= 1; ++i) {
                        for (var j = -1; j <= 1; ++j) {
                            let i = Math.floor(p.y/delta)
                            let j =  Math.floor(p.x/delta)
                            let c = cells.get([i, j])
                            if (c != null) {
                                cells.set([i,j], new CELL.Water(0))
                            }
                        }
                    }
                }
            }
        })

        gameScene.on("mousedown",
            function(event : PIXI.interaction.InteractionEvent)
            {  
                isTouched = true
            }
        )

        gameScene.on("mouseup",
            function(event : PIXI.interaction.InteractionEvent)
            {  
                isTouched = false
            }
        )
        gameScene.on("mousemove",
            function(event : PIXI.interaction.InteractionEvent)
            {  
                click_func()
            }
        )



    })();


    let sprite_mat = new Array(syssize[0])
    for (let i=0; i<syssize[0]; i++)
    {
        sprite_mat[i] = new Array(syssize[1])
        for (let j=0; j<syssize[1]; j++)
        {
            sprite_mat[i][j] = new PIXI.Sprite(PIXI.Texture.WHITE)
            sprite_mat[i][j].width =delta 
            sprite_mat[i][j].height = delta
            sprite_mat[i][j].position.set(j*delta, i*delta)
            gameScene.addChild(sprite_mat[i][j])
        }
    }

    gameScene.interactive = true
    gameScene.buttonMode=true
    let rect = new PIXI.Graphics()
    gameScene.addChild(rect)

    let time = 0

    function cell_update_func(delta : number) {
        time += delta
        text.text = String(app.ticker.FPS)
        cells.update(1)

        if (time > 0) {
            draw_cells_sprite(cells, sprite_mat)
            time = 0
        }
    }

    app.ticker.add(
        cell_update_func
    )
}

setup()



//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
