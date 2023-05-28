import { Tile } from "./Tile.js";

export class Line {
    constructor(public cardinalNumber = 0,public start: {x: number, y: number}, public tiles: Tile[] = []) {}
  
    // TODO: Add methods for moving the line, extending the line etc.
  }