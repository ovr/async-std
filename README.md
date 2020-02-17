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

# Pool

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

### LICENSE

This project is open-sourced software licensed under the MIT License.

See the [LICENSE](LICENSE) file for more information.
