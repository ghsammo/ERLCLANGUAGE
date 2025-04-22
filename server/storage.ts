import { 
  users, 
  type User, 
  type InsertUser, 
  type Server, 
  type InsertServer, 
  type LoggingConfig, 
  type InsertLoggingConfig, 
  type WelcomeConfig, 
  type InsertWelcomeConfig,
  type Channel,
  type InsertChannel
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Server methods
  getServer(id: string): Promise<Server | undefined>;
  getServers(): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  
  // Logging config methods
  getLoggingConfig(serverId: string): Promise<LoggingConfig | undefined>;
  updateLoggingConfig(config: InsertLoggingConfig): Promise<LoggingConfig>;
  
  // Welcome config methods
  getWelcomeConfig(serverId: string): Promise<WelcomeConfig | undefined>;
  updateWelcomeConfig(config: InsertWelcomeConfig): Promise<WelcomeConfig>;
  
  // Channel methods
  getChannels(serverId: string): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannels(channels: InsertChannel[]): Promise<Channel[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<string, Server>;
  private loggingConfigs: Map<string, LoggingConfig>;
  private welcomeConfigs: Map<string, WelcomeConfig>;
  private channels: Map<string, Channel>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.loggingConfigs = new Map();
    this.welcomeConfigs = new Map();
    this.channels = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Server methods
  async getServer(id: string): Promise<Server | undefined> {
    return this.servers.get(id);
  }
  
  async getServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }
  
  async createServer(server: InsertServer): Promise<Server> {
    this.servers.set(server.id, server as Server);
    return server as Server;
  }
  
  // Logging config methods
  async getLoggingConfig(serverId: string): Promise<LoggingConfig | undefined> {
    return Array.from(this.loggingConfigs.values()).find(
      (config) => config.serverId === serverId
    );
  }
  
  async updateLoggingConfig(config: InsertLoggingConfig): Promise<LoggingConfig> {
    const existingConfig = await this.getLoggingConfig(config.serverId);
    
    if (existingConfig) {
      const updatedConfig: LoggingConfig = { ...existingConfig, ...config };
      this.loggingConfigs.set(existingConfig.id.toString(), updatedConfig);
      return updatedConfig;
    } else {
      const id = this.currentId++;
      const newConfig: LoggingConfig = { ...config, id };
      this.loggingConfigs.set(id.toString(), newConfig);
      return newConfig;
    }
  }
  
  // Welcome config methods
  async getWelcomeConfig(serverId: string): Promise<WelcomeConfig | undefined> {
    return Array.from(this.welcomeConfigs.values()).find(
      (config) => config.serverId === serverId
    );
  }
  
  async updateWelcomeConfig(config: InsertWelcomeConfig): Promise<WelcomeConfig> {
    const existingConfig = await this.getWelcomeConfig(config.serverId);
    
    if (existingConfig) {
      const updatedConfig: WelcomeConfig = { ...existingConfig, ...config };
      this.welcomeConfigs.set(existingConfig.id.toString(), updatedConfig);
      return updatedConfig;
    } else {
      const id = this.currentId++;
      const newConfig: WelcomeConfig = { ...config, id };
      this.welcomeConfigs.set(id.toString(), newConfig);
      return newConfig;
    }
  }
  
  // Channel methods
  async getChannels(serverId: string): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      (channel) => channel.serverId === serverId
    );
  }
  
  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.get(id);
  }
  
  async createChannel(channel: InsertChannel): Promise<Channel> {
    this.channels.set(channel.id, channel as Channel);
    return channel as Channel;
  }
  
  async updateChannels(channels: InsertChannel[]): Promise<Channel[]> {
    const updatedChannels: Channel[] = [];
    
    for (const channel of channels) {
      this.channels.set(channel.id, channel as Channel);
      updatedChannels.push(channel as Channel);
    }
    
    return updatedChannels;
  }
}

export const storage = new MemStorage();
