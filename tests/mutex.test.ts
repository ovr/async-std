import test from "ava";
import {Mutex} from "../src";

test('mutex', async (t) => {
    t.timeout(2000);

    const semaphore = new Mutex();

    let done: boolean = false;

    await semaphore.execute<void>(async () => {
        done = true;
    });

    t.true(done, 'done must be true');
});
