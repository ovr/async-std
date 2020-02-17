import {Semaphore} from "./semaphore";

export type AsyncWorker<P, R> = (task: P) => Promise<R>;

export class AsyncWorkerPool<P, R = any> {
    protected readonly semaphore: Semaphore;

    constructor(
        protected readonly worker: AsyncWorker<P, R>,
        num: number
    ) {
        this.semaphore = new Semaphore(num);
    }

    public async execute(payload: P): Promise<R>
    {
        return await this.semaphore.execute(() => {
            return this.worker(payload);
        });
    }

    /**
     * Wait when all tasks will be executed
     */
    public async drain(): Promise<boolean>
    {
        return this.semaphore.drain();
    }
}
