import {ComfyJSInstance} from 'comfy.js';

declare global {
  interface Window {
    ComfyJS: ComfyJSInstance
  }
}
