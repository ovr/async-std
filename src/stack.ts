import {AsyncQueue} from "./queue";

export class AsyncStack<P, R = any> extends AsyncQueue<P, R> {
    protected next = () => this.queue.pop();
}
