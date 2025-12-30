import React from 'react';

const SHAPES = [
  // 1. Four Overlapping Circles (Clover style)
  (
    <g>
      <circle cx="8" cy="8" r="7" strokeWidth="2" />
      <circle cx="16" cy="8" r="7" strokeWidth="2" />
      <circle cx="8" cy="16" r="7" strokeWidth="2" />
      <circle cx="16" cy="16" r="7" strokeWidth="2" />
    </g>
  ),
  // 2. Eight-pointed Star/Flower (Radial petals)
  (
    <path 
      d="M12 2C12 2 13 8 16 9C19 10 22 12 22 12C22 12 19 14 16 15C13 16 12 22 12 22C12 22 11 16 8 15C5 14 2 12 2 12C2 12 5 10 8 9C11 8 12 2 12 2Z" 
      strokeWidth="2" 
    />
  ),
  // 3. Wavy Horizontal Pattern
  (
    <g>
      <path d="M0 4C4 4 4 1 8 1C12 1 12 4 16 4C20 4 20 1 24 1" strokeWidth="2" fill="none" />
      <path d="M0 9C4 9 4 6 8 6C12 6 12 9 16 9C20 9 20 6 24 6" strokeWidth="2" fill="none" />
      <path d="M0 14C4 14 4 11 8 11C12 11 12 14 16 14C20 14 20 11 24 11" strokeWidth="2" fill="none" />
      <path d="M0 19C4 19 4 16 8 16C12 16 12 19 16 19C20 19 20 16 24 16" strokeWidth="2" fill="none" />
      <path d="M0 24C4 24 4 21 8 21C12 21 12 24 16 24C20 24 20 21 24 21" strokeWidth="2" fill="none" />
    </g>
  ),
  // 4. Concentric Circles (Target/Radar)
  (
    <g>
      <circle cx="12" cy="12" r="4" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="8" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="12" strokeWidth="2" fill="none" />
    </g>
  )
];

const FloatingShapes: React.FC = () => {
  const [elements, setElements] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Generate random positions and animations for 18 shapes
    const newElements = Array.from({ length: 18 }).map((_, i) => {
      const shapeIdx = Math.floor(Math.random() * SHAPES.length);
      const size = Math.floor(Math.random() * 80) + 50; // 50px to 130px
      const top = Math.floor(Math.random() * 100);
      const left = Math.floor(Math.random() * 100);
      // Slower, more atmospheric roaming: 25s to 50s
      const duration = Math.floor(Math.random() * 25) + 25; 
      const delay = Math.floor(Math.random() * 20);
      const initialRotation = Math.floor(Math.random() * 360);

      return {
        id: i,
        shape: SHAPES[shapeIdx],
        containerStyle: {
          top: `${top}%`,
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${initialRotation}deg)`,
        },
        animationStyle: {
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`,
        }
      };
    });
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute opacity-[0.18] transition-opacity duration-1000"
          style={el.containerStyle}
        >
          <div 
            className="w-full h-full animate-roam" 
            style={el.animationStyle}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full stroke-gray-400 fill-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {el.shape}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingShapes;