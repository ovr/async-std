
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
