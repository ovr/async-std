import {AsyncWorker, AsyncWorkerPool} from "./pool";
import {InvalidArgumentException} from "./errors";
import {Semaphore} from "./semaphore";

export type AsyncQueueItem<P> = P[];
export type AsyncQueueWorker<P, R> = AsyncWorker<P, R> | AsyncWorkerPool<P, R>;

export class AsyncQueue<P, R = any> {
    protected readonly pool: AsyncWorkerPool<P, R>;
    protected readonly queue: AsyncQueueItem<P> = [];
    protected readonly semaphore: Semaphore;
    protected working: boolean = false;

    constructor(
        readonly worker: AsyncQueueWorker<P, R>,
        protected readonly limit: number
    ) {
        if (this.limit <= 0) {
            throw new InvalidArgumentException(`Invalid argument, limit must be a positive integer`);
        }

        if (worker instanceof AsyncWorkerPool) {
            this.pool = worker;
        } else {
            this.pool = new AsyncWorkerPool<P, R>(worker, 1);
        }

        this.semaphore = new Semaphore(limit);
    }

    public async push(task: P)
    {
        return this.semaphore.execute(
            async () => {
                return this.pool.execute(task);
            }
        );
    }

    public async drain()
    {
        return this.semaphore.drain();
    }
}

