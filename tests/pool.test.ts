import test from "ava";
import {Semaphore} from "../src/semaphore";
import {AsyncWorkerPool} from "../src";

test('success pool', async (t) => {
    t.timeout(2000);

    let resolved = 0;

    const pool = new AsyncWorkerPool(
        async (payload: number) => {
            resolved += payload;
        },
        1
    );

    for (let i = 0; i <= 100; i++) {
        await pool.execute(i);
    }

    t.is(resolved, 5050);
});

test('success pool with drain', async (t) => {
    t.timeout(2000);

    let resolved = 0;

    const pool = new AsyncWorkerPool(
        async (payload: number) => {
            resolved += payload;
        },
        1
    );

    for (let i = 0; i <= 100; i++) {
        pool.execute(i);
    }

    await pool.drain();
    console.log('resolved', resolved);

    t.is(resolved, 5050);
});

test('success pool (timers) with drain', async (t) => {
    t.timeout(2000);

    let resolved = 0;

    const pool = new AsyncWorkerPool(
        async (payload: number) => {
            return new Promise(
                (resolve) => {
                    setTimeout(
                        () => {
                            resolved += payload;

                            resolve();
                        },
                        50
                    );
                }
            )
        },
        1
    );

    for (let i = 0; i <= 100; i++) {
        pool.execute(i);
    }

    await pool.drain();
    console.log('resolved', resolved);

    t.is(resolved, 5050);
});
