import { DemoSource } from 'deadem';

import Assert from 'deadem/src/core/Assert.js';

const EXTENSION_BIN = '.bin';
const EXTENSION_DEM = '.dem';

const registry = new Map();
  
class DemoFile {
    /**
     * @constructor
     * @param {DemoSource} source
     * @param {number} id
     * @param {number|null} [gameBuild=null]
     * @param {metaObject|null} [meta=null]
     */
    constructor(source, id, gameBuild = null, meta = null) {
        Assert.isTrue(source instanceof DemoSource);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(gameBuild === null || Number.isInteger(gameBuild));

        this._id = id;
        this._gameBuild = gameBuild;
        this._source = source;
        this._meta = meta;

        const key = getKey(id, source);

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
     * @param {DemoSource} [source=DemoSource.REPLAY]
     * @returns {DemoFile|null}
     */
    static parse(id, source = DemoSource.REPLAY) {
        const key = getKey(id, source);
        
        return registry.get(key) || null;
    }

    static get REPLAY_35244871() { return replay35244871; }
    static get REPLAY_36126255() { return replay36126255; }
    static get REPLAY_36126420() { return replay36126420; }
    static get REPLAY_36126460() { return replay36126460; }
    static get REPLAY_36126674() { return replay36126674; }
    static get REPLAY_36126684() { return replay36126684; }
    static get REPLAY_36126738() { return replay36126738; }
    static get REPLAY_36126858() { return replay36126858; }
    static get REPLAY_36127043() { return replay36127043; }
    static get REPLAY_36127052() { return replay36127052; }
    static get REPLAY_36127128() { return replay36127128; }
    static get REPLAY_36437939() { return replay36437939; }
    static get REPLAY_37289286() { return replay37289286; }
    static get REPLAY_37289347() { return replay37289347; }
    static get REPLAY_37554876() { return replay37554876; }
    static get REPLAY_37610767() { return replay37610767; }
    static get REPLAY_38284967() { return replay38284967; }
    static get REPLAY_38571265() { return replay38571265; }
    static get REPLAY_38625795() { return replay38625795; }
    static get REPLAY_38969017() { return replay38969017; }
    static get REPLAY_40637165() { return replay40637165; }
    static get REPLAY_48960058() { return replay48960058; }
    static get REPLAY_51541751() { return replay51541751; }
    static get REPLAY_51541762() { return replay51541762; }
    static get REPLAY_51543455() { return replay51543455; }
    static get REPLAY_51544119() { return replay51544119; }
    static get BROADCAST_38625795() { return broadcast38625795; }

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

function getKey(id, source) {
    return `${id}-${source.code}`;
}

const replay35244871 = new DemoFile(DemoSource.REPLAY, 35244871, null, { size: 205924893 });
const replay36126255 = new DemoFile(DemoSource.REPLAY, 36126255, 5637, { date: '2025-05-22', size: 269884221 });
const replay36126420 = new DemoFile(DemoSource.REPLAY, 36126420, 5637, { date: '2025-05-22', size: 257181891 });
const replay36126460 = new DemoFile(DemoSource.REPLAY, 36126460, 5637, { date: '2025-05-22', size: 299490688 });
const replay36126674 = new DemoFile(DemoSource.REPLAY, 36126674, 5637, { date: '2025-05-22', size: 217341864 });
const replay36126684 = new DemoFile(DemoSource.REPLAY, 36126684, 5637, { date: '2025-05-22', size: 250017427 });
const replay36126738 = new DemoFile(DemoSource.REPLAY, 36126738, 5637, { date: '2025-05-22', size: 260145008 });
const replay36126858 = new DemoFile(DemoSource.REPLAY, 36126858, 5637, { date: '2025-05-22', size: 261479442 });
const replay36127043 = new DemoFile(DemoSource.REPLAY, 36127043, 5637, { date: '2025-05-22', size: 299979394 });
const replay36127052 = new DemoFile(DemoSource.REPLAY, 36127052, 5637, { date: '2025-05-22', size: 255258797 });
const replay36127128 = new DemoFile(DemoSource.REPLAY, 36127128, 5637, { date: '2025-05-22', size: 229415823 });
const replay36437939 = new DemoFile(DemoSource.REPLAY, 36437939, 5654, { date: '2025-05-22', size: 239937066 });
const replay37289286 = new DemoFile(DemoSource.REPLAY, 37289286, 5678, { date: '2025-06-24', size: 354034470 });
const replay37289347 = new DemoFile(DemoSource.REPLAY, 37289347, 5678, { date: '2025-06-24', size: 347664133 });
const replay37554876 = new DemoFile(DemoSource.REPLAY, 37554876, 5681, { date: '2025-07-03', size: 461874243 });
const replay37610767 = new DemoFile(DemoSource.REPLAY, 37610767, 5691, { date: '2025-07-05', size: 408097454 });
const replay38284967 = new DemoFile(DemoSource.REPLAY, 38284967, 5701, { date: '2025-07-28', size: 364823092 });
const replay38571265 = new DemoFile(DemoSource.REPLAY, 38571265, 5716, { date: '2025-08-06', size: 442211704 });
const replay38625795 = new DemoFile(DemoSource.REPLAY, 38625795, 5716, { date: '2025-08-08', size: 407791942 });
const broadcast38625795 = new DemoFile(DemoSource.HTTP_BROADCAST, 38625795, 5716, { date: '2025-08-08', size: 407035300 });
const replay38969017 = new DemoFile(DemoSource.REPLAY, 38969017, 5768, { date: '2025-08-19', size: 406615977 });
const replay40637165 = new DemoFile(DemoSource.REPLAY, 40637165, 5888, { date: '2025-09-01', size: 426624798 });
const replay48960058 = new DemoFile(DemoSource.REPLAY, 48960058, 6023, { date: '2025-12-14', size: 423099020 });
const replay51541751 = new DemoFile(DemoSource.REPLAY, 51541751, 6140, { date: '2026-01-23', size: 420137829 });
const replay51541762 = new DemoFile(DemoSource.REPLAY, 51541762, 6140, { date: '2026-01-23', size: 556889541 });
const replay51543455 = new DemoFile(DemoSource.REPLAY, 51543455, 6140, { date: '2026-01-23', mode: 'Street Brawl', size: 132056956 });
const replay51544119 = new DemoFile(DemoSource.REPLAY, 51544119, 6140, { date: '2026-01-23', mode: 'Street Brawl', size: 104331564 });

/**
 * @typedef {{ date?: string, mode?: string, size?: number }} metaObject
 */ 

export default DemoFile;
