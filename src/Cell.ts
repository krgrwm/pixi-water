export abstract class Cell
{
    protected _mass : number
    protected _min_mass :number = 0.005
    protected _max_mass : number
    protected _flowable : boolean
    constructor(mass : number, max_mass : number, flowable : boolean)
    {
        this._mass = mass
        this._max_mass = max_mass
        this._flowable = flowable
    }

    set mass(m : number) { this._mass = m }
    get mass() { return this._mass }
    get min_mass() { return this._min_mass }
    get max_mass() { return this._max_mass }
    get flowable() { return this._flowable }

    // tsun deha any janaito dame
    abstract move(nn : any, write_nn : any, delta : number) : void
    abstract emptyCell() : Cell
    abstract copy() : Cell
    abstract color() : number
    abstract addmass(v : number) : void;
}

export class NNCells {
    up:    Cell
    down:  Cell
    right: Cell
    left:  Cell
    center: Cell
    constructor(cells: Cell[][], i:number, j:number) 
    {
        this.up = cells[i-1][j]
        this.down = cells[i+1][j]
        this.right = cells[i][j+1]
        this.left= cells[i][j-1]
        this.center = cells[i][j]
    }
}

function limit(x:number, lower:number, upper:number) :number 
{
    return Math.min(Math.max(x, lower), upper)
}

export class Liquid extends Cell
{
    protected _min_flow : number
    protected _max_flow : number
    protected _max_comp : number
    protected _flow_speed : number
    protected _flow_rate : number
    protected remaining_mass : number

    constructor (
        mass:number = 0.0,
        max_mass:number=1.0,
        max_comp:number=0.1,
        min_flow:number=0.005,
        max_flow:number=2,
        flow_speed:number = 1,
        flow_rate:number = 0.5
    )
    {
        console.assert(flow_speed <= 1, "excess 1 flow speed")
        super(mass, max_mass, true)
        this._min_flow = min_flow
        this._max_flow = max_flow
        this._max_comp = max_comp
        this._flow_speed = flow_speed
        this._flow_rate = flow_rate
    }
    get min_flow() { return this._min_flow }
    get max_flow() { return this._max_flow }
    get max_comp() { return this._max_comp }
    get flow_speed() { return this._flow_speed }
    get flow_rate() { return this._flow_rate}

    color()
    {
        console.assert(this.mass >= 0, "negative mass")
        let b = this.mass * (255.0 * 2.0/3.0)
        b = Math.min(b, 255)
        return 0x000000 | b
    }

    addmass(v : number)
    {
        this.mass += v
    }

    emptyCell()
    {
        return new Liquid(
            0,
            this.max_mass,
            this.max_comp,
            this.min_flow,
            this.max_flow,
            this.flow_speed,
            this.flow_rate
        )
    }

    copy() : Liquid
    {
        return new Liquid(this.mass, this.max_mass, this.max_comp, this.min_flow, this.max_flow, this.flow_speed, this.flow_rate)
    }


    calc_eq_state_vertical(mass_down: number, mass_up: number) : [number, number]
    {
        let total = mass_down + mass_up
        let M  = this.max_mass
        let Mp = this.max_comp
        if (total <= M)
            return [total, 0]
        else if (total < 2*M+ Mp)
        {
            let newdown = (M*M + total*Mp) / (M + Mp)
            return [newdown, total-newdown]
        }
        else
        {
            let newdown = 0.5 * (total + Mp)
            return [newdown, total-newdown]
        }
    }

    react_down(center: Liquid, down: Cell) : void {
         if (center.constructor == down.constructor) {
            let new_down_up = this.calc_eq_state_vertical(down.mass, this.remaining_mass)
            let flow = this.remaining_mass - new_down_up[1]
            if (flow > this.min_flow) {
                flow *= this.flow_speed
            }
            flow = limit(flow, 0, Math.min(this.max_flow, this.remaining_mass))
            center.mass -= flow
            down.mass += flow
            this.remaining_mass -= flow
         }
    }

