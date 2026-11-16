/** @import { ParserConfigurationOptions } from './ParserConfiguration.js' */

import ParserConfiguration from './ParserConfiguration.js';

class PlayerConfiguration extends ParserConfiguration {
    /**
     * @public
     * @constructor
     * @param {ParserConfigurationOptions} [options]
     */
    constructor(options) {
        super(options);
    }

    /**
     * @public
     * @returns {PlayerConfiguration}
     */
    static get DEFAULT() {
        return defaultConfiguration;
    }
}

const defaultConfiguration = new PlayerConfiguration();

export default PlayerConfiguration;
