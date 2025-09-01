import { InterceptorStage } from 'deadem';

import GameObserver from 'deadem-examples-common/data/GameObserver';

import ParserFlowController from './ParserFlowController';

class Player {
    /**
     * @constructor
     * @param {Parser} parser 
     * @param {File} file 
     */
    constructor(parser, file) {
        this._parser = parser;
        this._parserFlowController = new ParserFlowController();

        this._gameObserver = new GameObserver(parser, Infinity);

        this._parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
            const capacity = await this._parserFlowController.ready();

            this._listener(demoPacket, capacity);
        });

        this._listener = noop;
        this._finishPromise = this._parser.parse(file.stream());
    }

    /**
     * @public
     * @returns {Promise<void>} 
     */
    get finishPromise() {
        return this._finishPromise;
    }

    /**
     * @public
     * @returns {GameObserver} 
     */
    get gameObserver() {
        return this._gameObserver;
    }

    /** 
     * @public
     * @returns {Parser}
     */
    get parser() {
        return this._parser;
    }

    /**
     * @public
     * @param {number} count 
     */
    move(count) {
        this._parserFlowController.open(count);
    }

    /**
     * @param {(DemoPacket, number) => void} listener 
     */
    onPacket(listener) {
        this._listener = listener;
    }

    /** 
     * @public
     */
    pause() {
        this._parserFlowController.close();
    }

    /** 
     * @public
     */
    play() {
        this._parserFlowController.open(Infinity);
    }
}

const noop = () => { };

export default Player;

