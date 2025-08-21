// components/ImageCustomizer.tsx
'use client';

import React from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useImageCustomizer, ImageCustomizerOptions, UseImageCustomizerReturn } from '@/hooks/useImageCustomiser';

// --- Helper: Crop Icon ---
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

// --- Component Props Interface ---
// This is the public API for the ImageCustomizer component.
// It maps user-friendly prop names to the options required by the hook.
interface ImageCustomizerProps {
  /** The URL of the base t-shirt image, which must have a transparent background (PNG). */
  baseImageUrl: string;
  
  /** The URL of the shadows/highlights layer image. Must be the same dimensions as baseImageUrl. */
  shadowsImageUrl?: string | null;

  /** The color to apply to the t-shirt, e.g., '#ff0000'. Use null or undefined for the original color. */
  tshirtColor?: string | null;

  /** * The blend mode for applying the t-shirt color. 
   * Your hook defaults to 'source-over', but 'color' often gives a more natural tinting effect.
   */
  tshirtBlendMode?: GlobalCompositeOperation;

  /** The blend mode for applying the logo to the shirt texture. Defaults to 'source-over' in your hook. */
  logoBlendMode?: GlobalCompositeOperation;

  /** The opacity of the logo, from 0 to 1. E.g., 0.95 for 95% opacity. */
  logoOpacity?: number;

  /** The width of the logo as a percentage of the t-shirt canvas width. E.g., 0.25 for 25%. */
  logoWidth?: number;

  /** The horizontal position of the logo's center as a percentage from the left. E.g., 0.5 for center. */
  logoX?: number;

  /** The vertical position of the logo's center as a percentage from the top. E.g., 0.47. */
  logoY?: number;

  /** The intensity of the wrinkle effect on the logo. Higher numbers mean more distortion. */
  displacementStrength?: number;

  /** The radius of the blur applied to the displacement map in pixels, for softer wrinkles. */
  displacementBlur?: number;
  
  /** The aspect ratio for the image cropper (width / height). E.g., 1 for square, 4/3 for landscape. */
  cropAspectRatio?: number;

  /** * A function that receives the state and handlers from the hook and returns the UI.
   * This gives you complete control over your page layout.
   */
  children: (props: UseImageCustomizerReturn) => React.ReactNode;
}

// --- Main Reusable Component ---
export default function ImageCustomizer({ 
    baseImageUrl,
    shadowsImageUrl,
    tshirtColor,
    tshirtBlendMode,
    logoBlendMode,
    logoOpacity,
    logoWidth,
    logoX,
    logoY,
    displacementStrength,
    displacementBlur,
    cropAspectRatio = 0.80, // Default to a square crop
    children 
}: ImageCustomizerProps) {
  
  // Assemble the options object to pass to the underlying hook.
  // This maps our user-friendly props to the hook's expected data structure.
  const customizerOptions: ImageCustomizerOptions = {
    shadowsImageUrl: shadowsImageUrl,
    colorOverlay: tshirtColor,
    colorOverlayBlendMode: tshirtBlendMode,
    compositeOperation: logoBlendMode,
    globalAlpha: logoOpacity,
    logoPlacement: {
      width: logoWidth,
      x: logoX,
      y: logoY,
    },
    displacementStrength: displacementStrength,
    displacementBlur: displacementBlur,
  };

  // Call the hook to get all the logic, state, and handlers.
  const customizerState = useImageCustomizer(baseImageUrl, customizerOptions);
  
  // Destructure the values needed to manage the "headless" parts of this component
  // (the file input and the modal).
  const {
    fileInputRef,
    isCropperOpen,
    uploadedImage,
    cropperRef,
    handleFileChange,
    handleCrop,
    handleCancelCrop,
  } = customizerState;

  return (
    <>
      {/* Hidden file input that is controlled programmatically by the hook */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Render the user's custom UI by calling the children function with the hook's state */}
      {children(customizerState)}

      {/* Cropper Modal, managed entirely by this component */}
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
                aspectRatio={cropAspectRatio}
                viewMode={0}
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
    </>
  );
}