import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import * as faceapi from 'face-api.js';

interface CTAButton {
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

interface Badge {
  icon: string;
  title: string;
  subtitle: string;
}

interface FaceAwareHeroProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  cta: CTAButton[];
  badge?: Badge;
  preferSide?: "left" | "right";
  enableFaceAware?: boolean;
  className?: string;
}

const FaceAwareHero = ({
  imageSrc,
  title,
  subtitle,
  cta,
  badge,
  preferSide = "left",
  enableFaceAware = true,
  className = "h-96"
}: FaceAwareHeroProps) => {
  const [textPosition, setTextPosition] = useState<"left" | "right" | "top-left" | "bottom-left">(preferSide);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.warn('Face detection models failed to load, using fallback positioning:', error);
        setModelsLoaded(false);
      }
    };

    if (enableFaceAware) {
      loadModels();
    }
  }, [enableFaceAware]);

  const detectFaces = async () => {
    if (!modelsLoaded || !imageRef.current || !enableFaceAware) {
      return;
    }

    try {
      const detections = await faceapi.detectAllFaces(
        imageRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
      );

      if (detections.length > 0) {
        const imageRect = imageRef.current.getBoundingClientRect();
        const leftThirdWidth = imageRect.width / 3;
        
        // Check if any faces are in the left third
        const facesInLeftThird = detections.some(detection => {
          const box = detection.box;
          return box.x < leftThirdWidth;
        });

        if (facesInLeftThird) {
          // Try top-left or bottom-left as alternatives
          const facesInTopLeft = detections.some(detection => {
            const box = detection.box;
            return box.x < leftThirdWidth && box.y < imageRect.height / 2;
          });

          setTextPosition(facesInTopLeft ? "bottom-left" : "top-left");
        } else {
          setTextPosition(preferSide);
        }
      }
    } catch (error) {
      console.warn('Face detection failed, using fallback positioning:', error);
    }
  };

  const getTextPositionClasses = () => {
    const baseClasses = "absolute z-10 p-6 md:p-8 lg:p-12";
    
    switch (textPosition) {
      case "right":
        return `${baseClasses} right-0 top-1/2 -translate-y-1/2 max-w-lg`;
      case "top-left":
        return `${baseClasses} left-0 top-0 max-w-lg`;
      case "bottom-left":
        return `${baseClasses} left-0 bottom-0 max-w-lg`;
      default: // "left"
        return `${baseClasses} left-0 top-1/2 -translate-y-1/2 max-w-lg`;
    }
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Hero background"
          className="w-full h-full object-cover object-center"
          style={{
            backgroundBlendMode: 'normal',
            mixBlendMode: 'normal',
            filter: 'none'
          }}
          onLoad={detectFaces}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Content with Local Scrim */}
      <div className={getTextPositionClasses()}>
        <div 
          className="relative rounded-2xl p-4 md:p-6 backdrop-blur-[4px]"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 60%, rgba(0,0,0,0))',
            maxWidth: '540px'
          }}
        >
          {/* Title */}
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight"
            style={{ 
              textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              // Constrain to 2-3 lines
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 leading-relaxed"
            style={{ 
              color: 'rgba(255,255,255,0.92)',
              // Max 120 chars constraint handled by styling
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {subtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
            {cta.map((button, index) => (
              <Button
                key={index}
                size="lg"
                variant={button.variant || "default"}
                onClick={button.onClick}
                className={`text-base md:text-lg px-6 py-3 ${button.className || ''}`}
              >
                {button.text}
              </Button>
            ))}
          </div>

          {/* Badge */}
          {badge && (
            <div 
              className="inline-flex items-center space-x-3 rounded-xl p-3"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(6px)'
              }}
            >
              <div className="w-10 h-10 bg-[#1E4D91]/10 rounded-full flex items-center justify-center">
                <span className="text-lg">{badge.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-xs text-gray-700">{badge.subtitle}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FaceAwareHero;