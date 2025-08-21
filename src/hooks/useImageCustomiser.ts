// hooks/useImageCustomizer.ts
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ReactCropperElement } from 'react-cropper';

// --- Configuration Options for the Hook ---
export interface ImageCustomizerOptions {
  logoPlacement?: {
    width?: number;
    x?: number;
    y?: number;
  };
  displacementStrength?: number;
  displacementBlur?: number;
  compositeOperation?: GlobalCompositeOperation;
  globalAlpha?: number;
  colorOverlay?: string | null;
  colorOverlayBlendMode?: GlobalCompositeOperation;
  shadowsImageUrl?: string | null; // <-- NEW: For the top shadow/highlight layer
}

// --- Hook Definition ---
export const useImageCustomizer = (baseImageUrl: string, options: ImageCustomizerOptions = {}) => {
  const {
    logoPlacement: { width: logoWidth = 0.25, x: logoX = 0.5, y: logoY = 0.47 } = {},
    displacementStrength = 0.15,
    displacementBlur = 4,
    // As requested, the logo's default blend mode is now 'source-over'
    compositeOperation = 'source-over',
    globalAlpha = 0.95,
    colorOverlay = null,
    colorOverlayBlendMode = 'source-over',
    shadowsImageUrl = null, // <-- NEW
  } = options;

  // --- State, Refs, and Displacement Map Effect are unchanged ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [displacementMap, setDisplacementMap] = useState<ImageData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    // This effect for displacement map generation is unchanged
    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = baseImageUrl;
    baseImg.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return;
      tempCanvas.width = baseImg.width;
      tempCanvas.height = baseImg.height;
      tempCtx.drawImage(baseImg, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, baseImg.width, baseImg.height);
      const data = imageData.data;
      const map = tempCtx.createImageData(baseImg.width, baseImg.height);
      for (let i = 0; i < data.length; i += 4) {
        const grayscale = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        map.data[i] = map.data[i + 1] = map.data[i + 2] = grayscale;
        map.data[i + 3] = 255;
      }
      if (displacementBlur > 0) {
        tempCtx.putImageData(map, 0, 0);
        tempCtx.filter = `blur(${displacementBlur}px)`;
        tempCtx.drawImage(tempCanvas, 0, 0);
        const blurredMapData = tempCtx.getImageData(0, 0, baseImg.width, baseImg.height);
        setDisplacementMap(blurredMapData);
      } else {
        setDisplacementMap(map);
      }
    };
    baseImg.onerror = () => console.error("Failed to load base image for displacement map.");
  }, [baseImageUrl, displacementBlur]);


  // --- Effect 2: Draw Final Composite (REVISED WITH 3-LAYER SYSTEM) ---
  useEffect(() => {
    const loadImages = (sources: (string | null | undefined)[]): Promise<(HTMLImageElement | null)[]> => {
      const filteredSources = sources.filter(s => typeof s === 'string') as string[];
      const promises = filteredSources.map(src => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = src;
        });
      });
      // Return null for non-string sources to keep array indices consistent
      return Promise.all(sources.map(s => s ? promises.shift()! : Promise.resolve(null) ));
    };

    const drawCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !displacementMap) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const [baseImg, logoImg, shadowsImg] = await loadImages([baseImageUrl, croppedImage, shadowsImageUrl]);
        if (!baseImg) return;

        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- LAYER 1 & 2: PREPARE THE COLORED SHIRT + LOGO ---
        // This is all done on an off-screen canvas first.
        const baseLayerCanvas = document.createElement('canvas');
        baseLayerCanvas.width = baseImg.width;
        baseLayerCanvas.height = baseImg.height;
        const baseLayerCtx = baseLayerCanvas.getContext('2d');
        if (!baseLayerCtx) return;
        
        // Start with the base texture
        baseLayerCtx.drawImage(baseImg, 0, 0);
        
        // Apply color overlay if it exists
        if (colorOverlay) {
          baseLayerCtx.globalCompositeOperation = colorOverlayBlendMode;
          baseLayerCtx.fillStyle = colorOverlay;
          baseLayerCtx.fillRect(0, 0, baseLayerCanvas.width, baseLayerCanvas.height);
          baseLayerCtx.globalCompositeOperation = 'destination-in';
          baseLayerCtx.drawImage(baseImg, 0, 0);
        }
        
        // Reset for logo drawing
        baseLayerCtx.globalCompositeOperation = 'source-over';

        // Draw the displaced logo on top if it exists
        if (logoImg) {
            const logoMaxWidth = canvas.width * logoWidth;
            const centerX = canvas.width * logoX;
            const centerY = canvas.height * logoY;
            const aspectRatio = logoImg.width / logoImg.height;
            const drawWidth = logoMaxWidth;
            const drawHeight = drawWidth / aspectRatio;
            const x = centerX - drawWidth / 2;
            const y = centerY - drawHeight / 2;
            
            const displacedLogoCanvas = document.createElement('canvas');
            displacedLogoCanvas.width = drawWidth;
            displacedLogoCanvas.height = drawHeight;
            const displacedLogoCtx = displacedLogoCanvas.getContext('2d', { willReadFrequently: true });
            if (!displacedLogoCtx) return;

            // ... displacement logic is the same ...
            displacedLogoCtx.drawImage(logoImg, 0, 0, drawWidth, drawHeight);
            const logoData = displacedLogoCtx.getImageData(0, 0, drawWidth, drawHeight);
            const finalLogoData = displacedLogoCtx.createImageData(drawWidth, drawHeight);
            for (let j = 0; j < logoData.data.length; j += 4) {
              const originalPixelIndex = j / 4;
              const originalX = originalPixelIndex % drawWidth;
              const originalY = Math.floor(originalPixelIndex / drawWidth);
              const tshirtX = Math.round(x + originalX);
              const tshirtY = Math.round(y + originalY);
              const mapIndex = (tshirtY * displacementMap.width + tshirtX) * 4;
              const grayscale = displacementMap.data[mapIndex];
              const displacement = (grayscale - 128) * displacementStrength;
              const srcX = Math.round(originalX + displacement);
              const srcY = Math.round(originalY + displacement);
              if (srcX >= 0 && srcX < drawWidth && srcY >= 0 && srcY < drawHeight) {
                  const srcIndex = (srcY * drawWidth + srcX) * 4;
                  finalLogoData.data[j] = logoData.data[srcIndex];
                  finalLogoData.data[j+1] = logoData.data[srcIndex+1];
                  finalLogoData.data[j+2] = logoData.data[srcIndex+2];
                  finalLogoData.data[j+3] = logoData.data[srcIndex+3];
              }
            }
            displacedLogoCtx.putImageData(finalLogoData, 0, 0);

            baseLayerCtx.globalAlpha = globalAlpha;
            baseLayerCtx.drawImage(displacedLogoCanvas, x, y);
        }

        // --- FINAL COMPOSITION ---
        // 1. Draw the combined shirt+logo layer to the main canvas
        ctx.drawImage(baseLayerCanvas, 0, 0);

        // 2. LAYER 3: Draw the shadows/highlights layer on top
        if (shadowsImg) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(shadowsImg, 0, 0);
        }

        // 3. Reset context for good measure
        ctx.globalCompositeOperation = 'source-over';

      } catch (error) {
        console.error("Error loading images for canvas:", error);
      }
    };

    drawCanvas();

  }, [
    croppedImage, displacementMap, baseImageUrl, logoWidth, logoX, logoY,
    displacementStrength, compositeOperation, globalAlpha, colorOverlay, colorOverlayBlendMode, shadowsImageUrl
  ]);
  
  
  // --- Event Handlers ---
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(files[0]);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, []);
  
  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCrop = useCallback(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      setCroppedImage(croppedCanvas.toDataURL());
      setIsCropperOpen(false);
      setUploadedImage(null);
    }
  }, []);

  const handleCancelCrop = useCallback(() => {
    setIsCropperOpen(false);
    setUploadedImage(null);
  }, []);

  // --- Return values to be used by the UI ---
  return {
    canvasRef,
    cropperRef,
    fileInputRef,
    isCropperOpen,
    uploadedImage,
    croppedImage,
    triggerUpload,
    handleFileChange,
    handleCrop,
    handleCancelCrop,
  };
};

// Export the return type for better TypeScript support in the component
export type UseImageCustomizerReturn = ReturnType<typeof useImageCustomizer>;