import { DirectionCalculator } from "./DirectionCalculator.js";
import { GridPosition } from "./GridPosition.js";
import { Direction, TileType } from "./Tile.js";
export class DataTransferHandler {
    static tilesLevelExportPadding = 2;
    gridState;
    constructor(gridState) {
        this.gridState = gridState;
    }
    exportLines() {
        const benderTile = this.gridState.tiles[this.gridState.bender.location.y][this.gridState.bender.location.x];
        const benderLine = benderTile.getLine();
        if (benderLine === undefined) {
            alert("Bender is not placed on any line");
            return;
        }
        let benderTileIndex = this.gridState.lines[benderLine].indexOf(benderTile);
        if (benderTileIndex < 0) {
            alert("Bender is not placed on any line");
            return;
        }
        const levelBounds = this.getLevelBounds();
        let output = `${this.gridState.lines.length} ${benderLine} ${benderTileIndex} D\n`;
        output += `${this.levelBoundsToString(levelBounds, DataTransferHandler.tilesLevelExportPadding)}\n`;
        this.gridState.lines.forEach(line => {
            output += this.lineToString(line);
        });
        return output;
    }
    importLines(input) {
        this.gridState.tiles.forEach(row => {
            row.forEach(tile => {
                this.gridState.removeTileAt(tile.location);
            });
        });
        let inputLines = input.replace(/(\r)/gm, "").split('\n');
        let numberOfLines = parseInt(inputLines[0].split(' ')[0]);
        for (let i = 2; i < numberOfLines + 2; i++) {
            this.insertLineFromString(inputLines[i]);
        }
        const benderLineIndex = parseInt(inputLines[0].split(' ')[1]);
        const benderTileIndex = parseInt(inputLines[0].split(' ')[2]);
        const benderLocation = this.gridState.lines.at(benderLineIndex)?.at(benderTileIndex)?.location;
        if (!benderLocation) {
            return;
        }
        this.gridState.placeBender(benderLocation);
    }
    levelBoundsToString(bounds, padding) {
        return `${bounds.topLeft.x - padding} ${bounds.topLeft.y - padding} ${bounds.botRight.x + padding} ${bounds.botRight.y + padding}`;
    }
    lineToString(line) {
        const firstTile = line[0];
        let output = `${line.length} ${firstTile.location.x} ${firstTile.location.y} `;
        line.forEach((tile, index) => {
            let direction = this.directionToString(tile.nextTileDirection);
            const tileType = tile.type;
            if (index === line.length - 1) {
                output += `${tileType}\n`;
            }
            else {
                output += `${direction}${tileType} `;
            }
        });
        return output;
    }
    directionToString(direction) {
        switch (direction) {
            case Direction.North:
                return 'U';
            case Direction.South:
                return 'D';
            case Direction.East:
                return 'R';
            case Direction.West:
                return 'L';
            default:
                return '';
        }
    }
    getLevelBounds() {
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;
        this.gridState.lines.forEach(line => {
            line.forEach(tile => {
                if (tile.location.x < minX)
                    minX = tile.location.x;
                if (tile.location.y < minY)
                    minY = tile.location.y;
                if (tile.location.x > maxX)
                    maxX = tile.location.x;
                if (tile.location.y > maxY)
                    maxY = tile.location.y;
            });
        });
        return {
            topLeft: new GridPosition(minX, minY),
            botRight: new GridPosition(maxX, maxY)
        };
    }
    insertLineFromString(lineString) {
        let lineData = lineString.split(' ');
        let numberOfTiles = parseInt(lineData[0]);
        if (numberOfTiles === 1) {
            this.createOneTileLine(lineString);
        }
        else {
            this.createMultipleTilesLine(lineString);
        }
    }
    createOneTileLine(lineString) {
        let lineData = lineString.split(' ');
        let x = parseInt(lineData[1]);
        let y = parseInt(lineData[2]);
        let currentEndOfLine = new GridPosition(x, y);
        const firstTileData = lineData[3];
        this.gridState.createNewLineAt(currentEndOfLine, this.stringToTileType(firstTileData[0]));
    }
    createMultipleTilesLine(lineString) {
        let lineData = lineString.split(' ');
        let numberOfTiles = parseInt(lineData[0]);
        let x = parseInt(lineData[1]);
        let y = parseInt(lineData[2]);
        let currentEndOfLine = new GridPosition(x, y);
        // create first tile
        const firstTileData = lineData[3];
        this.gridState.createNewLineAt(currentEndOfLine, this.stringToTileType(firstTileData[1]));
        // for every next tile create tile and connect to the previous one
        for (let i = 4; i < numberOfTiles + 2; i++) {
            let tileData = lineData[i];
            let previousTileData = lineData[i - 1];
            let newEndOfLinePosition = DirectionCalculator.addDirection(currentEndOfLine, DirectionCalculator.fromString(previousTileData[0]));
            this.gridState.createNewLineAt(newEndOfLinePosition, this.stringToTileType(tileData[1]));
            this.gridState.tryConnectingTiles(currentEndOfLine, newEndOfLinePosition);
            currentEndOfLine = newEndOfLinePosition;
        }
        // last tile
        let tileData = lineData[numberOfTiles + 2];
        let previousTileData = lineData[numberOfTiles + 1];
        let newEndOfLinePosition = DirectionCalculator.addDirection(currentEndOfLine, DirectionCalculator.fromString(previousTileData[0]));
        this.gridState.createNewLineAt(newEndOfLinePosition, this.stringToTileType(tileData[0]));
        this.gridState.tryConnectingTiles(currentEndOfLine, newEndOfLinePosition);
    }
    stringToTileType(character) {
        if (character === TileType.Grass) {
            return TileType.Grass;
        }
        if (character === TileType.Bricks) {
            return TileType.Bricks;
        }
        if (character === TileType.Swamp) {
            return TileType.Swamp;
        }
        if (character === TileType.Win) {
            return TileType.Win;
        }
        if (character === TileType.Key) {
            return TileType.Key;
        }
        if (character === TileType.Door) {
            return TileType.Door;
        }
        if (character === TileType.Hydro) {
            return TileType.Hydro;
        }
        if (character === TileType.Fire) {
            return TileType.Fire;
        }
        if (character === TileType.LevelSwitch) {
            return TileType.LevelSwitch;
        }
        if (character === TileType.Portal1) {
            return TileType.Portal1;
        }
        if (character === TileType.Portal2) {
            return TileType.Portal2;
        }
        if (character === TileType.Portal3) {
            return TileType.Portal3;
        }
        return TileType.None;
    }
}
