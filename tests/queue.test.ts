import test from "ava";
import {Semaphore} from "../src/semaphore";
import {AsyncQueue} from "../src/queue";
import {AsyncWorkerPool} from "../src";


test('success queue with worker pool (sync)', async (t) => {
    let started = 0;
    let resolved = 0;

    const queue = new AsyncQueue(
        new AsyncWorkerPool(
            async (payload: number) => {
                started++;
                resolved++;
            },
            1,
        ),
        10
    );

    for (let i = 0; i < 100; i++) {
        console.log('sync-queue', i);
        await queue.push(i);
    }

    await queue.drain();

    t.is(started, 100);
    t.is(resolved, 100);
});

test('success queue with worker pool (timers)', async (t) => {
    let started = 0;
    let resolved = 0;

    const pool = new AsyncWorkerPool(
        async (payload: number) => {
            started++;

            return new Promise(
                (resolver) => {
                    resolved++;

                    setTimeout(
                        () => {
                            resolver();
                        },
                        250
                    );
                }
            )
        },
        1,
    );

    const queue = new AsyncQueue(
        pool,
        100
    );

    for (let i = 0; i < 100; i++) {
        console.log({ started, resolved });
        console.log('async-queue', i);
        await queue.push(i);
    }

    await queue.drain();

    t.is(started, 100);
    t.is(resolved, 100);
});
