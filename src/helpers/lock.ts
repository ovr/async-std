export type PromiseLock = {
    promise: Promise<void>,
    resolve: () => void,
};

export function createPromiseLock(): PromiseLock {
    let resolve: any = null;

    return {
        promise: new Promise<void>((resolver) => {
            resolve = resolver
        }),
        resolve: () => {
            resolve();
        }
    }
}
