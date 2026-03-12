/* eslint-disable @next/next/no-img-element */

type ProjectImageProps = {
  src: string
  alt: string
  className: string
}

export function ProjectImage({ src, alt, className }: ProjectImageProps) {
  return <img src={src} alt={alt} className={className} />
}
