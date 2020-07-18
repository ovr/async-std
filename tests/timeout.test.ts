import test from "ava";
import {asyncTimeout, Mutex} from "../src";
import {TimeoutException} from "../src/errors";

test('timeout with timeout', async (t) => {
    t.timeout(2000);

    let done: boolean = false;

    await t.throwsAsync(async () => {
        await asyncTimeout(
            250,
            new Promise(
                (resolve) => {
                    setTimeout(
                        () => {
                            done = true;

                            resolve();
                        },
                        500
                    );
                }
            ),
        );
    }, {
        instanceOf: TimeoutException,
        message: 'Timeout reached after 250ms',
    })

    t.false(done, 'done must be false');
});


test('timeout without timeout', async (t) => {
    t.timeout(2000);

    let done: boolean = false;

    await asyncTimeout(
        500,
        new Promise(
            (resolve) => {
                setTimeout(
                    () => {
                        done = true;

                        resolve();
                    },
                    250
                );
            }
        ),
    );

    t.true(done, 'done must be true');
});
