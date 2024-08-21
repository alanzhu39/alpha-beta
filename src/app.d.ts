// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

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
    replace(node: HTMLElement): GlfxCanvas;
  }

  function canvas(): GlfxCanvas;
}
