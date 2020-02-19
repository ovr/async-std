import {AsyncWorker, AsyncWorkerPool} from "./pool";
import {asyncInterval} from "./timers";

export class AsyncRateLimitWorkerPool<P, R = any> extends AsyncWorkerPool<P, R> {
    protected isProcessing: boolean = false;

    constructor(
        worker: AsyncWorker<P, R>,
        num: number,
        protected readonly time: number
    ) {
        super(worker, num);
    }

    public async execute(payload: P): Promise<R>
    {
        await this.semaphore.acquire();

        this.process();

        return await this.worker(payload);
    }

    protected process()
    {
        if (this.isProcessing) {
            return false;
        }

        this.isProcessing = true;

        asyncInterval(
            async () => {
                this.semaphore.releaseAll();

                const isFree = this.semaphore.isFree();
                if (isFree) {
                    this.isProcessing = false;
                }
            },
            this.time
        );
    }
}
