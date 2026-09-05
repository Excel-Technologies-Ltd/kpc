import React from 'react';
import { DefaultEmptyImage, SimpleEmptyImage } from './default-empty-images';

export interface EmptyProps {
  /**
   * Image to display (can be a custom component, image URL, or preset: 'default' | 'simple')
   */
  image?: React.ReactNode;

  /**
   * Image style
   */
  imageStyle?: React.CSSProperties;

  /**
   * Description text
   */
  description?: React.ReactNode;

  /**
   * Additional content below description (typically action buttons)
   */
  children?: React.ReactNode;

  /**
   * Additional className for the container
   */
  className?: string;
}

const Empty: React.FC<EmptyProps> = ({
  image = 'default',
  imageStyle,
  description = 'No Data',
  children,
  className = '',
}) => {
  // Render image based on type
  const renderImage = () => {
    if (image === 'default' || image === undefined) {
      return <DefaultEmptyImage />;
    }

    if (image === 'simple') {
      return <SimpleEmptyImage />;
    }

    if (typeof image === 'string') {
      return (
        <img src={image} alt='empty' style={imageStyle} className='mx-auto max-w-full h-auto' />
      );
    }

    return <div style={imageStyle}>{image}</div>;
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <div className='mb-2' style={imageStyle}>
        {renderImage()}
      </div>

      {description && (
        <p className='text-sm text-gray-500 dark:text-gray-400 mb-4 text-center'>{description}</p>
      )}

      {children && <div className='mt-2'>{children}</div>}
    </div>
  );
};

export default Empty;