    react_up(center: Liquid, up: Cell) : void {
         if (center.constructor == up.constructor) {
            if (this.remaining_mass <= 0.0) return
            //if (this.remaining_mass >= nn.up.mass )
            //    return
            let new_down_up = this.calc_eq_state_vertical(this.remaining_mass, up.mass)
            let flow = this.remaining_mass - new_down_up[0]
            if (flow > this.min_flow) {
                flow *= this.flow_speed
            }
            flow = limit(flow, 0, Math.min(this.max_flow, this.remaining_mass))
            center.mass -= flow
            up.mass += flow
        }
    }
    react_left_right(center: Liquid, left:Cell, right:Cell) {
        // left, right

        if (center.constructor == left.constructor
            && center.constructor == right.constructor) {
            if (this.remaining_mass <= 0.0) return
            let leftDelta  = Math.max(0, this.remaining_mass-left.mass)
            let rightDelta = Math.max(0, this.remaining_mass-right.mass)
            let _d = 0.5 * (leftDelta + rightDelta)
            if (_d != 0) {
                let d = this.flow_rate * _d
                let sum = leftDelta + rightDelta
                let flow_left  = d * leftDelta / sum
                let flow_right = d * rightDelta / sum
                center.mass -= flow_left + flow_right
                left.mass += flow_left
                right.mass += flow_right
                this.remaining_mass -= flow_left + flow_right
            }
        }
    }


    move (nn : NNCells, write_nn : NNCells, delta : number)
    {
        this.remaining_mass = this.mass

        if (this.remaining_mass <= this.min_mass) {
            this.mass = 0.0
            return
        } 

        let flow;
        // down
        this.react_down(<Liquid>write_nn.center, write_nn.down)

        this.react_left_right(<Liquid>write_nn.center, write_nn.left, write_nn.right)
        // up
        this.react_up(<Liquid>write_nn.center, write_nn.up)
    }
}

export class Water extends Liquid
{
    constructor (_mass:number = 0.0, flow_rate:number = 1.0)
    {
        super()
        this.mass = _mass
        this._flow_rate = flow_rate
    }

    color()
    {
        console.assert(this.mass >= 0, "negative mass")
        let b = this.mass * (255.0 * 2.0/3.0)
        b = Math.min(b, 255)
        return 0x000000 | b
    }
}

export class Ground extends Cell
{
    constructor (mass:number = 0.0)
    {
        super(mass, 1.0, false)
    }
    color()
    {
        return 0xFFFFFF
    }

    addmass(v : number)
    {
    }
    
    emptyCell()
    {
        return new Ground()
    }

    copy() : Ground
    {
        return new Ground(this.mass)
    }

    move(nn : NNCells, write_nn : NNCells, delta : number)
    {
        write_nn.center.mass = this.mass
    }
}

export class Cells {
    cells: Cell[][]
    constructor(row: number, col: number) 
    {
        this.cells = new Array(row)
        for (let i=0; i<row; i++)
        {
            this.cells[i] = new Array(col).fill(new Water())
        }
    }

    get(ij:[number, number]) : Cell | null
    {
        let i = ij[0]
        let j = ij[1]
        if (this.cells.length <= i || i < 0) {
            return null
        }
        if (this.cells[0].length <= j || j < 0) {
            return null
        }
        return this.cells[ij[0]][ij[1]]
    }

    set(ij:[number, number], c:Cell) : void
    {
        this.cells[ij[0]][ij[1]] = c
    }

    row() : number 
    {return this.cells.length}
    col() : number 
    {return this.cells[0].length}

    update(delta : number) : void
    {
        let istart = 1
        let iend = this.row()-1
        let jstart = 1
        let jend = this.col()-1
        let nn
        let write_nn
        let new_cells = new Array(this.row())

        // init new_cells
        for (let i=0; i<this.row(); i++)
        {
            new_cells[i] = new Array(this.col())
            for (let j=0; j<this.col(); j++)
            {
                new_cells[i][j] = this.cells[i][j].copy()
            }
        }

        for (var i = istart; i < iend; ++i) {
            for (var j = jstart; j < jend; ++j) {
                nn = new NNCells(this.cells, i, j)
                write_nn = new NNCells(new_cells, i, j)
                this.cells[i][j].move(nn, write_nn, delta)
            }
        }
        this.cells = new_cells
    }
}

