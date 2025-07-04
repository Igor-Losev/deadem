import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';

import Class from './Class.js';
import Server from './Server.js';

import Entity from './entity/Entity.js';

import StringTableEvent from './enums/StringTableEvent.js';
import StringTableType from './enums/StringTableType.js';

import Serializer from './fields/Serializer.js';
import SerializerKey from './fields/SerializerKey.js';

import StringTableContainer from './tables/string/StringTableContainer.js';

class Demo {
    /**
     * @public
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger = Logger.CONSOLE_INFO) {
        Assert.isTrue(logger instanceof Logger);

        this._classBaselines = new Map();

        this._classes = {
            byId: new Map(),
            byName: new Map()
        };

        this._entities = new Map();

        this._serializers = new Map();
        this._server = null;

        this._stringTableContainer = new StringTableContainer(logger);

        this._stringTableContainer.subscribe(StringTableEvent.TABLE_CHANGED, this._handleTableChanged.bind(this));
        this._stringTableContainer.subscribe(StringTableEvent.TABLE_REMOVED, this._handleTableRemoved.bind(this));
    }

    /**
     * @public
     * @returns {Server|null}
     */
    get server() {
        return this._server;
    }

    /**
     * @public
     * @returns {StringTableContainer}
     */
    get stringTableContainer() {
        return this._stringTableContainer;
    }

    /**
     * @public
     * @param {number} index
     * @returns {Entity|null}
     */
    deleteEntity(index) {
        Assert.isTrue(Number.isInteger(index));

        const entity = this._entities.get(index) || null;

        if (entity !== null) {
            this._entities.delete(index);
        }

        return entity;
    }

    /**
     * @public
     * @param {number} id
     * @returns {Buffer|null}
     */
    getClassBaselineById(id) {
        Assert.isTrue(Number.isInteger(id));

        return this._classBaselines.get(id) || null;
    }

    /**
     * @public
     * @param {number} id
     * @returns {Class|null}
     */
    getClassById(id) {
        Assert.isTrue(Number.isInteger(id));

        return this._classes.byId.get(id) || null;
    }

    /**
     * @public
     * @param {String} name
     * @returns {Class|null}
     */
    getClassByName(name) {
        Assert.isTrue(typeof name === 'string' && name.length > 0);

        return this._classes.byName.get(name) || null;
    }

    /**
     * @public
     * @returns {Array<Class>}
     */
    getClasses() {
        return Array.from(this._classes.byId.values());
    }

    /**
     * @public
     * @returns {Array<Entity>}
     */
    getEntities() {
        return Array.from(this._entities.values());
    }

    /**
     * @public
     * @param {number} index
     * @returns {Entity|null}
     */
    getEntity(index) {
        Assert.isTrue(Number.isInteger(index));

        return this._entities.get(index) || null;
    }

    /**
     * @public
     * @param {number} handle
     * @returns {Entity|null}
     */
    getEntityByHandle(handle) {
        Assert.isTrue(Number.isInteger(handle));

        return this._entities.get(handle & 0x3FFF) || null;
    }

    /**
     * @public
     * @param {SerializerKey} key
     * @returns {Serializer|null}
     */
    getSerializerByKey(key) {
        Assert.isTrue(key instanceof SerializerKey);

        return this._serializers.get(key.toString()) || null;
    }

    /**
     * @public
     * @param {Class} clazz
     */
    registerClass(clazz) {
        Assert.isTrue(clazz instanceof Class);

        this._classes.byId.set(clazz.id, clazz);
        this._classes.byName.set(clazz.name, clazz);
    }

    /**
     * @public
     * @param {Entity} entity
     */
    registerEntity(entity) {
        Assert.isTrue(entity instanceof Entity);

        this._entities.set(entity.index, entity);
    }

    /**
     * @public
     * @param {Serializer} serializer
     */
    registerSerializer(serializer) {
        Assert.isTrue(serializer instanceof Serializer);

        this._serializers.set(serializer.key.toString(), serializer);
    }

    /**
     * @public
     * @param {Server} server
     */
    registerServer(server) {
        Assert.isTrue(server instanceof Server);

        this._server = server;
    }

    /**
     * @protected
     * @param {StringTable} stringTable
     */
    _handleTableChanged(stringTable) {
        switch (stringTable.type) {
            case StringTableType.INSTANCE_BASE_LINE: {
                const entries = stringTable.getEntries();

                entries.forEach((entry) => {
                    const key = parseInt(entry.key);

                    if (Number.isNaN(key)) {
                        throw new Error(`Unexpected key [ ${entry.key} ] for table [ ${stringTable.type.code} ]`);
                    }

                    this._classBaselines.set(key, entry.value);
                });

                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * @protected
     * @param {StringTable} stringTable
     */
    _handleTableRemoved(stringTable) {
        switch (stringTable.type) {
            case StringTableType.INSTANCE_BASE_LINE: {
                this._classBaselines.clear();

                break;
            }
            default: {
                break;
            }
        }
    }
}

export default Demo;
