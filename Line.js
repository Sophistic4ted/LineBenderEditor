export class Line {
    cardinalNumber;
    start;
    tiles;
    constructor(cardinalNumber = 0, start, tiles = []) {
        this.cardinalNumber = cardinalNumber;
        this.start = start;
        this.tiles = tiles;
    }
}
