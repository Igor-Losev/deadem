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

const replay35244871 = new DemoFile(DemoSource.REPLAY, 35244871, null, null);
const replay36126255 = new DemoFile(DemoSource.REPLAY, 36126255, 5637, { date: '2025-05-22' });
const replay36126420 = new DemoFile(DemoSource.REPLAY, 36126420, 5637, { date: '2025-05-22' });
const replay36126460 = new DemoFile(DemoSource.REPLAY, 36126460, 5637, { date: '2025-05-22' });
const replay36126674 = new DemoFile(DemoSource.REPLAY, 36126674, 5637, { date: '2025-05-22' });
const replay36126684 = new DemoFile(DemoSource.REPLAY, 36126684, 5637, { date: '2025-05-22' });
const replay36126738 = new DemoFile(DemoSource.REPLAY, 36126738, 5637, { date: '2025-05-22' });
const replay36126858 = new DemoFile(DemoSource.REPLAY, 36126858, 5637, { date: '2025-05-22' });
const replay36127043 = new DemoFile(DemoSource.REPLAY, 36127043, 5637, { date: '2025-05-22' });
const replay36127052 = new DemoFile(DemoSource.REPLAY, 36127052, 5637, { date: '2025-05-22' });
const replay36127128 = new DemoFile(DemoSource.REPLAY, 36127128, 5637, { date: '2025-05-22' });
const replay36437939 = new DemoFile(DemoSource.REPLAY, 36437939, 5654, { date: '2025-05-22' });
const replay37289286 = new DemoFile(DemoSource.REPLAY, 37289286, 5678, { date: '2025-06-24' });
const replay37289347 = new DemoFile(DemoSource.REPLAY, 37289347, 5678, { date: '2025-06-24' });
const replay37554876 = new DemoFile(DemoSource.REPLAY, 37554876, 5681, { date: '2025-07-03' });
const replay37610767 = new DemoFile(DemoSource.REPLAY, 37610767, 5691, { date: '2025-07-05' });
const replay38284967 = new DemoFile(DemoSource.REPLAY, 38284967, 5701, { date: '2025-07-28' });
const replay38571265 = new DemoFile(DemoSource.REPLAY, 38571265, 5716, { date: '2025-08-06' });
const replay38625795 = new DemoFile(DemoSource.REPLAY, 38625795, 5716, { date: '2025-08-08' });
const broadcast38625795 = new DemoFile(DemoSource.HTTP_BROADCAST, 38625795, 5716, { date: '2025-08-08' });
const replay38969017 = new DemoFile(DemoSource.REPLAY, 38969017, 5768, { date: '2025-08-19' });
const replay40637165 = new DemoFile(DemoSource.REPLAY, 40637165, 5888, { date: '2025-09-01' });
const replay48960058 = new DemoFile(DemoSource.REPLAY, 48960058, 6023, { date: '2025-12-14' });

/**
 * @typedef {{ date: string }} metaObject
 */ 

export default DemoFile;
