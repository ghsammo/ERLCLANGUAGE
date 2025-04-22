import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startBot, getBot } from "./discord/bot";
import { 
  insertLoggingConfigSchema, 
  insertWelcomeConfigSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from 'url';

// Get the current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage_upload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'background-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_upload,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for UptimeRobot
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  // Initialize Discord bot if token is available
  try {
    await startBot();
  } catch (error) {
    console.warn("Failed to start Discord bot:", error);
  }
  
  // API routes
  
  // Get servers
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });
  
  // Get channels for a server
  app.get("/api/servers/:serverId/channels", async (req, res) => {
    try {
      const { serverId } = req.params;
      const channels = await storage.getChannels(serverId);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });
  
  // Get logging config for a server
  app.get("/api/servers/:serverId/logging", async (req, res) => {
    try {
      const { serverId } = req.params;
      const config = await storage.getLoggingConfig(serverId);
      
      if (!config) {
        const defaultConfig = {
          serverId,
          enabled: false,
          logChannelId: null,
          logMessageDeletions: false,
          logMessageEdits: false,
          logRolesAdded: false,
          logUserBans: false,
          logUserLeaves: false
        };
        return res.json(defaultConfig);
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logging configuration" });
    }
  });
  
  // Update logging config for a server
  app.post("/api/servers/:serverId/logging", async (req, res) => {
    try {
      const { serverId } = req.params;
      const validatedData = insertLoggingConfigSchema.parse({
        ...req.body,
        serverId
      });
      
      const config = await storage.updateLoggingConfig(validatedData);
      
      // Apply changes to bot
      const bot = getBot();
      if (bot) {
        bot.updateLoggingConfig(config);
      }
      
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update logging configuration" });
    }
  });
  
  // Get welcome config for a server
  app.get("/api/servers/:serverId/welcome", async (req, res) => {
    try {
      const { serverId } = req.params;
      const config = await storage.getWelcomeConfig(serverId);
      
      if (!config) {
        const defaultConfig = {
          serverId,
          enabled: false,
          welcomeChannelId: null,
          welcomeMessage: "Welcome to @server, @username!",
          includeImage: true,
          backgroundImage: "default",
          customBackgroundUrl: null,
          textColor: "#FFFFFF"
        };
        return res.json(defaultConfig);
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch welcome configuration" });
    }
  });
  
  // Update welcome config for a server
  app.post("/api/servers/:serverId/welcome", async (req, res) => {
    try {
      const { serverId } = req.params;
      const validatedData = insertWelcomeConfigSchema.parse({
        ...req.body,
        serverId
      });
      
      const config = await storage.updateWelcomeConfig(validatedData);
      
      // Apply changes to bot
      const bot = getBot();
      if (bot) {
        bot.updateWelcomeConfig(config);
      }
      
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update welcome configuration" });
    }
  });
  
  // Preview welcome image
  app.post("/api/welcome/preview", async (req, res) => {
    try {
      const { username, serverName, config } = req.body;
      
      const bot = getBot();
      if (!bot) {
        // If bot is not available, use the image generator directly
        try {
          const { generateWelcomeImage } = require('./discord/image-generator');
          const imageBuffer = await generateWelcomeImage(username, serverName, config);
          res.set('Content-Type', 'image/png');
          return res.send(imageBuffer);
        } catch (imgError) {
          console.error("Failed to generate image:", imgError);
          return res.status(500).json({ message: "Image generation failed" });
        }
      }
      
      const imageBuffer = await bot.generateWelcomeImage(username, serverName, config);
      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      console.error("Failed to generate preview image:", error);
      res.status(500).json({ message: "Failed to generate preview image" });
    }
  });

  // Upload custom background image
  app.post("/api/servers/:serverId/welcome/upload", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      const { serverId } = req.params;
      
      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Get the relative path to the image
      const relativePath = path.relative(path.join(__dirname, ".."), file.path);
      const imageUrl = `/${relativePath.replace(/\\/g, '/')}`;

      // Update the welcome config with the custom image URL
      const currentConfig = await storage.getWelcomeConfig(serverId);
      const updatedConfig = {
        ...currentConfig,
        serverId,
        backgroundImage: 'custom',
        customBackgroundUrl: imageUrl
      };

      const config = await storage.updateWelcomeConfig(updatedConfig);
      
      // Apply changes to bot
      const bot = getBot();
      if (bot) {
        bot.updateWelcomeConfig(config);
      }
      
      res.json({ message: "Image uploaded successfully", config });
    } catch (error) {
      console.error("Failed to upload image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(__dirname, '../uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
