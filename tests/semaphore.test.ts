import test from "ava";
import {Semaphore} from "../src/semaphore";

test('success semaphores', async (t) => {
    t.timeout(2000);

    const semaphore = new Semaphore(1);

    let resolved = 0;

    t.assert(resolved === 0);

    const callbackTick = async () => new Promise<void>(
        (resolve) => {
            setImmediate(
                () => {
                    resolved++;

                    resolve();
                },
            )
        }
    );

    await semaphore.execute<void>(callbackTick);

    t.assert(resolved === 1, 'resolved must be 1');

    resolved = 0;

    await semaphore.execute<void>(async () => {
        resolved++;
    });
    await semaphore.execute<void>(async () => {
        resolved++;
    });
    await semaphore.execute<void>(async () => {
        resolved++;
    });

    t.assert(resolved === 3, 'resolved must be 3');

    resolved = 0;

    semaphore.execute<void>(async () => {
        resolved++;
    });
    semaphore.execute<void>(async () => {
        resolved++;
    });
    await semaphore.execute<void>(async () => {
        resolved++;
    });

    t.assert(resolved === 3, 'resolved must be 3');
});

test('success semaphores with drain', async (t) => {
    t.timeout(2000);

    const semaphore = new Semaphore(1);
    let resolved = 0;

    const callbackTick = async () => new Promise<void>(
        (resolve) => {
            setTimeout(
                () => {
                    resolved++;

                    resolve();
                },
            ),
            100
        }
    );

    resolved = 0;

    semaphore.execute<void>(async () => {
        console.log('semaphore 1');

        await callbackTick();
    });
    semaphore.execute<void>(async () => {
        console.log('semaphore 2');

        await callbackTick();
    });
    semaphore.execute<void>(async () => {
        console.log('semaphore 3');

        await callbackTick();
    });

    await semaphore.drain();

    t.assert(resolved === 3, 'resolved must be 3');
});
