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
