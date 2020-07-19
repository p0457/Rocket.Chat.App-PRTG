import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { IMessageAction, IMessageAttachment, IMessageAttachmentField, MessageActionButtonsAlignment, MessageActionType, MessageProcessingType } from '@rocket.chat/apps-engine/definition/messages';

export class WebhookEndpooint extends ApiEndpoint {
  public path = 'notify';

  public async post(
      request: IApiRequest,
      endpoint: IApiEndpointInfo,
      read: IRead,
      modify: IModify,
  ): Promise<IApiResponse> {
      if (!request.content || !request.content.username || !request.content.attachments || !request.content.attachments[0]) {
        return this.success();
      }

      request.content.attachments[0].fields.forEach(f => {
        f.short = true;
      });
      request.content.attachments[0].actions.forEach(s => {
        s.short = true;
      });
      
      const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
      const alias = await read.getEnvironmentReader().getSettings().getValueById('alias');
      const sendTo = await read.getEnvironmentReader().getSettings().getValueById('postto');
      const senderName = await read.getEnvironmentReader().getSettings().getValueById('sender');
      const sender = await read.getUserReader().getById(senderName);

      let room;
      if (sendTo.startsWith('@')) {
        room = await read.getRoomReader().getDirectByUsernames([senderName, sendTo.substring(1, sendTo.length)]);
      } else if (sendTo.startsWith('#')) {
        room = await read.getRoomReader().getByName(sendTo.substring(1, sendTo.length));
      }

      if (!room) {
        return this.success();
      }

      const attachment = {
        color: `#${request.content.attachments[0].color}`,
        title: request.content.attachments[0].author_name || request.content.attachments[0].fallback,
        text: request.content.attachments[0].text,
        fields: request.content.attachments[0].fields,
        actions: request.content.attachments[0].actions
      };

      const message = modify.getCreator().startMessage({
        room,
        sender,
        groupable: false,
        avatarUrl,
        alias,
      }).setAttachments([attachment]);

      await modify.getCreator().finish(message);

      return this.success();
  }
}
