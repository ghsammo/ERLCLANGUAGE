import { 
  Client, 
  Events, 
  ApplicationCommandType, 
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  TextChannel
} from 'discord.js';
import { getBot } from './bot';
import { storage } from '../storage';
import { type LoggingConfig, type WelcomeConfig } from '@shared/schema';

// Command handler for set logs command
async function handleSetLogsCommand(interaction: ChatInputCommandInteraction) {
  try {
    // Check if the user has admin permissions
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: 'You need Administrator permissions to use this command.',
        ephemeral: true
      });
      return;
    }
    
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true
      });
      return;
    }
    
    // Get current logging config
    let config = await storage.getLoggingConfig(guildId);
    const defaultConfig: LoggingConfig = {
      id: 0,
      serverId: guildId,
      enabled: true,
      logChannelId: interaction.channelId,
      logMessageDeletions: true,
      logMessageEdits: true,
      logRolesAdded: true,
      logUserBans: true,
      logUserLeaves: true
    };
    
    // Create or update config
    config = await storage.updateLoggingConfig(config || defaultConfig);
    
    // Update bot's config
    const bot = getBot();
    if (bot) {
      bot.updateLoggingConfig(config);
    }
    
    await interaction.reply({
      content: `Logging has been enabled. Logs will be sent to <#${config.logChannelId || interaction.channelId}>.`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error handling set logs command:', error);
    await interaction.reply({
      content: 'There was an error while processing this command.',
      ephemeral: true
    });
  }
}

// Command handler for welcomer command
async function handleWelcomerCommand(interaction: ChatInputCommandInteraction) {
  try {
    // Check if the user has admin permissions
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: 'You need Administrator permissions to use this command.',
        ephemeral: true
      });
      return;
    }
    
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true
      });
      return;
    }
    
    // Get current welcome config
    let config = await storage.getWelcomeConfig(guildId);
    const defaultConfig: WelcomeConfig = {
      id: 0,
      serverId: guildId,
      enabled: true,
      welcomeChannelId: interaction.channelId,
      welcomeMessage: 'Welcome to @server, @username!',
      includeImage: true,
      backgroundImage: 'default',
      textColor: '#FFFFFF'
    };
    
    // Create or update config
    config = await storage.updateWelcomeConfig(config || defaultConfig);
    
    // Update bot's config
    const bot = getBot();
    if (bot) {
      bot.updateWelcomeConfig(config);
    }
    
    // Generate a preview image
    if (bot && config.includeImage) {
      await interaction.deferReply();
      
      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply('Error: Could not find guild information.');
        return;
      }
      
      const imageBuffer = await bot.generateWelcomeImage('New User', guild.name, config);
      
      await interaction.editReply({
        content: `Welcome messages have been enabled. They will be sent to <#${config.welcomeChannelId || interaction.channelId}>.`,
        files: [{
          attachment: imageBuffer,
          name: 'welcome_preview.png'
        }]
      });
    } else {
      await interaction.reply({
        content: `Welcome messages have been enabled. They will be sent to <#${config.welcomeChannelId || interaction.channelId}>.`,
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling welcomer command:', error);
    await interaction.reply({
      content: 'There was an error while processing this command.',
      ephemeral: true
    });
  }
}

export function registerCommands(client: Client): void {
  // Register slash command handler
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    switch (interaction.commandName) {
      case 'set-logs':
        await handleSetLogsCommand(interaction);
        break;
      case 'welcomer':
        await handleWelcomerCommand(interaction);
        break;
    }
  });
  
  // Register application commands (only once when the bot is added to a new server)
  client.on(Events.ClientReady, async () => {
    try {
      const commands = [
        {
          name: 'set-logs',
          description: 'Enable logging for various Discord events',
          type: ApplicationCommandType.ChatInput
        },
        {
          name: 'welcomer',
          description: 'Send welcome messages to new members',
          type: ApplicationCommandType.ChatInput
        }
      ];
      
      // Register commands for all guilds
      for (const guild of client.guilds.cache.values()) {
        await guild.commands.set(commands);
        console.log(`Registered commands for guild ${guild.name}`);
      }
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  });
}
