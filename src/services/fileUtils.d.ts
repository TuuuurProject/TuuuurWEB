export function fileToBase64(file: File): Promise<string>

export interface ResizeImageSettings {
  file: File
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function resizeImage(settings: ResizeImageSettings): Promise<string>
