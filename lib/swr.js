class CachedResult {
	constructor(lifetime, value) {
		this.expiry = Date.now() + lifetime;
		this.value = value;
	}

	get isExpired() {
		return Date.now() > this.expiry;
	}
}

function swr(getter, lifetime) {
	let pendingResult;
	let currentResult;

	const revalidate = () => {
		return getter().then((value) => {
			const result = new CachedResult(lifetime, value);
			currentResult = Promise.resolve(result);
			pendingResult = null;
			return result;
		});
	};

	// Immediately call revalidate but *do not* await here.
	pendingResult = currentResult = revalidate();

	return async () => {
		// Await ensures we get a CachedResult.
		const result = await currentResult;

		// Only schedule another revalidate if one isn't already pending.
		if (result.isExpired && !pendingResult) {
			pendingResult = revalidate();
		}

		return result.value;
	};
}

module.exports = swr;
