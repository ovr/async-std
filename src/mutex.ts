import {Semaphore} from "./semaphore";

/**
 * A lock that can be used to synchronize critical sections in your code.
 */
export class Mutex extends Semaphore {
    constructor() {
        super(1);
    }
};
