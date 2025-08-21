'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

// --- Helper Components ---

// Icon for the upload button
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill='white' width="24" height="24" viewBox="0 0 640 640"><path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>
);

// Icon for the crop button
const CropIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="mr-2 h-5 w-5"
    >
        <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
        <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </svg>
);


// --- Main Page Component ---

export default function PrintPage() {
  // --- State Management ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [displacementMap, setDisplacementMap] = useState<ImageData | null>(null);
  
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  // --- T-Shirt Asset ---
  const tshirtImageUrl = '/tshirt_mockup_new.jpg';

  // --- Effect 1: Generate Displacement Map from T-Shirt Image ---
  useEffect(() => {
    const tshirtImg = new Image();
    tshirtImg.crossOrigin = "anonymous";
    tshirtImg.src = tshirtImageUrl;

    tshirtImg.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tshirtImg.width;
      tempCanvas.height = tshirtImg.height;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return;

      tempCtx.drawImage(tshirtImg, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, tshirtImg.width, tshirtImg.height);
      const data = imageData.data;
      const map = tempCtx.createImageData(tshirtImg.width, tshirtImg.height);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
        map.data[i] = grayscale;
        map.data[i + 1] = grayscale;
        map.data[i + 2] = grayscale;
        map.data[i + 3] = 255;
      }
      setDisplacementMap(map);
    };
    tshirtImg.onerror = () => {
        console.error("Failed to load the T-shirt image for displacement map generation.");
    };
  }, [tshirtImageUrl]);

  // --- Effect 2: Draw Final Composite on Canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displacementMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tshirtImg = new Image();
    tshirtImg.crossOrigin = "anonymous";
    tshirtImg.src = tshirtImageUrl;

    tshirtImg.onload = () => {
      canvas.width = tshirtImg.width;
      canvas.height = tshirtImg.height;
      ctx.drawImage(tshirtImg, 0, 0);

      if (croppedImage) {
        const logoImg = new Image();
        logoImg.src = croppedImage;

        logoImg.onload = () => {
          const logoMaxWidth = canvas.width * 0.35;
          const centerX = canvas.width / 2;
          const centerY = canvas.height * 0.50;
          const aspectRatio = logoImg.width / logoImg.height;
          const drawWidth = logoMaxWidth;
          const drawHeight = drawWidth / aspectRatio;
          const x = centerX - drawWidth / 2;
          const y = centerY - drawHeight / 2;

          const tempLogoCanvas = document.createElement('canvas');
          tempLogoCanvas.width = drawWidth;
          tempLogoCanvas.height = drawHeight;
          const tempLogoCtx = tempLogoCanvas.getContext('2d', { willReadFrequently: true });
          if (!tempLogoCtx) return;
          tempLogoCtx.drawImage(logoImg, 0, 0, drawWidth, drawHeight);
          const logoData = tempLogoCtx.getImageData(0, 0, drawWidth, drawHeight);
          const finalLogoData = ctx.createImageData(drawWidth, drawHeight);

          for (let j = 0; j < logoData.data.length; j += 4) {
            const originalPixelIndex = j / 4;
            const originalX = originalPixelIndex % drawWidth;
            const originalY = Math.floor(originalPixelIndex / drawWidth);
            const tshirtX = Math.round(x + originalX);
            const tshirtY = Math.round(y + originalY);
            const mapIndex = (tshirtY * displacementMap.width + tshirtX) * 4;
            const grayscale = displacementMap.data[mapIndex];
            const displacement = (grayscale - 128);
            const displacementStrength = 0.20;
            const offsetX = displacement * displacementStrength;
            const offsetY = displacement * displacementStrength;
            const srcX = Math.round(originalX + offsetX);
            const srcY = Math.round(originalY + offsetY);

            if (srcX >= 0 && srcX < drawWidth && srcY >= 0 && srcY < drawHeight) {
                const srcIndex = (srcY * drawWidth + srcX) * 4;
                finalLogoData.data[j] = logoData.data[srcIndex];
                finalLogoData.data[j + 1] = logoData.data[srcIndex + 1];
                finalLogoData.data[j + 2] = logoData.data[srcIndex + 2];
                finalLogoData.data[j + 3] = logoData.data[srcIndex + 3];
            }
          }

          tempLogoCtx.putImageData(finalLogoData, 0, 0);
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.95;
          ctx.drawImage(tempLogoCanvas, x, y);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1.0;
        };
      }
    };
  }, [croppedImage, displacementMap, tshirtImageUrl]);


  // --- Event Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCrop = () => {
    // Check if the cropperRef and its inner 'cropper' instance exist.
    if (cropperRef.current && cropperRef.current.cropper) {
      const cropper = cropperRef.current.cropper;

      // 1. Get position and size data for the crop box and the underlying image canvas.
      const cropBoxData = cropper.getCropBoxData();
      const canvasData = cropper.getCanvasData();

      // 2. Create a new, blank canvas that is the exact size of the crop box.
      const unionCanvas = document.createElement('canvas');
      unionCanvas.width = cropBoxData.width;
      unionCanvas.height = cropBoxData.height;
      const ctx = unionCanvas.getContext('2d');
      if (!ctx) return;

      // 3. Calculate the position of the image relative to the crop box.
      const imageDrawX = canvasData.left - cropBoxData.left;
      const imageDrawY = canvasData.top - cropBoxData.top;

      // 4. Draw the original image onto our new canvas at the calculated position.
      // **FIX:** The ref 'cropperRef.current' refers to the HTMLImageElement itself.
      ctx.drawImage(
        cropperRef.current, // Use the ref to the image element
        imageDrawX,
        imageDrawY,
        canvasData.width,
        canvasData.height
      );

      // 5. Export the manually created "union crop" canvas to a data URL.
      setCroppedImage(unionCanvas.toDataURL());
      setIsCropperOpen(false);
      setUploadedImage(null);
    }
  };

  const handleCancelCrop = () => {
    setIsCropperOpen(false);
    setUploadedImage(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 p-4 font-sans md:p-8">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-center text-3xl font-bold text-gray-800">
            T-Shirt Customizer
          </h1>
          <p className="text-center text-gray-500">
            Upload your design and see it realistically applied to the fabric.
          </p>
        </header>

        <main className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          {/* T-Shirt Display Area */}
          <div className="w-full md:w-1/2">
             <h2 className="mb-2 text-lg font-semibold text-gray-700">Preview</h2>
            <div className="relative w-full rounded-md border bg-gray-50 p-2">
              <canvas
                ref={canvasRef}
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-1/2">
             <h2 className="mb-2 text-lg font-semibold text-gray-700">Controls</h2>
            <div className="rounded-md border bg-gray-50 p-4">
              <p className="mb-4 text-sm text-gray-600">
                Step 1: Choose an image file to upload.
              </p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <UploadIcon />
                Upload Your Design
              </button>
               {croppedImage && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-green-600">
                            Your design has been applied! Upload another to replace it.
                        </p>
                    </div>
                )}
            </div>
          </div>
        </main>
      </div>

      {/* Cropper Modal */}
      {isCropperOpen && uploadedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Crop Your Image
            </h3>
            <p className="mb-4 text-sm text-gray-600">
                Adjust the selection to fit the best part of your design.
            </p>
            <div className="h-80 w-full overflow-hidden rounded-md border">
              <Cropper
                src={uploadedImage}
                style={{ height: '100%', width: '100%' }}
                // Cropper.js options
                viewMode={0}
                aspectRatio={0.80}
                background={true}
                autoCropArea={1}
                dragMode="move"
                guides={true}
                responsive={true}
                ref={cropperRef}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancelCrop}
                className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <CropIcon />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}