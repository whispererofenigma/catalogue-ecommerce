// src/components/CustomizableProductClient.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImageCustomizer from '@/components/ImageCustomiser'; // Your reusable customizer


// You can keep the UploadIcon here or import it from a shared file
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill='white' width="24" height="24" viewBox="0 0 640 640"><path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>
);


// We pass the product prop just in case you need its data, though the core assets are hardcoded here.
export default function CustomizableProductClient() {
  // These assets are specific to this customizable product
  const tshirtImageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/tshirt.png`;
  const shadowsImageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/shadows.png`;

  const [shirtColor, setShirtColor] = useState<string>('#ffffff');
  const [_generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const onCanvasChange = () => {
        canvas.toBlob(blob => {
          setGeneratedImage(blob);
        });
      };
      const observer = new MutationObserver(onCanvasChange);
      observer.observe(canvas, { attributes: true, childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [canvasRef]);

  return (
    <div>
        {/* The ImageCustomizer now acts as the product "image" */}
        <ImageCustomizer
            baseImageUrl={tshirtImageUrl}
            shadowsImageUrl={shadowsImageUrl}
            tshirtColor={shirtColor}

        >
            {({ canvasRef: imageCustomizerCanvasRef, triggerUpload, croppedImage }) => {
                
                canvasRef.current = imageCustomizerCanvasRef.current;
                return (
                    <div className="w-full flex flex-col justify-center items-center gap-4">
                        {/* The Preview Canvas */}
                        <div className="aspect-square relative max-h-[60vh] rounded-lg  bg-gray-50 p-2 shadow-md">
                            <canvas ref={imageCustomizerCanvasRef} className="h-full w-full" />
                        </div>

                        {/* The Interactive Controls */}
                        <div className="rounded-lg max-w-[60vh] bg-gray-50 p-4 w-full shadow-md">
                            <div>
                                <label htmlFor="shirtColor" className="mb-2 block text-sm font-medium text-gray-700">
                                    T-Shirt Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="shirtColor"
                                        type="color"
                                        value={shirtColor}
                                        onChange={(e) => setShirtColor(e.target.value)}
                                        className="h-10 w-16 cursor-pointer rounded-md shadow-md border-gray-300 p-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Design
                                </label>
                                <button
                                    onClick={triggerUpload}
                                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                                >
                                    <UploadIcon />
                                    Upload Design
                                </button>
                                {croppedImage && (
                                    <p className="mt-2 text-center text-sm text-green-600">
                                        Design applied to preview!
                                    </p>
                                )}
                            </div>
                        </div>
                        
                    </div>
                )
            }}
        </ImageCustomizer>
    </div>
  );
}