export { assert, $, $$ };

const assert: (statement: unknown, msg: string) => asserts statement = (statement, message) => {
    if (!statement) throw new Error(message);
};

const $ = <T extends typeof Element>(
    selector: string,
    type: T,
    scope: Element | Document = document,
): InstanceType<T> => {
    const element = scope.querySelector(selector);

    assert(element instanceof type, `Selector "${selector}" didn't match any elements`);

    return element as InstanceType<T>;
};

const $$ = <T extends typeof Element>(
    selector: string,
    type: T,
    scope: Element | Document = document,
): ReadonlyArray<InstanceType<T>> => {
    const element = scope.querySelectorAll(selector);

    return Array.from(element).filter((element) => element instanceof type) as InstanceType<T>[];
};
