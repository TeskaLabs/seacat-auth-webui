import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Container, Row, Col, Card, CardBody } from 'reactstrap';

import LoginCard from './LoginCard.js';
import RegistrationCard from './RegistrationCard.js';
import SwitchAccountCard from './SwitchAccountCard.js';
import JoinCard from './JoinCard.js';

function RegisterScreen(props) {
	const { t } = useTranslation();
	const [features, setFeatures] = useState({ "login": {} });
	const [registerFeatures, setRegisterFeatures] = useState({});
	const [width, height] = useWindowSize();
	const [stateCode, setStateCode] = useState("");
	const [credentials, setCredentials] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');
	const userinfo = useSelector(state => state.auth.userinfo);


	useEffect(() => {
		fetchRegisterFeatures();
		// Fetch features from the server
		fetchFeatures();
		// Check status if external login failed
		checkExternalLoginStatus();
		// Extract redirect uri for external login redirections
		saveRedirectUri();
		// Get the user credentials
		getCredentials();
	}, []);

	// upon screen size change, removes current background and generates new one
	useEffect(() => {
		const bgScript = document.getElementById("bg-script");
		if (bgScript) bgScript.remove();

		generatePenrose()
	}, [height, width])

	const checkExternalLoginStatus = () => {
		const result = getParams("result");

		if (result && result.indexOf("EXTERNAL-LOGIN-FAILED") !== -1) {
			props.app.addAlert("warning", t(
				"LoginScreen|Something went wrong. External login failed. You may have not connected your profile with external service. Try different sign in method"
			));
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

	// generates new background
	const generatePenrose = () => {
		const script = document.createElement('script');
		script.id = "bg-script"
		script.src = "./media/login-bg.js"
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		}
	}

	const fetchFeatures = async () => {
		try {
			const response = await SeaCatAuthAPI.get("/public/features");
			if (response.data.result != "OK") {
				throw new Error({ result: response.data.result });
			}
			if (!response.data.data.login && !response.data.data.registration) return;

			setFeatures(response.data.data);
		} catch (e) {
			console.error("Failed to fetch external login services", e);
		}
	}

	const fetchRegisterFeatures = async () => {
		const token = getParams("token");
		// TODO: Temporal redirection until self-registration is build and enabled
		if (!token) {
			props.app.props.history.push("/");
		}
		console.log(token, "TOKEN")


		setRegisterFeatures(		{
			"email": "test@test.te",
			"username": "Testik",
			"phone": "666666666666",
			"password": true,
			"tenants": ["default", "looney", "tunes"]
		})

		// // TODO: handle when it fails
		// try {
		// 	const response = await SeaCatAuthAPI.get(`/public/register/${token}`);
		// 	if (response.data?.result != "OK") {
		// 		throw new Error({ result: response.data.result });
		// 	}
		// 	setRegisterFeatures(response.data.data);
		// } catch (e) {
		// 	// TODO: add alert here
		// 	console.error("Failed to fetch register features", e);
		// }
	}

	const getCredentials = () => {
		if (userinfo != undefined) {
			setCredentials(userinfo.username || userinfo.email || userinfo.phone || userinfo.sub);
		}
	}

	function getParams(param) {
		let parameter = undefined;
		const i = window.location.hash.indexOf('?');
		if (i > -1) {
			const qs = window.location.hash.substring(i+1);
			const params = new URLSearchParams(qs);
			parameter = params.get(param);
		}
		return parameter;
	}

	return (
		<Container className="animated fadeIn">
			<Row className="justify-content-center">
				<Col lg="10" className="mt-3">
					<Card>
						<CardBody className="text-center">
						{userinfo == undefined ?
							t("RegisterScreen|You have been invited to join")
						:
							<>{t(`RegisterScreen|Hello`)}<span className="primary-span pr-0">{credentials}</span>, {t(`RegisterScreen|you have been invited to join`)}</>
						}
						{registerFeatures && registerFeatures?.tenants && registerFeatures?.tenants.map((tenant, i) => (
								registerFeatures.tenants.length != i+1 ?
									<span key={i} className="primary-span pr-0">{tenant},</span>
								:
									<span key={i} className="primary-span">{tenant}</span>
							))
						}
						</CardBody>
					</Card>
				</Col>
			</Row>
			{userinfo == undefined ?
				<Row className="justify-content-center register-row">
					<Col lg="5">
						<LoginCard
							app={props.app}
							features={features["login"]}
							stateCode={stateCode}
						/>
					</Col>
					<Col lg="5">
						<LoginCard
							app={props.app}
							features={features["login"]}
							stateCode={stateCode}
						/>
						{/*<RegistrationCard app={props.app} features={features["registration"]} />*/}
					</Col>
				</Row>
			:
				<Row className="justify-content-center register-row">
					<Col lg="5">
						<JoinCard
							app={props.app}
							credentials={credentials}
							isSubmitting={isSubmitting}
							setIsSubmitting={setIsSubmitting}
							// features={features["login"]}
							// stateCode={stateCode}
						/>
					</Col>
					<Col lg="5">
						<SwitchAccountCard
							app={props.app}
							credentials={credentials}
							isSubmitting={isSubmitting}
							setIsSubmitting={setIsSubmitting}
							// features={features["login"]}
							// stateCode={stateCode}
						/>
						{/*<RegistrationCard app={props.app} features={features["registration"]} />*/}
					</Col>
				</Row>
			}
		</Container>
	);

}

export default RegisterScreen;
