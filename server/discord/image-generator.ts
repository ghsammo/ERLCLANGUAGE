import { createCanvas, loadImage, registerFont } from 'canvas';
import { WelcomeConfig } from '@shared/schema';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import { getBot } from './bot'; // Assuming a function to get the bot instance exists

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
  let customBackgroundUrl = config.customBackgroundUrl;

  // Load background
  let backgroundUrl = DEFAULT_BACKGROUNDS[backgroundImage as keyof typeof DEFAULT_BACKGROUNDS];

  // Handle custom uploaded backgrounds
  if (backgroundImage === 'custom' && customBackgroundUrl) {
    try {
      // If it's a URL (for testing or Discord)
      const background = await loadImage(customBackgroundUrl);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
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
  const imageBuffer = canvas.toBuffer();

  // Send image to Discord channel and store the URL (this section was added)
  const bot = getBot();
  const channel = await bot?.getClient().channels.fetch('1364145628241727561');
  if (channel?.isTextBased()) {
    const attachment = { attachment: imageBuffer, name: 'welcome_image.png' };
    const message = await channel.send({ files: [attachment] });
    const imageUrl = message.attachments.first()?.url;
    if (!imageUrl) throw new Error('Failed to upload image to Discord');
    customBackgroundUrl = imageUrl;
  }

  return imageBuffer;
}