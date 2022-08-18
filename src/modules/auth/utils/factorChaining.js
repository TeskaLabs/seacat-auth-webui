export const factorChaining = (setup, redirect_uri, history) => {
	// Encode redirect URI because react decode encoded URL params behind the hash /#/?params=...
	const redirectUri = encodeURIComponent(redirect_uri);
	if (setup) {
		const factors = setup.split(" ");
		const factor = factors[0];

		switch (factor) {
			case "totp":
				redirect(history, factors, redirectUri, '/manage-totp');
				break ;
			case "smscode":
				redirect(history, factors, redirectUri, '/manage-number');
				break ;
			case "password":
				redirect(history, factors, redirectUri, '/change-password');
				break ;
			case "email":
				redirect(history, factors, redirectUri, '/manage-email');
				break ;
			default:
				return ;
		}
		// TODO: add more factors

	} else {
		// Redirect to the empty page screen with successful message
		history.push({
			pathname: '/finish-setup',
			search: `?setup_successful=true&redirect_uri=${redirectUri}`
		});
	}
}

const redirect = (history, factors, redirectUri, pathname) => {
	let setupFactors = factors.slice(1).join('+'); // Remove first item in array and join the rest into the string
	if (setupFactors.length !== 0) {
		history.push({
			pathname: pathname,
			search: `?setup=${setupFactors}&redirect_uri=${redirectUri}`
		});
	} else {
		history.push({
			pathname: pathname,
			search: `?redirect_uri=${redirectUri}`
		});
	}
}
