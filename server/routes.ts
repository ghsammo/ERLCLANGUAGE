import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startBot, getBot } from "./discord/bot";
import { 
  insertLoggingConfigSchema, 
  insertWelcomeConfigSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
