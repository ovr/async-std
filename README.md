async-std
=========

> Modern package with utilities for concurrency programming on nodejs 

# Semaphore

> Helps to limit simultaneous access to a resource.

```javascript
import {Semaphore} from 'async-std';

const semaphore = new Semaphore(1);

await semaphore.execute(async () => {
    // work
})
```

# Mutex

> Mutex is a special case of Semaphore with capacity = 1.

```javascript
import {Mutex} from 'async-std';

const lock = new Mutex();

lock.execute(async () => {
    // work
});

// wait when lock will be release
await lock.drain();
```

# AsyncWorkerPool

> Pool of workers to execute code concurrency with limit of concurrent operations at once.

```javascript
import {AsyncWorkerPool} from 'async-std';

const pool = new AsyncWorkerPool(
    async (payload: { id: number }) => {
        // some work
    },
    // how many workers will be runned concurently
    1
);

pool.execute({ id: 5 });

// wait when all tasks will be executed
await pool.drain();
```

# AsyncRateLimitWorkerPool

> Pool of workers to execute code concurrency with limit of concurrent operations at one time period (N executes in X time window).

```javascript
import {AsyncRateLimitWorkerPool} from 'async-std';

const pool = new AsyncRateLimitWorkerPool(
    async (payload: { id: number }) => {
        // some work
    },
    // how many workers will be runned concurently
    5,
    // 5 jobs will be executed every 1 second
    1000
);

pool.execute({ id: 5 });

// wait when all tasks will be executed
await pool.drain();
```

# AsyncQueue

> Sometimes it's needed to control the limits of tasks that will be executed by pools of workers. FIFO (first-in-first-out)

```javascript
import {AsyncQueue, AsyncWorkerPool} from 'async-std';

const pool = new AsyncWorkerPool(
    async (payload: { id: number }) => {
        // some work
    },
    // how many workers will be runned concurently
    1
);

const queue = new AsyncQueue(pool, 100);

// Resolve promise that put task in queue that will be resolved by pool of workers
await pool.push({ id: 5 });

// wait when all tasks will be executed
await pool.drain();
```

# AsyncStack

> Similar as AsyncQueue but it's FILO (first-in-last-out)

```javascript
import {AsyncStack, AsyncWorkerPool} from 'async-std';

const pool = new AsyncWorkerPool(
    async (payload: { id: number }) => {
        // some work
    },
    // how many workers will be runned concurently
    1
);

const queue = new AsyncStack(pool, 100);

// Resolve promise that put task in queue that will be resolved by pool of workers
await pool.push({ id: 5 });

// wait when all tasks will be executed
await pool.drain();
```

# Helpers

## asyncInterval

> Execute function periodically (interval) before it will return value !== false

```javascript
await asyncInterval(
    async () => {
        const user = await myawesomefn();
        if (user) {
            // doing somethings

            return user;
        }

        // return false to retry it
        return false;
    },
    100
)
```

## retry

> Retry function on exception

```javascript
await retry(
    async () => {
        //
    },
    {
        // retry 3 times on exceptions
        retriesMax: 3,
    }
)
```

## createPromiseLock

> Lock execution context in place by promise and ability to resolve this lock.

```javascript
import {createPromiseLock, PromiseLock} from 'async-std';

class Execute {
    protected readonly lock: PromiseLock = createPromiseLock();

    async function execute()
    {
        process.on('SIGTERM', async () => {
            console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());

            this.lock.resolve();
        })
        
        await this.lock.promise;
    }
}
```

### LICENSE

This project is open-sourced software licensed under the MIT License.

See the [LICENSE](LICENSE) file for more information.
