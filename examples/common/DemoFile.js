const EXTENSION = '.dem';

const registry = new Map();

class DemoFile {
    /**
     * @constructor
     * @param {number} id
     * @param {String|null} [gameBuild=null]
     * @param {String|null} [date=null]
     */
    constructor(id, gameBuild = null, date = null) {
        this._id = id;
        this._gameBuild = gameBuild;
        this._date = date;

        registry.set(id, this);
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
     * @returns {String|null}
     */
    get gameBuild() {
        return this._gameBuild;
    }

    /**
     * @public
     * @returns {String|null}
     */
    get date() {
        return this._date;
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
     * @returns {DemoFile|null}
     */
    static parse(id) {
        return registry.get(id) || null;
    }

    static get MATCH_35244871() { return match35244871; }
    static get MATCH_36126255() { return match36126255; }
    static get MATCH_36126420() { return match36126420; }
    static get MATCH_36126460() { return match36126460; }
    static get MATCH_36126674() { return match36126674; }
    static get MATCH_36126684() { return match36126684; }
    static get MATCH_36126738() { return match36126738; }
    static get MATCH_36126858() { return match36126858; }
    static get MATCH_36127043() { return match36127043; }
    static get MATCH_36127052() { return match36127052; }
    static get MATCH_36127128() { return match36127128; }
    static get MATCH_36437939() { return match36437939; }
    static get MATCH_37289286() { return match37289286; }
    static get MATCH_37289347() { return match37289347; }
    static get MATCH_37554876() { return match37554876; }
    static get MATCH_37610767() { return match37610767; }
    static get MATCH_38284967() { return match38284967; }

    /**
     * @public
     * @returns {`${string}.dem`}
     */
    getFileName() {
        let filename = this._id.toString();

        if (this._gameBuild !== null) {
            filename = `${filename}-${this._gameBuild}`;
        }

        filename = `${filename}${EXTENSION}`;

        return filename;
    }
}

const match35244871 = new DemoFile(35244871, null, null);
const match36126255 = new DemoFile(36126255, '5637', '22-05-2025');
const match36126420 = new DemoFile(36126420, '5637', '22-05-2025');
const match36126460 = new DemoFile(36126460, '5637', '22-05-2025');
const match36126674 = new DemoFile(36126674, '5637', '22-05-2025');
const match36126684 = new DemoFile(36126684, '5637', '22-05-2025');
const match36126738 = new DemoFile(36126738, '5637', '22-05-2025');
const match36126858 = new DemoFile(36126858, '5637', '22-05-2025');
const match36127043 = new DemoFile(36127043, '5637', '22-05-2025');
const match36127052 = new DemoFile(36127052, '5637', '22-05-2025');
const match36127128 = new DemoFile(36127128, '5637', '22-05-2025');
const match36437939 = new DemoFile(36437939, '5654', '22-05-2025');
const match37289286 = new DemoFile(37289286, '5678', '24-06-2025');
const match37289347 = new DemoFile(37289347, '5678', '24-06-2025');
const match37554876 = new DemoFile(37554876, '5681', '03-07-2025');
const match37610767 = new DemoFile(37610767, '5691', '05-07-2025');
const match38284967 = new DemoFile(38284967, '5701', '28-07-2025');

export default DemoFile;
