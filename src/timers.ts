import {InvalidArgumentException} from "./errors";

export function asyncInterval<T>(fn: () => Promise<T|false>, timeout: number): Promise<T> {
    return new Promise<T>(
        (resolve) => {
            const intervalId = setInterval(
                async () => {
                    const result = await fn();
                    if (result !== false) {
                        if (intervalId) {
                            clearInterval(intervalId);

                            resolve();
                        }
                    }
                },
                timeout
            );
        }
    )
}

export type RetryOptions = {
    retriesMax: number;
};

async function retryExecutor<T>(n: number, fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (n > options.retriesMax) {
            throw e;
        }

        return await retryExecutor(n++, fn, options);
    }
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    if (!options.retriesMax || options.retriesMax < 1) {
        throw new InvalidArgumentException('options.retriesMax must be a positive number and bigger then 0');
    }

    return retryExecutor(0, fn, options);
}
