export class GridCameraHandler {
    static zoomRate = 0.001;
    static maxCameraZoom = 3;
    static zoomDuration = 200;
    isDragging = false;
    dragPosition = new Phaser.Math.Vector2();
    scrollFloat = new Phaser.Math.Vector2();
    initCamera(camera, menuWidth, worldBounds, scale) {
        camera.main.setViewport(menuWidth, 0, scale.width - menuWidth, scale.height);
        camera.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
        camera.main.centerOn(worldBounds.x / 2, worldBounds.y / 2);
        camera.main.setZoom(2);
        this.scrollFloat = new Phaser.Math.Vector2(camera.main.scrollX, camera.main.scrollY);
    }
    handleMouseDown(pointer, camera) {
        if (!pointer.middleButtonDown() || this.isPointerOutOfCameraBounds(pointer, camera)) {
            return;
        }
        this.isDragging = true;
        this.dragPosition.set(pointer.x, pointer.y);
    }
    handleMouseMove(pointer, camera) {
        if (!pointer.middleButtonDown()) {
            return;
        }
        if (this.isPointerOutOfCameraBounds(pointer, camera)) {
            this.isDragging = false;
            return;
        }
        if (this.isDragging) {
            const delta = this.dragPosition.subtract(pointer.position);
            this.moveCamera(camera, delta);
            this.dragPosition.set(pointer.x, pointer.y);
        }
    }
    handleMouseUp(pointer) {
        if (pointer.middleButtonReleased()) {
            this.isDragging = false;
        }
    }
    handleMouseWheel(pointer, camera, deltaY, worldBounds) {
        if (this.isPointerOutOfCameraBounds(pointer, camera)) {
            return;
        }
        const newZoom = this.getNewZoom(camera, deltaY, worldBounds);
        camera.main.zoomTo(newZoom, GridCameraHandler.zoomDuration);
    }
    moveCamera(camera, deltaPointer) {
        const deltaScroll = deltaPointer.divide({ x: camera.main.zoomX, y: camera.main.zoomY });
        this.scrollFloat = this.scrollFloat.add(deltaScroll);
        camera.main.scrollX = this.scrollFloat.x;
        camera.main.scrollY = this.scrollFloat.y;
    }
    isPointerOutOfCameraBounds(pointer, camera) {
        return pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
            pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height;
    }
    getMaxZoom(camera, worldBounds) {
        const maxZoomX = camera.main.width / worldBounds.x;
        const maxZoomY = camera.main.height / worldBounds.y;
        return Math.max(maxZoomX, maxZoomY);
    }
    getNewZoom(camera, deltaY, worldBounds) {
        let newZoom = camera.main.zoom - deltaY * GridCameraHandler.zoomRate;
        const maxZoom = this.getMaxZoom(camera, worldBounds);
        return Phaser.Math.Clamp(newZoom, maxZoom, GridCameraHandler.maxCameraZoom);
    }
}
