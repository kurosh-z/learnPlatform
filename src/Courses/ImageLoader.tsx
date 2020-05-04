import React from 'react';

const ImageLoader: React.FC<{
  src: string;
  className: string;
  hidden: boolean;
}> = ({ src, className, hidden }) => {
  console.log(src, hidden);
  return (
    <img
      className={className}
      src={src}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}></img>
  );
};

export default ImageLoader;
