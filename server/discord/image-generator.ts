import { createCanvas, loadImage, registerFont } from 'canvas';
import { WelcomeConfig } from '@shared/schema';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

// Default background images
const DEFAULT_BACKGROUNDS = {
  default: 'https://i.imgur.com/qNxO3gR.png', // Discord dark theme background
  forest: 'https://i.imgur.com/2JXI37J.jpg',
  city: 'https://i.imgur.com/3Dy7tJv.jpg',
  abstract: 'https://i.imgur.com/0udsGMg.jpg'
};

export async function generateWelcomeImage(
  username: string, 
  serverName: string, 
  config: Partial<WelcomeConfig>
): Promise<Buffer> {
  // Canvas setup
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');
  
  // Default config values
  const backgroundImage = config.backgroundImage || 'default';
  const textColor = config.textColor || '#FFFFFF';
  const customBackgroundUrl = config.customBackgroundUrl;
  
  // Load background
  let backgroundUrl = DEFAULT_BACKGROUNDS[backgroundImage as keyof typeof DEFAULT_BACKGROUNDS];
  
  // Handle custom uploaded backgrounds
  if (backgroundImage === 'custom' && customBackgroundUrl) {
    try {
      // If it's a local uploaded file
      if (customBackgroundUrl.startsWith('/uploads/')) {
        const localPath = path.join(rootDir, customBackgroundUrl);
        if (fs.existsSync(localPath)) {
          // Draw background from local path
          const background = await loadImage(localPath);
          ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } else {
          // Fallback to default if file doesn't exist
          console.warn(`Custom background file not found: ${localPath}`);
          const background = await loadImage(DEFAULT_BACKGROUNDS.default);
          ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        }
      } else {
        // If it's a URL (for testing)
        const background = await loadImage(customBackgroundUrl);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Error loading custom background:', error);
      // Continue to use default if there's an error
      backgroundUrl = DEFAULT_BACKGROUNDS.default;
      const background = await loadImage(backgroundUrl);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
  } else {
    // Use the selected background from defaults
    if (!backgroundUrl) {
      backgroundUrl = DEFAULT_BACKGROUNDS.default;
    }
    const background = await loadImage(backgroundUrl);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  }
  
  // Add overlay to make text more readable
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set up text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  
  // Draw "WELCOME" text
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText('WELCOME', canvas.width / 2, 120);
  
  // Draw username
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(username, canvas.width / 2, 180);
  
  // Draw server name
  ctx.font = '30px sans-serif';
  ctx.fillText(`to ${serverName}`, canvas.width / 2, 230);
  
  // Convert canvas to buffer
  return canvas.toBuffer();
}