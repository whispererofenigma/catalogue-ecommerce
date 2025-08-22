// components/NextImage.tsx
'use client';

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = ImageProps & {
  fallbackSrc?: string;
};

export default function NextImage({
  src,
  fallbackSrc = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/placeholder.png`,
  alt,
  ...rest
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
