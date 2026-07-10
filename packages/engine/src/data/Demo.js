import Assert from '#core/Assert.js';

import Class from './Class.js';
import ClassBaseline from './ClassBaseline.js';
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
     */
    constructor() {
        this._classBaselines = new Map();

        this._classes = {
            byId: new Map(),
            byName: new Map()
        };
        
        this._entities = {
            byIndex: [ ],
            byClassName: new Map(),
            count: 0
        };

        this._serializers = new Map();
        this._server = null;

        this._stringTableContainer = new StringTableContainer();

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

        const entity = this._entities.byIndex[index];

        if (entity === undefined) {
            return null;
        }

        this._entities.byIndex[index] = undefined;
        this._entities.count--;

        this._removeEntityFromClassIndex(entity);

        return entity;
    }

    /**
     * @public
     * @param {number} id
     * @returns {ClassBaseline|null}
     */
    getClassBaseline(id) {
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
     * @returns {IterableIterator<Class>}
     */
    getClassIterator() {
        return this._classes.byId.values();
    }

    /**
     * @public
     * @returns {Array<Entity>}
     */
    getEntities() {
        return Array.from(this.getEntityIterator());
    }

    /**
     * @public
     * @param {string} className
     * @returns {Array<Entity>}
     */
    getEntitiesByClassName(className) {
        const entities = this._entities.byClassName.get(className) || EMPTY_ENTITY_SET;

        return Array.from(entities.values());
    }

    /**
     * @public
     * @param {string} className
     * @returns {IterableIterator<Entity>}
     */
    getEntitiesByClassNameIterator(className) {
        const entities = this._entities.byClassName.get(className) || EMPTY_ENTITY_SET;

        return entities.values();
    }

    /**
     * @public
     * @param {number} index
     * @returns {Entity|null}
     */
    getEntity(index) {
        Assert.isTrue(Number.isInteger(index));

        return this._entities.byIndex[index] || null;
    }

    /**
     * @public
     * @param {number} handle
     * @returns {Entity|null}
     */
    getEntityByHandle(handle) {
        Assert.isTrue(Number.isInteger(handle));

        const entity = this._entities.byIndex[handle & Entity.INDEX_MASK] || null;

        if (entity === null || entity.handle !== handle) {
            return null;
        }

        return entity;
    }

    /**
     * Iterates live entities in ascending index order, skipping freed slots.
     *
     * @public
     * @returns {IterableIterator<Entity>}
     */
    * getEntityIterator() {
        const byIndex = this._entities.byIndex;

        for (let i = 0; i < byIndex.length; i++) {
            const entity = byIndex[i];

            if (entity !== undefined) {
                yield entity;
            }
        }
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
     * @returns {{ classBaselines: number, classes: number, entities: number, serializers: number }} 
     */
    getStats() {
        return {
            classBaselines: this._classBaselines.size,
            classes: this._classes.byId.size,
            entities: this._entities.count,
            serializers: this._serializers.size
        };
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

        const previous = this._entities.byIndex[entity.index] ?? null;

        if (previous !== null) {
            this._removeEntityFromClassIndex(previous);
        } else {
            this._entities.count++;
        }

        this._entities.byIndex[entity.index] = entity;
        this._addEntityToClassIndex(entity);
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
     * Resets all state to its initial values.
     *
     * @public
     */
    reset() {
        this._classBaselines.clear();
        this._classes.byId.clear();
        this._classes.byName.clear();
        this._entities.byClassName.clear();
        this._entities.byIndex.length = 0;
        this._entities.count = 0;
        this._serializers.clear();
        this._server = null;
        this._stringTableContainer.clear();
    }

    /**
     * @private
     * @param {Entity} entity
     */
    _addEntityToClassIndex(entity) {
        let entities = this._entities.byClassName.get(entity.class.name) || null;

        if (entities === null) {
            entities = new Set();

            this._entities.byClassName.set(entity.class.name, entities);
        }

        entities.add(entity);
    }

    /**
     * @protected
     * @param {StringTableContainer} stringTableContainer
     * @param {StringTable} stringTable
     * @param {Array<StringTableEntry>} entries — the affected entries only
     */
    _handleTableChanged(stringTableContainer, stringTable, entries) {
        switch (stringTable.type) {
            case StringTableType.INSTANCE_BASE_LINE: {
                entries.forEach((entry) => {
                    const classId = parseInt(entry.key);

                    if (Number.isNaN(classId)) {
                        throw new Error(`Unexpected classId [ ${entry.key} ] for table [ ${stringTable.type.code} ]`);
                    }

                    this._registerClassBaseline(classId, entry.value);
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
     * @param {StringTableContainer} stringTableContainer
     * @param {StringTable} stringTable
     */
    _handleTableRemoved(stringTableContainer, stringTable) {
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

    /**
     * @protected
     * @param {number} classId
     * @param {Uint8Array|null} raw
     */
    _registerClassBaseline(classId, raw) {
        const incoming = new ClassBaseline(classId, raw);
        const existing = this._classBaselines.get(classId) || null;

        if (existing !== null && existing.compare(incoming)) {
            return;
        }

        this._classBaselines.set(classId, incoming);
    }

    /**
     * @private
     * @param {Entity} entity
     */
    _removeEntityFromClassIndex(entity) {
        const entities = this._entities.byClassName.get(entity.class.name) || null;

        if (entities === null) {
            return;
        }

        entities.delete(entity);

        if (entities.size === 0) {
            this._entities.byClassName.delete(entity.class.name);
        }
    }
}

const EMPTY_ENTITY_SET = new Set();

export default Demo;
