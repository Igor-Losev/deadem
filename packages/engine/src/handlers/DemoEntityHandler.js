import Assert from '#core/Assert.js';

import Demo from '#data/Demo.js';

import EntityOperation from '#data/enums/EntityOperation.js';

class DemoEntityHandler {
    constructor(demo) {
        Assert.isTrue(demo instanceof Demo);

        this._demo = demo;
    }

    /**
     * @public
     * @param {Array<EntityMutationEvent>} events
     */
    handleEntityEvents(events) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const entity = event.entity;

            switch (event.operation) {
                case EntityOperation.CREATE:
                    this._demo.registerEntity(entity);

                    for (let i = 0; i < event.batch.length; i++) {
                        entity.updateByFieldPathId(event.batch.ids[i], event.batch.values[i]);
                    }

                    break;
                case EntityOperation.UPDATE:
                    if (!entity.active) {
                        entity.activate();
                    }

                    for (let i = 0; i < event.batch.length; i++) {
                        entity.updateByFieldPathId(event.batch.ids[i], event.batch.values[i]);
                    }

                    break;
                case EntityOperation.DELETE:
                    this._demo.deleteEntity(entity.index);

                    break;
                case EntityOperation.LEAVE:
                    entity.deactivate();

                    break;
            }
        }
    }
}

export default DemoEntityHandler;
