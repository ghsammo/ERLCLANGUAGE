import { 
  Client, 
  Events, 
  TextChannel, 
  GuildMember, 
  EmbedBuilder,
  Colors,
  Message,
  Role,
  User,
  Guild,
  GuildBan,
  PartialMessage,
  MessageType
} from 'discord.js';
import { generateWelcomeImage } from './image-generator';
import type { DiscordBot } from './bot';

export function setupEventHandlers(client: Client, bot: DiscordBot): void {
  // Ready event
  client.once(Events.ClientReady, () => {
    console.log('Discord bot is ready!');
  });

  // Guild Member Add event (user joins)
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      // Handle welcome message
      const welcomeConfig = bot.getWelcomeConfig(member.guild.id);
      
      // Only proceed with welcome message if enabled
      if (welcomeConfig && welcomeConfig.enabled && welcomeConfig.welcomeChannelId) {
        const welcomeChannel = member.guild.channels.cache.get(welcomeConfig.welcomeChannelId) as TextChannel;
        if (welcomeChannel && welcomeChannel.isTextBased()) {
          // Format welcome message
          const welcomeMessage = welcomeConfig.welcomeMessage
            .replace(/@server/g, member.guild.name)
            .replace(/@username/g, member.user.username);
          
          // Generate welcome image if enabled
          if (welcomeConfig.includeImage) {
            const imageBuffer = await generateWelcomeImage(
              member.user.username,
              member.guild.name,
              welcomeConfig
            );
            
            await welcomeChannel.send({
              content: welcomeMessage,
              files: [{
                attachment: imageBuffer,
                name: 'welcome.png'
              }]
            });
          } else {
            await welcomeChannel.send(welcomeMessage);
          }
        } else {
          console.error(`Welcome channel not found or not a text channel for guild ${member.guild.id}`);
        }
      }
      
      // Handle auto role assignment
      const autoRoleConfig = bot.getAutoRoleConfig(member.guild.id);
      
      // Only proceed with auto role if enabled and roles are configured
      if (autoRoleConfig && autoRoleConfig.enabled && autoRoleConfig.roleIds.length > 0) {
        for (const roleId of autoRoleConfig.roleIds) {
          try {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
              await member.roles.add(role);
              console.log(`Added role ${role.name} to new member ${member.user.tag} in ${member.guild.name}`);
            } else {
              console.warn(`Role ${roleId} not found in guild ${member.guild.id}`);
            }
          } catch (roleError) {
            console.error(`Error adding role ${roleId} to member ${member.id}:`, roleError);
          }
        }
      }
    } catch (error) {
      console.error('Error handling guild member add event:', error);
    }
  });

  // Message Delete event
  client.on(Events.MessageDelete, async (message: Message<boolean> | PartialMessage) => {
    try {
      if (!message.guild) return;
      
      const config = bot.getLoggingConfig(message.guild.id);
      
      // Only proceed if logging is enabled for this event
      if (!config || !config.enabled || !config.logMessageDeletions || !config.logChannelId) {
        return;
      }
      
      // Skip bot messages and system messages
      if (message.author?.bot || message.type !== MessageType.Default) {
        return;
      }
      
      const logChannel = message.guild.channels.cache.get(config.logChannelId) as TextChannel;
      if (!logChannel || !logChannel.isTextBased()) {
        console.error(`Log channel not found or not a text channel for guild ${message.guild.id}`);
        return;
      }
      
      // Create log embed
      const embed = new EmbedBuilder()
        .setTitle('Message Deleted')
        .setColor(Colors.Red)
        .setTimestamp()
        .addFields(
          { name: 'Author', value: message.author?.tag || 'Unknown', inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true }
        );
      
      if (message.content) {
        embed.addFields({ name: 'Content', value: message.content.substring(0, 1024) });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling message delete event:', error);
    }
  });

  // Message Update event
  client.on(Events.MessageUpdate, async (oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => {
    try {
      if (!oldMessage.guild) return;
      
      const config = bot.getLoggingConfig(oldMessage.guild.id);
      
      // Only proceed if logging is enabled for this event
      if (!config || !config.enabled || !config.logMessageEdits || !config.logChannelId) {
        return;
      }
      
      // Skip bot messages and system messages
      if (oldMessage.author?.bot || oldMessage.type !== MessageType.Default) {
        return;
      }
      
      // Skip if content is the same (could be embed or attachment changes)
      if (oldMessage.content === newMessage.content) {
        return;
      }
      
      const logChannel = oldMessage.guild.channels.cache.get(config.logChannelId) as TextChannel;
      if (!logChannel || !logChannel.isTextBased()) {
        console.error(`Log channel not found or not a text channel for guild ${oldMessage.guild.id}`);
        return;
      }
      
      // Create log embed
      const embed = new EmbedBuilder()
        .setTitle('Message Edited')
        .setColor(Colors.Gold)
        .setTimestamp()
        .setURL(newMessage.url)
        .addFields(
          { name: 'Author', value: oldMessage.author?.tag || 'Unknown', inline: true },
          { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
          { name: 'Before', value: (oldMessage.content || 'No content').substring(0, 1024) },
          { name: 'After', value: (newMessage.content || 'No content').substring(0, 1024) }
        );
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling message update event:', error);
    }
  });

  // Guild Member Update event (roles added)
  client.on(Events.GuildMemberUpdate, async (oldMember: GuildMember, newMember: GuildMember) => {
    try {
      const config = bot.getLoggingConfig(newMember.guild.id);
      
      // Only proceed if logging is enabled for this event
      if (!config || !config.enabled || !config.logRolesAdded || !config.logChannelId) {
        return;
      }
      
      const logChannel = newMember.guild.channels.cache.get(config.logChannelId) as TextChannel;
      if (!logChannel || !logChannel.isTextBased()) {
        console.error(`Log channel not found or not a text channel for guild ${newMember.guild.id}`);
        return;
      }
      
      // Check for added roles
      const addedRoles: Role[] = [];
      newMember.roles.cache.forEach(role => {
        if (!oldMember.roles.cache.has(role.id)) {
          addedRoles.push(role);
        }
      });
      
      // If no roles were added, exit
      if (addedRoles.length === 0) {
        return;
      }
      
      // Create log embed
      const embed = new EmbedBuilder()
        .setTitle('Roles Added')
        .setColor(Colors.Green)
        .setTimestamp()
        .setThumbnail(newMember.user.displayAvatarURL())
        .addFields(
          { name: 'User', value: newMember.user.tag, inline: true },
          { name: 'Added Roles', value: addedRoles.map(r => `<@&${r.id}>`).join('\n') || 'None' }
        );
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling guild member update event:', error);
    }
  });

  // Guild Ban Add event
  client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
    try {
      const config = bot.getLoggingConfig(ban.guild.id);
      
      // Only proceed if logging is enabled for this event
      if (!config || !config.enabled || !config.logUserBans || !config.logChannelId) {
        return;
      }
      
      const logChannel = ban.guild.channels.cache.get(config.logChannelId) as TextChannel;
      if (!logChannel || !logChannel.isTextBased()) {
        console.error(`Log channel not found or not a text channel for guild ${ban.guild.id}`);
        return;
      }
      
      // Create log embed
      const embed = new EmbedBuilder()
        .setTitle('User Banned')
        .setColor(Colors.DarkRed)
        .setTimestamp()
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields(
          { name: 'User', value: ban.user.tag, inline: true },
          { name: 'ID', value: ban.user.id, inline: true }
        );
      
      if (ban.reason) {
        embed.addFields({ name: 'Reason', value: ban.reason });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling guild ban add event:', error);
    }
  });

  // Guild Member Remove event (user leaves)
  client.on(Events.GuildMemberRemove, async (member: GuildMember) => {
    try {
      const config = bot.getLoggingConfig(member.guild.id);
      
      // Only proceed if logging is enabled for this event
      if (!config || !config.enabled || !config.logUserLeaves || !config.logChannelId) {
        return;
      }
      
      // Skip if the user was banned
      const bans = await member.guild.bans.fetch();
      if (bans.has(member.id)) {
        return; // This is a ban, not a leave
      }
      
      const logChannel = member.guild.channels.cache.get(config.logChannelId) as TextChannel;
      if (!logChannel || !logChannel.isTextBased()) {
        console.error(`Log channel not found or not a text channel for guild ${member.guild.id}`);
        return;
      }
      
      // Calculate how long the user was in the server
      const joinedAt = member.joinedAt;
      const now = new Date();
      let timeInServer = 'Unknown';
      
      if (joinedAt) {
        const diff = now.getTime() - joinedAt.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
          timeInServer = `${days} days, ${hours} hours`;
        } else {
          timeInServer = `${hours} hours`;
        }
      }
      
      // Create log embed
      const embed = new EmbedBuilder()
        .setTitle('User Left')
        .setColor(Colors.Grey)
        .setTimestamp()
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: 'User', value: member.user.tag, inline: true },
          { name: 'ID', value: member.user.id, inline: true },
          { name: 'Joined Server', value: joinedAt ? joinedAt.toLocaleString() : 'Unknown', inline: true },
          { name: 'Time in Server', value: timeInServer, inline: true }
        );
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling guild member remove event:', error);
    }
  });
}
