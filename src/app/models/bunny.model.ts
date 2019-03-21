import {Sprite} from "./sprite.model";

export class Bunny extends Sprite {

    //private vx = Math.random();
    //private vy = Math.random();

    constructor(arr: Bunny[], layer: Sprite) {
        super()
        this.element = window.document.createElement("tank-body");
        layer.addChild(this)
        //window.document.body.appendChild(this.element);
        this.setPosition((Math.random() * 610), (Math.random() * 450));
        arr.push(this);
    }

    public update(): void {
        this.move(this.vx, this.vy);
        if (this.x > 610 || this.x < 1) {
            this.vx = -this.vx;
        }
        if (this.y > 450 || this.y < 1) {
            this.vy = -this.vy;
        }
    }
}
