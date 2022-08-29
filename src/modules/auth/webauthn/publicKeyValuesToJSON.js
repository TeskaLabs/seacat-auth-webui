import base64url from '../utils/base64url';
// Function for parsing credentials to JSON
export default function publicKeyValuesToJSON(pubKeyCred) {
	if (pubKeyCred instanceof Array) {
		let arr = [];
		for (let i of pubKeyCred) arr.push(publicKeyValuesToJSON(i));

		return arr;
	}

	else if (pubKeyCred instanceof ArrayBuffer) {
		return base64url.encode(pubKeyCred);
	}

	else if (pubKeyCred instanceof Object) {
		let obj = {};

		for (let key in pubKeyCred) {
			obj[key] = publicKeyValuesToJSON(pubKeyCred[key]);
		}

		return obj;
	}

	return pubKeyCred;
}
