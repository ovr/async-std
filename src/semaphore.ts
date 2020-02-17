
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
            const nexResolver = this.queue.shift();
            if (nexResolver) {
                nexResolver(true);
            }
        }
    }

    public async drain(): Promise<boolean>
    {
        const free = await this.checkDrain();
        if (free) {
            return true;
        }

        return new Promise(
            (resolve => {
                setTimeout(
                    async () => {
                        const free = this.checkDrain();
                        if (free) {
                            resolve(true);
                        }
                    },
                    100
                );
            })
        )
    }

    protected async checkDrain()
    {
        const left = this.num - this.permits;

        console.log('drain', {
            left,
            num: this.num,
            permits: this.permits
        });

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
            return func();
        } finally {
            this.release();
        }
    }
}
