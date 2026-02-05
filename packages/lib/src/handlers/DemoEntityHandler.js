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
                case EntityOperation.UPDATE:
                    if (!entity.active) {
                        entity.activate();
                    }

                    for (let j = 0; j < event.mutations.length; j++) {
                        const mutation = event.mutations[j];

                        entity.updateByFieldPath(mutation.fieldPath, mutation.value);
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
