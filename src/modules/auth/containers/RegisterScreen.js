import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Container, Row, Col, Card, CardHeader, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';

import LoginCard from './LoginCard.js';
import RegistrationCard from './RegistrationCard.js';
import AcceptInvitationCard from './AcceptInvitationCard.js';
import { getParams } from '../utils/paramsActions';

function RegisterScreen(props) {
	const { t } = useTranslation();
	const [features, setFeatures] = useState({ "login": {} });
	const [registerFeatures, setRegisterFeatures] = useState({});
	const [registerToken, setRegisterToken] = useState(undefined);
	const [width, height] = useWindowSize();
	const [stateCode, setStateCode] = useState("");
	const [credentials, setCredentials] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
	// For collapsing cardbodies in registration
	const [switchCards, setSwitchCards] = useState("register");

	const SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');
	const userinfo = useSelector(state => state.auth.userinfo);

	useEffect(() => {
		// Fetch register features from the server
		fetchRegisterFeatures();
		// Fetch external features from the server
		fetchFeatures();
		// Get the user credentials
		getCredentials();
	}, []);

	useEffect(() => {
		if(features?.login?.external) {
			// Check status if external login failed
			checkExternalLoginStatus();
			// Extract redirect uri for external login redirections
			saveRedirectUri();
		}
	}, [features])

	// upon screen size change, removes current background and generates new one
	useEffect(() => {
		const bgScript = document.getElementById("bg-script");
		if (bgScript) bgScript.remove();

		generatePenrose()
	}, [height, width])

	useEffect(() => {
		if (registrationSuccessful == true) {
			setTimeout(() => {
				// Redirect to root after successful registration
				props.app.props.history.push("/");
			}, 5000);
		}
	}, [registrationSuccessful])

	const checkExternalLoginStatus = () => {
		const err = getParams("error");

		if (err && err.indexOf("external_login_failed") !== -1) {
			props.app.addAlert("danger", t(
				"RegisterScreen|Something went wrong. External login failed. You may have not connected your profile with external service. Try different sign in method"
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
			if (!response?.data?.login && !response?.data?.registration) return;

			setFeatures(response.data);
		} catch (e) {
			console.error("Failed to fetch external login services", e);
		}
	}

	const fetchRegisterFeatures = async () => {
		const token = getParams("rt");
		setRegisterToken(token);
		if (getParams("card") == "login") {
			setSwitchCards("login");
		}
		// TODO: Temporal redirection until self-registration is build and enabled
		if (!token) {
			props.app.props.history.push("/");
		}

		try {
			const response = await SeaCatAuthAPI.get(`/public/register/${token}`);
			// TODO: implement throwing of error on result, when available
			// if (response.data?.result != "OK") {
			// 	throw new Error("Failed to fetch register features");
			// }
			setRegisterFeatures(response.data);
		} catch (e) {
			// TODO: add alert here
			console.error("Failed to fetch register features", e);
			props.app.addAlert("danger", `${t("RegisterScreen|Failed to fetch register features")}. ${e?.response?.data?.message}`, 30);
			setRegisterFeatures(undefined);
		}
	}

	const getCredentials = () => {
		if (userinfo != undefined) {
			setCredentials(userinfo.username || userinfo.email || userinfo.phone || userinfo.sub);
		}
	}

	return (
		<Container className="animated fadeIn">
			{registerFeatures == undefined ?
				<Row className="justify-content-center">
					<Col md="6">
						<ExpiredRegistrationCard app={props.app}/>
					</Col>
				</Row>
			:
				registrationSuccessful == true ?
					<Row className="justify-content-center">
						<Col md="6">
							<Card className="shadow animated fadeIn auth-card">
								<CardHeader className="border-bottom card-header-login">
									<div className="card-header-title" >
										<CardTitle className="text-primary" tag="h2">{t("RegisterScreen|Registration completed successfully")}</CardTitle>
									</div>
								</CardHeader>
								<CardBody className="text-center">
									<Row className="justify-content-center">
										<p className="expired-registration-p">
											{(userinfo == undefined) ?
												t("RegisterScreen|You will be redirected to the Login page or")
											:
												t("RegisterScreen|You will be redirected to the Home screen or")}
										</p>
									</Row>
									<Button
										block
										color="primary"
										type="button"
										onClick={() => props.app.props.history.push("/")}
									>
										{t("RegisterScreen|Click to Continue")}
									</Button>
								</CardBody>
							</Card>
						</Col>
					</Row>
				:
					<>
						<Row className="justify-content-center">
							<Col md="6" className="mt-3">
								<Card className="shadow">
									<CardBody className="text-center">
									<p className="info-card-font">
										{(userinfo == undefined) ?
											t("RegisterScreen|You have been invited to")
										:
											<>{t(`RegisterScreen|Hello`)}<span className="primary-span pr-0">{credentials}</span>, {t(`RegisterScreen|you have been invited to`)}</>
										}
									</p>
									{registerFeatures && registerFeatures?.tenants && registerFeatures?.tenants.map((tenant, i) => (
											(registerFeatures.tenants.length != i+1) ?
												<span key={i} className="primary-span pr-0">{tenant},</span>
											:
												<span key={i} className="primary-span">{tenant}</span>
										))
									}
									</CardBody>
								</Card>
							</Col>
						</Row>
						{(userinfo == undefined) ?
						<Row className="justify-content-center register-row">
							{switchCards == "register" ?
							<Col md="6">
								<RegistrationCard
									app={props.app}
									registerToken={registerToken}
									registerFeatures={registerFeatures}
									setRegistrationSuccessful={setRegistrationSuccessful}
									setSwitchCards={setSwitchCards}
								/>
							</Col>
							:
							<Col md="6">
								<LoginCard
									app={props.app}
									features={features["login"]}
									stateCode={stateCode}
									registerToken={registerToken}
									setSwitchCards={setSwitchCards}
								/>
							</Col>}
						</Row>
						:
						<Row className="justify-content-center register-row">
							<Col md="6">
								<AcceptInvitationCard
									app={props.app}
									credentials={credentials}
									isSubmitting={isSubmitting}
									setIsSubmitting={setIsSubmitting}
									registerToken={registerToken}
									setRegistrationSuccessful={setRegistrationSuccessful}
									setSwitchCards={setSwitchCards}
								/>
							</Col>
						</Row>}
					</>
			}
		</Container>
	);

}

export default RegisterScreen;

// Expired registration card
/*
	TODO: make a reusable message card from it

	<InfoMessageCard
		app={props.app}
		cardTitle="text"
		cardSubtitle="text2"
		message="text message"
	/>
*/
function ExpiredRegistrationCard (props) {
	const { t } = useTranslation();

	const redirectToRoot = () => {
		props.app.props.history.push("/");
	}

	return (
		<Card className="shadow auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('RegisterScreen|Ooops')}</CardTitle>
					<CardSubtitle tag="p">
						{t('RegisterScreen|Your invitation likely expired')}
					</CardSubtitle>
				</div>
			</CardHeader>
			<CardBody>
				<Row className="justify-content-center">
					<p className="expired-registration-p">
						{t("RegisterScreen|Please, contact your application administrator")}
					</p>
				</Row>

				<Row className="justify-content-center">
					<Col>
						<Button
							block
							color="primary"
							type="button"
							onClick={redirectToRoot}
						>
							{t('RegisterScreen|Continue')}
						</Button>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}
