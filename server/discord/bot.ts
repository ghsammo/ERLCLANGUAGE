import { Client, Events, GatewayIntentBits, ActivityType } from 'discord.js';
import { setupEventHandlers } from './events';
import { registerCommands } from './commands';
import { storage } from '../storage';
import { generateWelcomeImage } from './image-generator';
import { type LoggingConfig, type WelcomeConfig, type AutoRoleConfig, type InsertServer, type InsertChannel } from '@shared/schema';

class DiscordBot {
  private client: Client;
  private token: string;
  private loggingConfigs: Map<string, LoggingConfig>;
  private welcomeConfigs: Map<string, WelcomeConfig>;
  private autoRoleConfigs: Map<string, AutoRoleConfig>;
  private isReady: boolean;

  constructor(token: string) {
    this.token = token;
    this.loggingConfigs = new Map();
    this.welcomeConfigs = new Map();
    this.autoRoleConfigs = new Map();
    this.isReady = false;

    // Initialize Discord.js client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration
      ]
    });
  }

  async start(): Promise<void> {
    try {
      console.log('Starting Discord bot...');
      
      // Setup event handlers for the client
      setupEventHandlers(this.client, this);
      
      // Register slash commands
      registerCommands(this.client);
      
      // Login to Discord with the bot token
      await this.client.login(this.token);
      
      // Set bot activity
      this.client.user?.setPresence({
        activities: [{ name: 'Logging & Welcoming', type: ActivityType.Watching }],
        status: 'online',
      });
      
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      
      // Load configurations from storage
      await this.loadConfigurations();
      
      // Cache guild information
      await this.cacheGuildInfo();
      
      this.isReady = true;
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  async loadConfigurations(): Promise<void> {
    // Load configurations from storage for all servers
    const servers = await storage.getServers();
    
    for (const server of servers) {
      // Load logging config
      const loggingConfig = await storage.getLoggingConfig(server.id);
      if (loggingConfig) {
        this.loggingConfigs.set(server.id, loggingConfig);
      }
      
      // Load welcome config
      const welcomeConfig = await storage.getWelcomeConfig(server.id);
      if (welcomeConfig) {
        this.welcomeConfigs.set(server.id, welcomeConfig);
      }
    }
  }

  async cacheGuildInfo(): Promise<void> {
    // Wait for client to be ready
    if (!this.client.isReady()) {
      await new Promise<void>((resolve) => {
        this.client.once(Events.ClientReady, () => resolve());
      });
    }
    
    // Cache guild (server) information
    for (const [id, guild] of this.client.guilds.cache) {
      // Add server to storage if not exists
      const server = await storage.getServer(id);
      if (!server) {
        const serverData: InsertServer = {
          id,
          name: guild.name
        };
        await storage.createServer(serverData);
      }
      
      // Cache channels
      const channels = await storage.getChannels(id);
      const channelUpdates: InsertChannel[] = [];
      
      guild.channels.cache.forEach(channel => {
        if (channel.isTextBased()) {
          const existingChannel = channels.find(c => c.id === channel.id);
          if (!existingChannel) {
            channelUpdates.push({
              id: channel.id,
              serverId: id,
              name: channel.name,
              type: channel.type.toString()
            });
          }
        }
      });
      
      if (channelUpdates.length > 0) {
        await storage.updateChannels(channelUpdates);
      }
    }
  }

  getLoggingConfig(serverId: string): LoggingConfig | undefined {
    return this.loggingConfigs.get(serverId);
  }

  updateLoggingConfig(config: LoggingConfig): void {
    this.loggingConfigs.set(config.serverId, config);
  }

  getWelcomeConfig(serverId: string): WelcomeConfig | undefined {
    return this.welcomeConfigs.get(serverId);
  }

  updateWelcomeConfig(config: WelcomeConfig): void {
    this.welcomeConfigs.set(config.serverId, config);
  }

  getClient(): Client {
    return this.client;
  }

  isClientReady(): boolean {
    return this.isReady && this.client.isReady();
  }

  async generateWelcomeImage(username: string, serverName: string, config: Partial<WelcomeConfig>): Promise<Buffer> {
    return generateWelcomeImage(username, serverName, config);
  }
}

let botInstance: DiscordBot | null = null;

export async function startBot(): Promise<DiscordBot | null> {
  if (!botInstance) {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.warn('DISCORD_BOT_TOKEN environment variable is not set. Bot functionality will be disabled.');
      return null;
    }
    
    botInstance = new DiscordBot(token);
    await botInstance.start();
  }
  
  return botInstance;
}

export function getBot(): DiscordBot | null {
  return botInstance;
}
