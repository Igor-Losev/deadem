/** @import { StreamConfigurationOptions } from './StreamConfiguration.js' */

import StreamConfiguration from './StreamConfiguration.js';

class CutterConfiguration extends StreamConfiguration {
    /**
     * @public
     * @constructor
     * @param {StreamConfigurationOptions} [options]
     */
    constructor(options) {
        super(options);
    }

    /**
     * @public
     * @returns {CutterConfiguration}
     */
    static get DEFAULT() {
        return defaultConfiguration;
    }
}

const defaultConfiguration = new CutterConfiguration();

export default CutterConfiguration;
