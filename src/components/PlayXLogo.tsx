type PlayXLogoProps = {
  size?: 'sm' | 'md' | 'lg'
}

export default function PlayXLogo({ size = 'md' }: PlayXLogoProps) {
  const heightClass =
    size === 'sm' ? 'h-9' : size === 'lg' ? 'h-14' : 'h-11'

  return (
    <img
      src="/logo.png"
      alt="PlayX"
      className={`${heightClass} w-auto select-none object-contain drop-shadow-[0_0_14px_rgba(24,223,133,0.35)]`}
    />
  )
}
