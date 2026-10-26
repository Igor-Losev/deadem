import { EmbeddedMessageType as EngineEmbeddedMessageType } from '@deademx/engine';

class EmbeddedMessageType extends EngineEmbeddedMessageType {
    static get USER_COMMAND() { return userCommand; }
}

const userCommand = new EmbeddedMessageType('USER_COMMAND', 'CSGOUserCmdPB');

export default EmbeddedMessageType;
