const swr = require('./swr');

const sleep = (delay, value) => new Promise(resolve => setTimeout(() => resolve(value), delay));

const GETTER_LATENCY = 80; // Fake delay in ms for async getter
const SWR_LIFETIME = 100; // Time in ms to cache values

test('Basic assumptions', async () => {
	const mock = jest.fn(async () => sleep(GETTER_LATENCY, 1));
	const getter = swr(mock, SWR_LIFETIME);
	expect(typeof getter).toBe('function');
	expect(getter()).resolves.toBe(1);
});

test('End to end', async () => {
	// Fake async getter, returns consistent values on subsequent calls.
	const mock = jest
		.fn()
		.mockImplementation(() => sleep(GETTER_LATENCY, -1))
		.mockImplementationOnce(() => sleep(GETTER_LATENCY, 1))
		.mockImplementationOnce(() => sleep(GETTER_LATENCY, 2));

	// Wrapped stale-while-revalidate getter.
	const getter = swr(mock, SWR_LIFETIME);

	// Mock has been called, values are cached.
	expect(mock).toHaveBeenCalledTimes(1);
	expect(getter()).resolves.toBe(1);
	expect(getter()).resolves.toBe(1);

	// Wait plenty long enough for the cached item to expire.
	await sleep(SWR_LIFETIME * 2);

	// Mock still shouldn't have been called yet.
	expect(mock).toHaveBeenCalledTimes(1);

	 // First call will schedule an update but return stale value,
	 // subsequent calls will contine to receive the stale value.
	expect(getter()).resolves.toBe(1);
	expect(getter()).resolves.toBe(1);

	// We have to await here to let the microtasks in the library run.
	await sleep(0);

	// Mock should now have been called, but values should still be stale due to GETTER_LATENCY.
	expect(mock).toHaveBeenCalledTimes(2);
	expect(getter()).resolves.toBe(1);
	expect(getter()).resolves.toBe(1);

	// Wait plenty long enough for value to update.
	await sleep(GETTER_LATENCY * 2);

	// Further calls get the revalidated value.
	expect(getter()).resolves.toBe(2);
});
