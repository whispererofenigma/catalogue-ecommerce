/* eslint-disable @next/next/no-img-element */
// components/NextImage.tsx
'use client';

import  { ImageProps } from "next/image";


type Props = ImageProps & {
  src: string;
};

export default function NextImage({
  src,  
  alt,
  ...rest
}: Props) {
  
  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      
      
    />
  );
}
