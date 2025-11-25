import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl'
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className = '' }) => {
  const [imgError, setImgError] = React.useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || imgError) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center text-white font-semibold ${sizeClasses[size]} ${textSizeClasses[size]} ${className}`}
      >
        {getInitials(alt || 'U')}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={`rounded-full object-cover bg-gray-200 ${sizeClasses[size]} ${className}`}
    />
  );
};
