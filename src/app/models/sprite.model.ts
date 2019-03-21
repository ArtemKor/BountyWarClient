export class Sprite {

    public element: HTMLElement;
    public x = 0;
    public y = 0;

    public vx = Math.random() * 2 - 1;
    public vy = Math.random() * 2 - 1;

    private r = 5;
    private vr = 5;

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.element.style.left = ~~this.x + 'px';
        this.element.style.top = ~~this.y + 'px';
    }

    public move(x: number, y: number): void {
        this.x += x;
        this.y += y;
        this.element.style.left = ~~this.x + 'px';
        this.element.style.top = ~~this.y + 'px';
    }

    public addChild(ch: Sprite): void {
        this.element.appendChild(ch.element)
    }

    public deleteChild(ch: Sprite): void {
        this.element.removeChild(ch.element)
    }

    public update(): void {
        this.move(this.vx, this.vy);
        if (this.x > 300 || this.x < 30) {
            this.vx = -this.vx;
        }
        if (this.y > 200 || this.y < 30) {
            this.vy = -this.vy;
        }
        this.r += this.vr
        this.element.style.transform = 'rotate(' + this.r + 'deg)'
    }
}