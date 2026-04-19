import { DemoSource } from '@deadem/engine';

import Assert from '@deadem/engine/src/core/Assert.js';

import Game from './Game.js';

const EXTENSION_BIN = '.bin';
const EXTENSION_DEM = '.dem';

const registry = new Map();

class DemoFile {
    /**
     * @constructor
     * @param {DemoSource} source
     * @param {number} id
     * @param {Game} game
     * @param {number|null} [gameBuild=null]
     * @param {metaObject|null} [meta=null]
     */
    constructor(source, id, game, gameBuild = null, meta = null) {
        Assert.isTrue(source instanceof DemoSource);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(game instanceof Game);
        Assert.isTrue(gameBuild === null || Number.isInteger(gameBuild));

        this._id = id;
        this._game = game;
        this._gameBuild = gameBuild;
        this._source = source;
        this._meta = meta;

        const key = getKey(id, source, game);

        registry.set(key, this);
    }

    /**
     * @public
     * @returns {DemoSource}
     */
    get source() {
        return this._source;
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {Game}
     */
    get game() {
        return this._game;
    }

    /**
     * @public
     * @returns {number|null}
     */
    get gameBuild() {
        return this._gameBuild;
    }

    /**
     * @public
     * @returns {metaObject|null}
     */
    get meta() {
        return this._meta;
    }

    /**
     * @public
     * @static
     * @returns {Array<DemoFile>}
     */
    static getAll() {
        return Array.from(registry.values());
    }

    /**
     * @public
     * @static
     * @param {number} id
     * @param {Game} game
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @returns {DemoFile|null}
     */
    static parse(id, game, source = DemoSource.REPLAY) {
        const key = getKey(id, source, game);

        return registry.get(key) || null;
    }

    // === DEADLOCK ===
    static get DEADLOCK_REPLAY_35244871() { return deadlockReplay35244871; }
    static get DEADLOCK_REPLAY_36126255() { return deadlockReplay36126255; }
    static get DEADLOCK_REPLAY_36126420() { return deadlockReplay36126420; }
    static get DEADLOCK_REPLAY_36126460() { return deadlockReplay36126460; }
    static get DEADLOCK_REPLAY_36126674() { return deadlockReplay36126674; }
    static get DEADLOCK_REPLAY_36126684() { return deadlockReplay36126684; }
    static get DEADLOCK_REPLAY_36126738() { return deadlockReplay36126738; }
    static get DEADLOCK_REPLAY_36126858() { return deadlockReplay36126858; }
    static get DEADLOCK_REPLAY_36127043() { return deadlockReplay36127043; }
    static get DEADLOCK_REPLAY_36127052() { return deadlockReplay36127052; }
    static get DEADLOCK_REPLAY_36127128() { return deadlockReplay36127128; }
    static get DEADLOCK_REPLAY_36437939() { return deadlockReplay36437939; }
    static get DEADLOCK_REPLAY_37289286() { return deadlockReplay37289286; }
    static get DEADLOCK_REPLAY_37289347() { return deadlockReplay37289347; }
    static get DEADLOCK_REPLAY_37554876() { return deadlockReplay37554876; }
    static get DEADLOCK_REPLAY_37610767() { return deadlockReplay37610767; }
    static get DEADLOCK_REPLAY_38284967() { return deadlockReplay38284967; }
    static get DEADLOCK_REPLAY_38571265() { return deadlockReplay38571265; }
    static get DEADLOCK_REPLAY_38625795() { return deadlockReplay38625795; }
    static get DEADLOCK_REPLAY_38969017() { return deadlockReplay38969017; }
    static get DEADLOCK_REPLAY_40637165() { return deadlockReplay40637165; }
    static get DEADLOCK_REPLAY_48960058() { return deadlockReplay48960058; }
    static get DEADLOCK_REPLAY_51541751() { return deadlockReplay51541751; }
    static get DEADLOCK_REPLAY_51541762() { return deadlockReplay51541762; }
    static get DEADLOCK_REPLAY_51543455() { return deadlockReplay51543455; }
    static get DEADLOCK_REPLAY_51544119() { return deadlockReplay51544119; }
    static get DEADLOCK_REPLAY_75438101() { return deadlockReplay75438101; }
    static get DEADLOCK_REPLAY_75439032() { return deadlockReplay75439032; }
    static get DEADLOCK_BROADCAST_38625795() { return deadlockBroadcast38625795; }

    // === DOTA2 ===
    static get DOTA2_REPLAY_8773493455() { return dota2Replay8773493455; }
    static get DOTA2_REPLAY_8777738576() { return dota2Replay8777738576; }

    /**
     * @public
     * @returns {string}
     */
    getFileName() {
        let filename = this._id.toString();

        if (this._gameBuild !== null) {
            filename = `${filename}-${this._gameBuild}`;
        }

        if (this._source === DemoSource.HTTP_BROADCAST) {
            filename = `${filename}${EXTENSION_BIN}`;
        } else {
            filename = `${filename}${EXTENSION_DEM}`;
        }

        return filename;
    }
}

function getKey(id, source, game) {
    return `${id}-${source.code}-${game.code}`;
}

// === DEADLOCK ===
const deadlockReplay35244871 = new DemoFile(DemoSource.REPLAY, 35244871, Game.DEADLOCK, null, { size: 205924893 });
const deadlockReplay36126255 = new DemoFile(DemoSource.REPLAY, 36126255, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 269884221 });
const deadlockReplay36126420 = new DemoFile(DemoSource.REPLAY, 36126420, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 257181891 });
const deadlockReplay36126460 = new DemoFile(DemoSource.REPLAY, 36126460, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 299490688 });
const deadlockReplay36126674 = new DemoFile(DemoSource.REPLAY, 36126674, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 217341864 });
const deadlockReplay36126684 = new DemoFile(DemoSource.REPLAY, 36126684, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 250017427 });
const deadlockReplay36126738 = new DemoFile(DemoSource.REPLAY, 36126738, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 260145008 });
const deadlockReplay36126858 = new DemoFile(DemoSource.REPLAY, 36126858, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 261479442 });
const deadlockReplay36127043 = new DemoFile(DemoSource.REPLAY, 36127043, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 299979394 });
const deadlockReplay36127052 = new DemoFile(DemoSource.REPLAY, 36127052, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 255258797 });
const deadlockReplay36127128 = new DemoFile(DemoSource.REPLAY, 36127128, Game.DEADLOCK, 5637, { date: '2025-05-22', size: 229415823 });
const deadlockReplay36437939 = new DemoFile(DemoSource.REPLAY, 36437939, Game.DEADLOCK, 5654, { date: '2025-05-22', size: 239937066 });
const deadlockReplay37289286 = new DemoFile(DemoSource.REPLAY, 37289286, Game.DEADLOCK, 5678, { date: '2025-06-24', size: 354034470 });
const deadlockReplay37289347 = new DemoFile(DemoSource.REPLAY, 37289347, Game.DEADLOCK, 5678, { date: '2025-06-24', size: 347664133 });
const deadlockReplay37554876 = new DemoFile(DemoSource.REPLAY, 37554876, Game.DEADLOCK, 5681, { date: '2025-07-03', size: 461874243 });
const deadlockReplay37610767 = new DemoFile(DemoSource.REPLAY, 37610767, Game.DEADLOCK, 5691, { date: '2025-07-05', size: 408097454 });
const deadlockReplay38284967 = new DemoFile(DemoSource.REPLAY, 38284967, Game.DEADLOCK, 5701, { date: '2025-07-28', size: 364823092 });
const deadlockReplay38571265 = new DemoFile(DemoSource.REPLAY, 38571265, Game.DEADLOCK, 5716, { date: '2025-08-06', size: 442211704 });
const deadlockReplay38625795 = new DemoFile(DemoSource.REPLAY, 38625795, Game.DEADLOCK, 5716, { date: '2025-08-08', size: 407791942 });
const deadlockBroadcast38625795 = new DemoFile(DemoSource.HTTP_BROADCAST, 38625795, Game.DEADLOCK, 5716, { date: '2025-08-08', size: 407035300 });
const deadlockReplay38969017 = new DemoFile(DemoSource.REPLAY, 38969017, Game.DEADLOCK, 5768, { date: '2025-08-19', size: 406615977 });
const deadlockReplay40637165 = new DemoFile(DemoSource.REPLAY, 40637165, Game.DEADLOCK, 5888, { date: '2025-09-01', size: 426624798 });
const deadlockReplay48960058 = new DemoFile(DemoSource.REPLAY, 48960058, Game.DEADLOCK, 6023, { date: '2025-12-14', size: 423099020 });
const deadlockReplay51541751 = new DemoFile(DemoSource.REPLAY, 51541751, Game.DEADLOCK, 6140, { date: '2026-01-23', size: 420137829 });
const deadlockReplay51541762 = new DemoFile(DemoSource.REPLAY, 51541762, Game.DEADLOCK, 6140, { date: '2026-01-23', size: 556889541 });
const deadlockReplay51543455 = new DemoFile(DemoSource.REPLAY, 51543455, Game.DEADLOCK, 6140, { date: '2026-01-23', mode: 'Street Brawl', size: 132056956 });
const deadlockReplay51544119 = new DemoFile(DemoSource.REPLAY, 51544119, Game.DEADLOCK, 6140, { date: '2026-01-23', mode: 'Street Brawl', size: 104331564 });
const deadlockReplay75438101 = new DemoFile(DemoSource.REPLAY, 75438101, Game.DEADLOCK, 6448, { date: '2026-04-13', size: 501038364 });
const deadlockReplay75439032 = new DemoFile(DemoSource.REPLAY, 75439032, Game.DEADLOCK, 6448, { date: '2026-04-13', mode: 'Street Brawl', size: 143222996 });

// === DOTA2 ===
const dota2Replay8773493455 = new DemoFile(DemoSource.REPLAY, 8773493455, Game.DOTA2, null, { date: '2026-04-13', size: 77016661 });
const dota2Replay8777738576 = new DemoFile(DemoSource.REPLAY, 8777738576, Game.DOTA2, null, { date: '2026-04-19', size: 138711012 });

/**
 * @typedef {{ date?: string, mode?: string, size?: number }} metaObject
 */

export default DemoFile;
