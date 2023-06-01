type Camera = Phaser.Cameras.Scene2D.CameraManager;
type Pointer = Phaser.Input.Pointer;
type Vector2 = Phaser.Math.Vector2;

export class GridCameraHandler {
  private static readonly zoomRate = 0.001;
  private static readonly maxCameraZoom = 3;
  private static readonly zoomDuration = 200;

  private isDragging: boolean = false;
  private dragPosition = new Phaser.Math.Vector2();
  private scrollFloat = new Phaser.Math.Vector2();

  public initCamera(camera: Camera, menuWidth: number, worldBounds: Vector2, scale: { width: number, height: number }): void {
    camera.main.setViewport(menuWidth, 0, scale.width - menuWidth, scale.height);
    camera.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
    camera.main.centerOn(worldBounds.x / 2, worldBounds.y / 2);
    camera.main.setZoom(2);
    this.scrollFloat = new Phaser.Math.Vector2(camera.main.scrollX, camera.main.scrollY);
  }

  public handleMouseDown(camera: Camera, pointer: Pointer) {
    if (!pointer.middleButtonDown() || this.isPointerOutOfCameraBounds(camera, pointer)) {
      return;
    }
    this.isDragging = true;
    this.dragPosition.set(pointer.x, pointer.y);
  }

  public handleMouseMove(camera: Camera, pointer: Pointer) {
    if (!pointer.middleButtonDown()) { return; }
    if (this.isPointerOutOfCameraBounds(camera, pointer)) {
      this.isDragging = false;
      return;
    }
    if (this.isDragging) {
      const delta = this.dragPosition.subtract(pointer.position);
      this.moveCamera(camera, delta);
      this.dragPosition.set(pointer.x, pointer.y);
    }
  }

  public handleMouseUp(pointer: Pointer) {
    if (pointer.middleButtonReleased()) {
      this.isDragging = false;
    }
  }

  public handleMouseWheel(camera: Camera, pointer: Pointer, deltaY: number, worldBounds: Vector2) {
    if (this.isPointerOutOfCameraBounds(camera, pointer)) {
      return;
    }
    const newZoom = this.getNewZoom(camera, deltaY, worldBounds);
    camera.main.zoomTo(newZoom, GridCameraHandler.zoomDuration);
  }

  private moveCamera(camera: Camera, deltaPointer: Vector2): void {
    const deltaScroll = deltaPointer.divide({x: camera.main.zoomX, y: camera.main.zoomY});
    this.scrollFloat = this.scrollFloat.add(deltaScroll);
    camera.main.scrollX = this.scrollFloat.x;
    camera.main.scrollY = this.scrollFloat.y;
  }

  private isPointerOutOfCameraBounds(camera: Camera, pointer: Pointer): boolean {
    return pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
      pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height;
  }

  private getMaxZoom(camera: Camera, worldBounds: Vector2): number {
    const maxZoomX = camera.main.width / worldBounds.x;
    const maxZoomY = camera.main.height / worldBounds.y;
    return Math.max(maxZoomX, maxZoomY);
  }

  private getNewZoom(camera: Camera, deltaY: number, worldBounds: Vector2): number {
    let newZoom = camera.main.zoom - deltaY * GridCameraHandler.zoomRate;
    const maxZoom = this.getMaxZoom(camera, worldBounds);
    return Phaser.Math.Clamp(newZoom, maxZoom, GridCameraHandler.maxCameraZoom);
  }
}