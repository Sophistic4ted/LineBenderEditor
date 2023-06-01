
export class GridCameraHandler {
  private isDragging: boolean = false;
  private dragPosition = new Phaser.Math.Vector2();
  private scrollXFloat: number = 0;
  private scrollYFloat: number = 0;

  public initCamera(camera: Phaser.Cameras.Scene2D.CameraManager, menuWidth: number, worldBounds: Phaser.Math.Vector2, scale: { width: number, height: number }): void {
    camera.main.setViewport(menuWidth, 0, scale.width - menuWidth, scale.height);
    camera.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
    camera.main.centerOn(worldBounds.x / 2, worldBounds.y / 2);
    camera.main.setZoom(2);
    this.scrollXFloat = camera.main.scrollX;
    this.scrollYFloat = camera.main.scrollY;
  }

  public handleMouseDown(camera: Phaser.Cameras.Scene2D.CameraManager, pointer: Phaser.Input.Pointer) {
    if (
      pointer.middleButtonDown() &&
      pointer.x > camera.main.x && pointer.x < camera.main.x + camera.main.width &&
      pointer.y > camera.main.y && pointer.y < camera.main.y + camera.main.height
    ) {
      this.isDragging = true;
      this.dragPosition.set(pointer.x, pointer.y);
    }
  }

  public handleMouseMove(camera: Phaser.Cameras.Scene2D.CameraManager, pointer: Phaser.Input.Pointer) {
    if (pointer.middleButtonDown()) {
      if (
        pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
        pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height
      ) {
        this.isDragging = false;
      } else {
        if (this.isDragging) {
          const deltaX = this.dragPosition.x - pointer.x;
          const deltaY = this.dragPosition.y - pointer.y;
          this.scrollXFloat += deltaX / camera.main.zoomX;
          this.scrollYFloat += deltaY / camera.main.zoomY;
          camera.main.scrollX = this.scrollXFloat;
          camera.main.scrollY = this.scrollYFloat;
          this.dragPosition.set(pointer.x, pointer.y);
        }
      }
    }
  }

  public handleMouseUp(pointer: Phaser.Input.Pointer) {
    if (pointer.middleButtonReleased()) {
      this.isDragging = false;
    }
  }
  
  public handleMouseWheel(camera: Phaser.Cameras.Scene2D.CameraManager, pointer: Phaser.Input.Pointer, deltaY: number, worldBounds: Phaser.Math.Vector2) {
    if (
      pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
      pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height
    ) {
      return;
    }

    let newZoom = camera.main.zoom - deltaY * 0.001; // change this to smaller value for smoother zoom

    const maxZoomX = camera.main.width / worldBounds.x;
    const maxZoomY = camera.main.height / worldBounds.y;
    const maxZoom = Math.max(maxZoomX, maxZoomY);

    newZoom = Phaser.Math.Clamp(newZoom, maxZoom, 3);

    camera.main.zoomTo(newZoom, 200); // Use zoomTo for smoother transition
  }
}