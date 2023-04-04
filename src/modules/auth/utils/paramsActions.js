export const getParams = (param) => {
	let parameter = undefined;
	const i = window.location.hash.indexOf('?');
	if (i > -1) {
		const qs = window.location.hash.substring(i+1);
		const params = new URLSearchParams(qs);
		parameter = params.get(param);
	}
	return parameter;
}

export const removeParams = (param) => {
	const i = window.location.hash.indexOf('?');
	if (i > -1) {
		const qs = window.location.hash.substring(i+1);
		const params = new URLSearchParams(qs);
		params.delete(param);
		const newHash = params.toString();
		window.location.hash = newHash;
		return true;
	}
	return false;
}
