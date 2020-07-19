import {
  IConfigurationExtend, IEnvironmentRead, ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpooint } from './endpoints/webhook';

export class PRTGApp extends App {
    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
      await configuration.settings.provideSetting({
        id: 'sender',
        type: SettingType.STRING,
        packageValue: 'prtg.bot',
        required: true,
        public: false,
        i18nLabel: 'customize_sender',
        i18nDescription: 'customize_sender_description',
      });

      await configuration.settings.provideSetting({
        id: 'alias',
        type: SettingType.STRING,
        packageValue: 'PRTG Network Monitor',
        required: true,
        public: false,
        i18nLabel: 'customize_alias',
        i18nDescription: 'customize_alias_description',
      });

      await configuration.settings.provideSetting({
        id: 'icon',
        type: SettingType.STRING,
        packageValue: 'https://raw.githubusercontent.com/tgardner851/Rocket.Chat.App-PRTG/master/icon.png',
        required: true,
        public: false,
        i18nLabel: 'customize_icon',
        i18nDescription: 'customize_icon_description',
      });

      await configuration.settings.provideSetting({
        id: 'postto',
        type: SettingType.STRING,
        packageValue: '',
        required: true,
        public: false,
        i18nLabel: 'customize_postto',
        i18nDescription: 'customize_postto_description',
      });

      await configuration.api.provideApi({
        visibility: ApiVisibility.PRIVATE,
        security: ApiSecurity.UNSECURE,
        endpoints: [new WebhookEndpooint(this)],
      });
    }
}
