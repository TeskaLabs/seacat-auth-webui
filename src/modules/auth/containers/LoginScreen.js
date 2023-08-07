import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Container, Row, Col } from 'reactstrap';

import LoginCard from './LoginCard.js';
import RegistrationCard from './RegistrationCard.js';
import { getParams } from '../utils/paramsActions';
import generatePenrose from '../utils/generatePenrose.js';

function LoginScreen(props) {
	const { t } = useTranslation();
	const [features, setFeatures] = useState({ "login": {} });
	const [stateCode, setStateCode] = useState("");
	const SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');


	useEffect(() => {
		// Fetch features from the server
		fetchFeatures();
	}, []);

	useEffect(() => {
		if(features?.login?.external) {
			// Check status if external login failed
			checkExternalLoginStatus();
			// Extract redirect uri for external login redirections
			saveRedirectUri();
		}
	}, [features])

	generatePenrose()

	const checkExternalLoginStatus = () => {
		const err = getParams("error");
		if (err && err.indexOf("external_login_failed") !== -1) {
			props.app.addAlert("danger", t(
				"LoginScreen|Something went wrong. External login failed. You may have not connected your profile with external service. Try different sign in method"
			), 30);
		}
	}

	const saveRedirectUri = () => {
		const redirectUri = getParams("redirect_uri");

		if (redirectUri) {
			const expirationDate = Date.now() + 15 * 60 * 1000;
			const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 8); // generate random 16 symbol string
			localStorage.setItem("redirect_code", JSON.stringify({
				[code]: { redirectUri, expirationDate }
			}))
			setStateCode(code); // TODO: state code should be randomly generated (16 chars)
		}
	}

	function useWindowSize() {
		const [size, setSize] = useState([0, 0]);
		useLayoutEffect(() => {
		  function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		  }
		  window.addEventListener('resize', updateSize);
		  updateSize();
		  return () => window.removeEventListener('resize', updateSize);
		}, []);
		return size;
	}

	const fetchFeatures = async () => {
		try {
			const response = await SeaCatAuthAPI.get("/public/features");
			if (!response.data.login && !response.data.registration) return;

			setFeatures(response.data);
		} catch (e) {
			console.error("Failed to fetch external login services", e);
		}
	}

	return (
		<Container className="animated fadeIn">
			<Row className="justify-content-center">
				{("login" in features) && <Col md="6" className="mt-3">
					<LoginCard
						app={props.app}
						features={features["login"]}
						stateCode={stateCode}
					/>
				</Col>}
				{/*TODO: Self registration has not been fully implemented yet*/}
				{/*("registration" in features) && <Col md="5">
					<RegistrationCard app={props.app} features={features["registration"]} />
				</Col>*/}
			</Row>
		</Container>
	);

}

export default LoginScreen;
