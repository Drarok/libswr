export type AsyncGetter<T> = () => Promise<T>;

declare function swr<T>(getter: AsyncGetter<T>, lifetime: number): AsyncGetter<T>;

export = swr;
