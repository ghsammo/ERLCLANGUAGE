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
import * as fs from 'fs';
import * as path from 'path';
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

// Command handler for welcomer image subcommand
async function handleWelcomerImageCommand(interaction: ChatInputCommandInteraction) {
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
    
    // Get the uploaded image attachment
    const attachment = interaction.options.getAttachment('image');
    if (!attachment) {
      await interaction.reply({
        content: 'Please provide an image for the welcome background.',
        ephemeral: true
      });
      return;
    }
    
    // Verify it's an image
    if (!attachment.contentType?.startsWith('image/')) {
      await interaction.reply({
        content: 'The uploaded file is not an image. Please upload a valid image file.',
        ephemeral: true
      });
      return;
    }
    
    // Defer reply as this might take a moment
    await interaction.deferReply();
    
    // Download the image
    const response = await fetch(attachment.url);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Generate a unique filename for the image
    const filename = `custom_${guildId}_${Date.now()}.png`;
    const imagePath = `./uploads/${filename}`;
    
    // Save the image locally
    // Ensure uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(imagePath, imageBuffer);
    
    // Get current welcome config
    let config = await storage.getWelcomeConfig(guildId);
    if (!config) {
      // Create a default config if none exists
      config = {
        id: 0,
        serverId: guildId,
        enabled: true,
        welcomeChannelId: interaction.channelId,
        welcomeMessage: 'Welcome to @server, @username!',
        includeImage: true,
        backgroundImage: 'custom',
        textColor: '#FFFFFF',
        customBackgroundUrl: `/uploads/${filename}`
      };
    } else {
      // Update existing config with new image
      config.backgroundImage = 'custom';
      config.includeImage = true;
      config.customBackgroundUrl = `/uploads/${filename}`;
    }
    
    // Update the config
    config = await storage.updateWelcomeConfig(config);
    
    // Update bot's config
    const bot = getBot();
    if (bot) {
      bot.updateWelcomeConfig(config);
    }
    
    // Generate a preview with the new background
    if (bot) {
      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply('Error: Could not find guild information.');
        return;
      }
      
      const imageBuffer = await bot.generateWelcomeImage('New User', guild.name, config);
      
      await interaction.editReply({
        content: `Welcome background image has been updated successfully!`,
        files: [{
          attachment: imageBuffer,
          name: 'welcome_preview.png'
        }]
      });
    } else {
      await interaction.editReply({
        content: `Welcome background image has been updated successfully!`
      });
    }
  } catch (error) {
    console.error('Error handling welcomer image command:', error);
    await interaction.followUp({
      content: 'There was an error while processing this command.',
      ephemeral: true
    });
  }
}

