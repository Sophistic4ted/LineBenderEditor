export class Bender {
    location;
    sprite;
    direction;
    constructor(location = { x: 0, y: 0 }, sprite, direction) {
        this.location = location;
        this.sprite = sprite;
        this.direction = direction;
    }
}
