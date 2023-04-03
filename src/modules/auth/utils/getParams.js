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
