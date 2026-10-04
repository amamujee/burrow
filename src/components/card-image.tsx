import Image, { type ImageProps } from "next/image";
import { version } from "../../public/offline-assets.json";

export default function CardImage({ src, alt, ...props }: ImageProps) {
  const versioned = typeof src === "string" && src.startsWith("/burrow-assets/") ? `${src}?v=${version}` : src;
  return <Image {...props} alt={alt} src={versioned} />;
}
