import logo from '../../assets/logo.png';

export default function BrandLogo({
  size = 'md',
  showText = true,
  textClassName = '',
  className = '',
  imageClassName = '',
}) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
    xl: 'h-12',
  };

  const imageSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <img
        src={logo}
        alt="HackHorizon logo"
        className={`${imageSizeClass} w-auto object-contain ${imageClassName}`.trim()}
      />
      {showText && (
        <span
          className={`text-text font-bold tracking-tight ${textClassName}`.trim()}
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          HackHorizon
        </span>
      )}
    </div>
  );
}
