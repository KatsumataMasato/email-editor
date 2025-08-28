'use client';

import React, { useState, useRef } from 'react';
import { Image } from 'lucide-react';

interface ImageComponentProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  onUpdate: (data: any) => void;
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

export function ImageComponent({
  src,
  alt = '',
  width = 'auto',
  height = 'auto',
  onUpdate,
  onImageUpload,
  isLoading = false
}: ImageComponentProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('ImageComponent render:', { src, isLoading, imageLoadError, imageLoaded });

  // srcが変更された時にimageLoadedをリセット
  React.useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageLoadError(false);
    }
  }, [src]);

  const handleResize = (e: React.MouseEvent) => {
    if (!imageRef.current || !containerRef.current) return;
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = imageRef.current.offsetWidth;
    const startHeight = imageRef.current.offsetHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      onUpdate({
        width: `${Math.max(50, newWidth)}px`,
        height: `${Math.max(30, newHeight)}px`,
        alt,
        src
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (isLoading) {
    return (
      <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm text-gray-600">アップロード中...</p>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageUpload(file);
          }}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
          <Image className="mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">画像をアップロード</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF対応</p>
        </label>
        
        {/* テスト用：ローカル画像表示ボタン */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              const testImageUrl = 'https://picsum.photos/400/300';
              console.log('Testing with placeholder image:', testImageUrl);
              // 新しい画像設定時にローディング状態をリセット
              setImageLoaded(false);
              setImageLoadError(false);
              onUpdate({ 
                src: testImageUrl, 
                alt: 'Test Image', 
                width: '400px', 
                height: '300px' 
              });
            }}
            className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
          >
            テスト画像を使用
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block min-h-[200px] max-w-full">
      {/* 画像読み込みエラー表示 */}
      {imageLoadError ? (
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded">
          <div className="text-red-600 text-sm font-medium mb-2">画像の読み込みに失敗しました</div>
          <div className="text-red-500 text-xs break-all px-2 text-center max-w-full">{src}</div>
          <button 
            onClick={() => {
              console.log('Retrying image load:', src);
              setImageLoadError(false);
              // 強制的に画像を再読み込み
              if (imageRef.current) {
                imageRef.current.src = '';
                setTimeout(() => {
                  if (imageRef.current) {
                    imageRef.current.src = src + '?reload=' + Date.now();
                  }
                }, 100);
              }
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      ) : (
        <>
          {/* 読み込み中のスケルトン（画像読み込み完了後は非表示） */}
          {!imageLoaded && (
            <div 
              className={`bg-gray-200 animate-pulse rounded transition-opacity duration-200`}
              style={{ 
                width: width === 'auto' ? '400px' : (width || '400px'), 
                height: height === 'auto' ? '300px' : (height || '300px'),
                minHeight: '200px',
              }}
            />
          )}
          
          {/* 実際の画像 */}
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            style={{
              width: width === 'auto' ? 'auto' : (width || '400px'),
              height: height === 'auto' ? 'auto' : (height || '300px'),
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'contain'
            }}
            className={`rounded transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={(e) => {
              console.log('Image loaded successfully:', src);
              setImageLoaded(true);
              setImageLoadError(false);
            }}
            onError={(e) => {
              console.log('Image load error:', src, e);
              setImageLoadError(true);
              setImageLoaded(false);
            }}
          />
          
          {/* リサイズハンドル */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100 z-10"
            onMouseDown={handleResize}
            style={{
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </>
      )}
    </div>
  );
}