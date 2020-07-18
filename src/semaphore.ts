import {asyncInterval} from "./timers";

export class Semaphore {
    protected readonly queue: ((value: boolean) => void)[] = [];

    protected permits: number;

    constructor(
        protected readonly num: number
    ) {
        this.permits = num;
    }

    public release(): void {
        this.permits++;

        if (this.permits > 0 && this.queue.length > 0) {
            this.runQueue();
        }
    }

    protected runQueue()
    {
        const nexResolver = this.queue.shift();
        if (nexResolver) {
            this.permits--;

            nexResolver(true);
            return true;
        }

        return false;
    }

    public releaseAllPermits(): void {
        this.permits = this.num;

        if (this.queue.length > 0) {
            while (this.permits > 0 && this.runQueue()) {}
        }
    }

    public releaseAll(): void {
        this.permits = this.num;

        if (this.queue.length > 0) {
            while (this.runQueue()) {}
        }
    }

    public async drain(): Promise<boolean>
    {
        const free = this.isFree();
        if (free) {
            return true;
        }

        return asyncInterval(async () => this.isFree(), 100);
    }

    public getFreePermits(): number
    {
        return this.num - this.permits;
    }

    public isFree()
    {
        const left = this.num - this.permits;

        // It's the last task in queue
        if (left === 0 && this.queue.length === 0) {
            return true;
        }

        return false;
    }

    public acquire(): Promise<boolean> {
        if (this.permits > 0) {
            this.permits--;

            return Promise.resolve(true);
        }

        return new Promise<boolean>(
            (resolve) => {
                this.queue.push(resolve);
            }
        );
    }

    public async execute<T>(func: () => T | PromiseLike<T>): Promise<T> {
        await this.acquire();

        try {
            return await func();
        } finally {
            this.release();
        }
    }
}
