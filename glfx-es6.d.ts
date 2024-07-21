declare module 'glfx-es6' {
  type GlfxCoordinates = [number, number, number, number, number, number, number, number];

  class GlfxTexture {
    constructor();
    width: number;
    height: number;
  }

  interface GlfxCanvas extends HTMLCanvasElement {
    texture(element: HTMLVideoElement): GlfxTexture;
    draw(texture: GlfxTexture, width?: number, height?: number): GlfxCanvas;
    perspective(before: GlfxCoordinates, after: GlfxCoordinates): GlfxCanvas;
    update(): void;
  }

  function canvas(): GlfxCanvas;
}
