// app/print/page.tsx
'use client';

import React, { useState } from 'react';
import ImageCustomizer from '@/components/ImageCustomiser'; // Adjust path if needed

// --- Icon for the upload button (specific to this page's UI) ---
const UploadIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill='white' height='24' width='24' viewBox="0 0 640 640"><path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>);


export default function PrintPage() {
  // Define paths to your assets in the /public folder
  const tshirtImageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/tshirt.png`;
  const shadowsImageUrl = '/shadows.png';
  
  // State to manage the selected T-shirt color interactively
  const [shirtColor, setShirtColor] = useState<string>('#ffffff'); // Default to white

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 p-4 font-sans md:p-8">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-center text-3xl font-bold text-gray-800">
            Photorealistic T-Shirt Customizer
          </h1>
          <p className="text-center text-gray-500">
            Upload a design, pick a color, and see a realistic preview.
          </p>
        </header>

        <ImageCustomizer
          // --- Asset Configuration ---
          baseImageUrl={tshirtImageUrl}
          shadowsImageUrl={shadowsImageUrl}

          // --- Interactive & Style Configuration ---
          tshirtColor={shirtColor}
          displacementStrength={0.4} 
        >
          {/* This is the render prop. 
            We receive the state and handlers from the hook and use them to build our UI.
          */}
          {({ canvasRef, triggerUpload, croppedImage }) => (
            <main className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              
              {/* Left Column: The Visual Preview */}
              <div className="w-full md:w-1/2">
                <h2 className="mb-2 text-lg font-semibold text-gray-700">Preview</h2>
                <div className="relative aspect-square w-full rounded-md border bg-gray-50 p-2 shadow-inner">
                  <canvas
                    ref={canvasRef} // Connect the canvas ref from the hook
                    className="h-full w-full"
                  />
                </div>
              </div>

              {/* Right Column: The User Controls */}
              <div className="w-full md:w-1/2">
                <h2 className="mb-2 text-lg font-semibold text-gray-700">Controls</h2>
                <div className="space-y-6 rounded-md border bg-gray-50 p-4 shadow-inner">
                  
                  {/* Color Picker Control */}
                  <div>
                    <label htmlFor="shirtColor" className="mb-2 block text-sm font-medium text-gray-700">
                      1. Choose T-Shirt Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="shirtColor"
                        type="color"
                        value={shirtColor}
                        onChange={(e) => setShirtColor(e.target.value)}
                        className="h-10 w-16 cursor-pointer rounded-md border border-gray-300 p-1"
                      />
                      <span className="text-sm text-gray-600">
                        {shirtColor === '#ffffff' ? 'Original White' : 'Custom Color'}
                      </span>
                    </div>
                  </div>

                  {/* Upload Control */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      2. Upload Your Design
                    </label>
                    <button
                      onClick={triggerUpload} // Connect the upload function from the hook
                      className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <UploadIcon />
                      Upload Design
                    </button>
                    {croppedImage && ( // Use state from the hook to show a success message
                      <div className="mt-3 text-center">
                        <p className="text-sm text-green-600">
                          Design applied! Upload another to replace it.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </main>
          )}
        </ImageCustomizer>
      </div>
    </div>
  );
}