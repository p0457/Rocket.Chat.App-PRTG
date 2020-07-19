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

      let url = '';
      const color = `#${request.content.attachments[0].color}`;
      const title = request.content.attachments[0].author_name || request.content.attachments[0].fallback;
      let text: string = request.content.attachments[0].text;
      if (text) {
        text = text.replace('[', '\n[');
      }
      console.log('****1', text);
      const fields = new Array<IMessageAttachmentField>();
      const actions = new Array<IMessageAction>();

      request.content.attachments[0].fields.forEach(f => {
        fields.push({
          short: true,
          title: f.title.trim(),
          value: f.value
        });
      });
      request.content.attachments[0].actions.forEach(s => {
        if (s.url && url === '' && s.text === 'Scan Now') url = s.url.substring(0, s.url.indexOf("/scannow")); 
        actions.push({
          url: s.url,
          text: s.text,
          type: s.type
        });
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

      const attachment: IMessageAttachment = {
        collapsed: true,
        color,
        title: {
          value: title,
          link: url
        },
        text,
        fields,
        actions,
        actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
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