// Command handler for auto-role command
async function handleAutoRoleCommand(interaction: ChatInputCommandInteraction) {
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
    
    // Get current auto-role config
    let config = await storage.getAutoRoleConfig(guildId);
    
    // Get subcommand
    const subcommand = interaction.options.getSubcommand(false);
    
    if (subcommand === 'add') {
      const role = interaction.options.getRole('role');
      if (!role) {
        await interaction.reply({
          content: 'Please provide a valid role.',
          ephemeral: true
        });
        return;
      }
      
      // Initialize config if it doesn't exist
      if (!config) {
        config = {
          id: 0,
          serverId: guildId,
          enabled: true,
          roleIds: [role.id]
        };
      } else {
        // Add role if not already in the list
        if (!config.roleIds.includes(role.id)) {
          config.roleIds.push(role.id);
        }
      }
      
      // Update config
      config = await storage.updateAutoRoleConfig(config);
      
      // Update bot's config
      const bot = getBot();
      if (bot) {
        bot.updateAutoRoleConfig(config);
      }
      
      await interaction.reply({
        content: `Role ${role.name} will now be automatically assigned to new members.`,
        ephemeral: true
      });
    } 
    else if (subcommand === 'remove') {
      const role = interaction.options.getRole('role');
      if (!role) {
        await interaction.reply({
          content: 'Please provide a valid role.',
          ephemeral: true
        });
        return;
      }
      
      // Check if config exists
      if (!config || !config.roleIds.includes(role.id)) {
        await interaction.reply({
          content: `Role ${role.name} is not in the auto-role list.`,
          ephemeral: true
        });
        return;
      }
      
      // Remove role from list
      config.roleIds = config.roleIds.filter(id => id !== role.id);
      
      // Update config
      config = await storage.updateAutoRoleConfig(config);
      
      // Update bot's config
      const bot = getBot();
      if (bot) {
        bot.updateAutoRoleConfig(config);
      }
      
      await interaction.reply({
        content: `Role ${role.name} has been removed from the auto-role list.`,
        ephemeral: true
      });
    }
    else if (subcommand === 'list') {
      if (!config || config.roleIds.length === 0) {
        await interaction.reply({
          content: 'No auto-roles have been configured for this server.',
          ephemeral: true
        });
        return;
      }
      
      // Build list of roles
      const roleNames = config.roleIds.map(id => {
        const role = interaction.guild?.roles.cache.get(id);
        return role ? `<@&${id}>` : `Unknown role (${id})`;
      });
      
      const statusText = config.enabled ? 'Enabled' : 'Disabled';
      
      await interaction.reply({
        content: `**Auto-Role Status: ${statusText}**\n\nThe following roles will be automatically assigned to new members:\n${roleNames.join('\n')}`,
        ephemeral: true
      });
    }
    else if (subcommand === 'toggle') {
      if (!config) {
        config = {
          id: 0,
          serverId: guildId,
          enabled: true,
          roleIds: []
        };
      } else {
        // Toggle enabled status
        config.enabled = !config.enabled;
      }
      
      // Update config
      config = await storage.updateAutoRoleConfig(config);
      
      // Update bot's config
      const bot = getBot();
      if (bot) {
        bot.updateAutoRoleConfig(config);
      }
      
      const statusText = config.enabled ? 'enabled' : 'disabled';
      
      await interaction.reply({
        content: `Auto-role has been ${statusText}.`,
        ephemeral: true
      });
    }
    else {
      // Default command with no subcommand
      if (!config) {
        config = {
          id: 0,
          serverId: guildId,
          enabled: true,
          roleIds: []
        };
        
        // Update config
        config = await storage.updateAutoRoleConfig(config);
        
        // Update bot's config
        const bot = getBot();
        if (bot) {
          bot.updateAutoRoleConfig(config);
        }
        
        await interaction.reply({
          content: 'Auto-role has been enabled. Use `/auto-role add <role>` to add roles that will be automatically assigned to new members.',
          ephemeral: true
        });
      } else {
        const statusText = config.enabled ? 'enabled' : 'disabled';
        const roleCount = config.roleIds.length;
        
        await interaction.reply({
          content: `Auto-role is currently ${statusText} with ${roleCount} role(s) configured. Use subcommands to manage auto-roles:\n• \`/auto-role add <role>\` - Add a role\n• \`/auto-role remove <role>\` - Remove a role\n• \`/auto-role list\` - List configured roles\n• \`/auto-role toggle\` - Toggle auto-role on/off`,
          ephemeral: true
        });
      }
    }
  } catch (error) {
    console.error('Error handling auto-role command:', error);
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
    
    if (interaction.commandName === 'set-logs') {
      await handleSetLogsCommand(interaction);
    } 
    else if (interaction.commandName === 'welcomer') {
      // Check for subcommands
      const subcommand = interaction.options.getSubcommand(false);
      
      if (subcommand === 'image') {
        await handleWelcomerImageCommand(interaction);
      } else {
        await handleWelcomerCommand(interaction);
      }
    }
    else if (interaction.commandName === 'auto-role') {
      await handleAutoRoleCommand(interaction);
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
          type: ApplicationCommandType.ChatInput,
          options: [
            {
              name: 'image',
              description: 'Upload a custom background image for welcome messages',
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: 'image',
                  description: 'The image to use as welcome background',
                  type: ApplicationCommandOptionType.Attachment,
                  required: true
                }
              ]
            }
          ]
        },
        {
          name: 'auto-role',
          description: 'Automatically assign roles to new members',
          type: ApplicationCommandType.ChatInput,
          options: [
            {
              name: 'add',
              description: 'Add a role to be automatically assigned to new members',
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: 'role',
                  description: 'The role to add',
                  type: ApplicationCommandOptionType.Role,
                  required: true
                }
              ]
            },
            {
              name: 'remove',
              description: 'Remove a role from being automatically assigned',
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: 'role',
                  description: 'The role to remove',
                  type: ApplicationCommandOptionType.Role,
                  required: true
                }
              ]
            },
            {
              name: 'list',
              description: 'List all roles that will be automatically assigned',
              type: ApplicationCommandOptionType.Subcommand
            },
            {
              name: 'toggle',
              description: 'Toggle auto-role on/off',
              type: ApplicationCommandOptionType.Subcommand
            }
          ]
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
