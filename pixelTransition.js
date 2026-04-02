// pixelTransition.js
function runPixelTransitionForImage(imgContainer, imageElement) {
  imgContainer.style.position = 'relative';
  imgContainer.style.overflow = 'hidden';
  
  imageElement.style.opacity = '0';
  
  const gridSize = 7;
  const pixelColor = '#222';
  const animationStepDuration = 0.3;
  
  const pixelsContainer = document.createElement('div');
  pixelsContainer.style.position = 'absolute';
  pixelsContainer.style.zIndex = '3';
  pixelsContainer.style.top = '0';
  pixelsContainer.style.left = '0';
  pixelsContainer.style.width = '100%';
  pixelsContainer.style.height = '100%';
  pixelsContainer.style.pointerEvents = 'none';
  
  const pixels = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const pixel = document.createElement('div');
      pixel.style.backgroundColor = pixelColor;
      const sizeStr = (100 / gridSize).toFixed(2);
      pixel.style.width = `calc(${sizeStr}% + 1px)`;
      pixel.style.height = `calc(${sizeStr}% + 1px)`;
      pixel.style.left = `${(col * (100 / gridSize)).toFixed(2)}%`;
      pixel.style.top = `${(row * (100 / gridSize)).toFixed(2)}%`;
      pixel.style.position = 'absolute';
      pixel.style.display = 'block'; 
      
      pixelsContainer.appendChild(pixel);
      pixels.push(pixel);
    }
  }
  
  imgContainer.appendChild(pixelsContainer);
  
  const totalPixels = pixels.length;
  const staggerDuration = animationStepDuration / totalPixels;
  
  const tl = gsap.timeline();
  
  tl.set(imageElement, { opacity: 1 }, "+=0.1");
  
  tl.to(pixels, {
    display: 'none',
    opacity: 0,
    duration: 0.1,
    stagger: {
      each: staggerDuration,
      from: 'random'
    },
    onComplete: () => {
      pixelsContainer.remove();
    }
  });
}
