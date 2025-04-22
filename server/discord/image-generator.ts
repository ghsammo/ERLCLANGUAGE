import { createCanvas, loadImage, registerFont } from 'canvas';
import { WelcomeConfig } from '@shared/schema';
import { join } from 'path';

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
  
  // Load background
  let backgroundUrl = DEFAULT_BACKGROUNDS[backgroundImage as keyof typeof DEFAULT_BACKGROUNDS];
  if (!backgroundUrl && backgroundImage !== 'custom') {
    backgroundUrl = DEFAULT_BACKGROUNDS.default;
  } else if (backgroundImage === 'custom' && typeof backgroundImage === 'string' && backgroundImage.startsWith('http')) {
    backgroundUrl = backgroundImage;
  }
  
  // Draw background
  const background = await loadImage(backgroundUrl);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
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
