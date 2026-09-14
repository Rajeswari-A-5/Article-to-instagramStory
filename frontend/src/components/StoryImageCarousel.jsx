import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function StoryImageCarousel({ images, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImageFilename = images[currentIndex];
  const imageUrl = `${API_BASE_URL}/images/${currentImageFilename}`;

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = currentImageFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-0 pb-10">
      {/* Phone Mockup Container */}
      <div className="relative w-[300px] h-[533px] bg-black rounded-[2.5rem] border-[8px] border-slate-950 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden ring-1 ring-cyan-500/30">
        
        {/* Dynamic Island / Notch Fake */}
        <div className="absolute top-2 w-24 h-6 bg-black rounded-full z-10"></div>
        
        <img 
          src={imageUrl} 
          alt={`Story slide ${currentIndex + 1}`} 
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Overlays */}
        {images.length > 1 && (
          <>
            {/* Left Click Area (invisible) */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10" 
              onClick={prevSlide}
            />
            {/* Right Click Area (invisible) */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10" 
              onClick={nextSlide}
            />
          </>
        )}
        
        {/* Progress Bars (Instagram style) */}
        <div className="absolute top-10 left-2 right-2 flex gap-1 z-20">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className={`h-full bg-cyan-400 transition-all duration-300 ${idx === currentIndex ? 'w-full' : idx < currentIndex ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleDownload}
          className="bg-cyan-500/20 backdrop-blur-md hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-50 font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
        >
          Download Image
        </button>
        {onReset && (
          <button 
            onClick={onReset}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
          >
            Create Another
          </button>
        )}
      </div>
    </div>
  );
}
