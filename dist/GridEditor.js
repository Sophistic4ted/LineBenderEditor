import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile, Direction } from "./Tile.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridState } from "./GridState.js";
import { RemoveTileTool } from "./grid-tools/RemoveTileTool.js";
import { PlayerPlaceTool } from "./grid-tools/PlayerPlaceTool.js";
import { TilePlaceTool } from "./grid-tools/TilePlaceTool.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";
import { GridPosition } from "./GridPosition.js";
import { DirectionCalculator } from "./DirectionCalculator.js";
class GridEditor extends Phaser.Scene {
    static tileSize = 28;
    static menuWidth = 385;
    static tilesLevelExportPadding = 2;
    gridCameraHandler = new GridCameraHandler();
    gridState = new GridState(this.add);
    isDrawing = false;
    worldBounds;
    spriteLoader;
    selectedTool;
    gridGestureHandler = new GridMouseGestureHandler();
    constructor() {
        super({ key: 'GridEditor' });
        this.worldBounds = new Phaser.Math.Vector2(GridState.gridTileSize.width * GridEditor.tileSize, GridState.gridTileSize.height * GridEditor.tileSize);
        this.spriteLoader = new SpriteLoader();
    }
    preload() {
        this.initTileMap();
        this.spriteLoader.preloadSprites(this);
    }
    create() {
        this.input.on('pointerdown', (pointer) => this.handleMouseDown(pointer));
        this.input.on('pointermove', (pointer) => this.handleMouseMove(pointer));
        this.input.on('pointerup', (pointer) => this.handleMouseUp(pointer));
        this.input.on('wheel', this.handleMouseWheel, this);
        this.scale.on('resize', this.handleResize, this);
        this.input.keyboard?.on('keydown-C', async () => {
            const textToCopy = this.exportLines();
            if (textToCopy === undefined) {
                return;
            }
            try {
                await navigator.clipboard.writeText(textToCopy);
            }
            catch (err) {
                console.error('Error in copying text: ', err);
            }
        });
        this.input.keyboard?.on('keydown-V', async () => {
            try {
                const readText = await navigator.clipboard.readText();
                this.importLines(readText);
            }
            catch (err) {
                console.error('Error in copying text: ', err);
            }
        });
        eventsCenter.on('update-tool', this.updateTool, this);
        this.add.grid(0, 0, this.worldBounds.x, this.worldBounds.y, GridEditor.tileSize, GridEditor.tileSize, 0x1a1a1a).setOrigin(0); // Set grid's origin to the top-left corner
        this.gridState.setObjectFactory(this.add);
        this.gridCameraHandler.initCamera(this.cameras, GridEditor.menuWidth, this.worldBounds, this.scale);
        this.gridGestureHandler.onStartGesture(gesture => this.selectedTool?.onStartGestureCallback(gesture, this.gridState));
        this.gridGestureHandler.onMoveGesture(gesture => this.selectedTool?.onMoveGestureCallback(gesture, this.gridState));
    }
    initTileMap() {
        for (let y = 0; y < GridState.gridTileSize.height; y++) {
            let row = [];
            for (let x = 0; x < GridState.gridTileSize.width; x++) {
                let tile = new Tile(TileType.None, { x: x, y: y });
                tile.setSprite(undefined);
                row.push(tile);
            }
            this.gridState.tiles.push(row);
        }
    }
    updateTool(tool) {
        if (tool === TileType.Trash) {
            this.selectedTool = new RemoveTileTool();
        }
        else if (tool === TileType.Player) {
            this.selectedTool = new PlayerPlaceTool();
        }
        else if (tool === TileType.None) {
            this.selectedTool = undefined;
        }
        else {
            this.selectedTool = new TilePlaceTool(tool);
        }
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        this.gridCameraHandler.handleMouseWheel(this.cameras, pointer, deltaY, this.worldBounds);
    }
    handleResize(gameSize) {
        this.cameras.main.setViewport(GridEditor.menuWidth, 0, gameSize.width - GridEditor.menuWidth, gameSize.height);
    }
    handleMouseDown(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseDown(this.cameras, pointer);
        this.gridGestureHandler.handleMouseDown(pointer, this.cameras);
    }
    handleMouseMove(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseMove(this.cameras, pointer);
        this.gridGestureHandler.handleMouseMove(pointer, this.cameras);
    }
    handleMouseUp(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseUp(pointer);
        this.gridGestureHandler.handleMouseUp(pointer);
    }
    isPointerOutOfCameraBounds(camera, pointer) {
        return pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
            pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height;
    }
    exportLines() {
        const playerTile = this.gridState.tiles[this.gridState.player.location.y][this.gridState.player.location.x];
        const playerLine = playerTile.getLine();
        if (playerLine === undefined) {
            console.error("Player is not placed on any line");
            return;
        }
        let playerTileIndex = this.gridState.lines[playerLine].indexOf(playerTile);
        if (playerTileIndex < 0) {
            console.error("Player is not placed on any line");
            return;
        }
        const levelBounds = this.getLevelBounds();
        let output = `${this.gridState.lines.length} ${playerLine} ${playerTileIndex} D\n`;
        output += `${this.levelBoundsToString(levelBounds, GridEditor.tilesLevelExportPadding)}\n`;
        this.gridState.lines.forEach(line => {
            output += this.lineToString(line);
        });
        return output;
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
        const playerLineIndex = parseInt(inputLines[0].split(' ')[1]);
        const playerTileIndex = parseInt(inputLines[0].split(' ')[2]);
        const playerLocation = this.gridState.lines.at(playerLineIndex)?.at(playerTileIndex)?.location;
        if (!playerLocation) {
            return;
        }
        this.gridState.placePlayer(playerLocation);
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
        return TileType.None;
    }
}
export { GridEditor };
