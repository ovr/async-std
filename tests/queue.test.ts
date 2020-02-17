import test from "ava";
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

    const update = new AsyncQueue(
        new AsyncWorkerPool(
            async (payload: number) => {
                console.log('update execute', payload);
                started++;

                return new Promise(
                    (resolver) => {
                        console.log('update executed', payload);
                        resolved++;

                        setTimeout(
                            () => {
                                resolver();
                            },
                            50
                        );
                    }
                )
            },
            1,
        ),
        10
    );

    const fetch = new AsyncQueue(
        new AsyncWorkerPool(
            async (payload: number) => {
                console.log('fetch execute', payload);

                return new Promise(
                    (resolver) => {
                        console.log('fetch executed', payload);

                        setTimeout(
                            async () => {
                                await update.push(payload);

                                resolver();
                            },
                            50
                        );
                    }
                )
            },
            5,
        ),
        10
    );

    for (let i = 0; i < 100; i++) {
        console.log({ started, resolved });
        console.log('async-queue', i);

        fetch.push(i);
    }

    await fetch.drain();
    await update.drain();

    t.is(started, 100);
    t.is(resolved, 100);
});
