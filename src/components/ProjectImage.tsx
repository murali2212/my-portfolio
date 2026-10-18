type ProjectImageProps = {
  src?: string | null
  alt: string
  className?: string
}

export default function ProjectImage({
  src,
  alt,
  className = '',
}: ProjectImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${alt} — image pending`}
      className={`flex items-center justify-center bg-pure ${className}`}
    >
      <span className="px-5 text-center text-[10px] tracking-[0.24em] text-faint uppercase">
        Image pending — {alt}
      </span>
    </div>
  )
}
