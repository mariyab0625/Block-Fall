import { useEffect } from 'react';

/**
 * Keyboard mapping:
 *   ← →         Move left / right
 *   ↓           Hard drop (instant land)
 *   Space       Rotate 90° CW  (press 1-2-3-4 times to cycle all 4 orientations)
 *   P           Pause / Resume
 *   R           Restart
 */
export function useKeyboard(handlers, active = true) {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          handlers.moveLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handlers.moveRight?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.hardDrop?.();   // ↓ = instant hard drop
          break;
        case 'Space':
          e.preventDefault();
          handlers.rotate?.();     // Space = rotate 90° CW each press
          break;
        case 'KeyP':
          handlers.pause?.();
          break;
        case 'KeyR':
          handlers.restart?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers, active]);
}
