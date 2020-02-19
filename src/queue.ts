import {AsyncWorker, AsyncWorkerPool} from "./pool";
import {InvalidArgumentException} from "./errors";
import {Semaphore} from "./semaphore";
import {asyncInterval} from "./timers";

export type AsyncQueueItem<P> = P[];
export type AsyncQueueWorker<P, R> = AsyncWorker<P, R> | AsyncWorkerPool<P, R>;

export class AsyncQueue<P, R = any> {
    protected readonly pool: AsyncWorkerPool<P, R>;
    protected readonly queue: AsyncQueueItem<P> = [];
    protected readonly semaphore: Semaphore;

    protected isProcessing: boolean = false;

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

    protected next = () => this.queue.shift();

    protected process()
    {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        asyncInterval(
            async () => {
                const nextItem = this.next();
                if (nextItem !== undefined) {
                    try {
                        this.pool.execute(nextItem);
                    } finally {
                        this.semaphore.release();
                    }

                    if (this.queue || !this.semaphore.isFree()) {
                        return false;
                    }
                }

                this.isProcessing = false;

                return true;
            },
            50
        );
    }

    public async push(task: P)
    {
        await this.semaphore.acquire();

        this.queue.push(task);

        this.process();
    }

    public async drain()
    {
        this.process();

        return Promise.all([
            this.semaphore.drain(),
            this.pool.drain(),
        ]);
    }
}

