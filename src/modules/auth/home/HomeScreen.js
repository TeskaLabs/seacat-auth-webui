import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useHistory } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle,
	CardSubtitle, CardBody, ListGroup,
	ListGroupItem, Input, FormGroup
} from 'reactstrap';

import { DateTime } from 'asab-webui';

import { factorChaining } from "../utils/factorChaining";
import { getParams, removeParams } from "../utils/paramsActions";

function HomeScreen(props) {
	const [features, setFeatures] = useState({ });
	const [updateFeatures, setUpdateFeatures] = useState({ });
	const [lastLogin, setLastLogin] = useState({ });
	const [userinfo, external_login_enabled] = useSelector(state => [
		state.auth?.userinfo,
		state.auth?.userinfo?.external_login_enabled
	]);
	const { t } = useTranslation();
	const history = useHistory();
	const SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');

	useEffect(() => {
		if (getParams("result") == "external_login_activated") {
			// Remove result param from URL if result with external_login_added is present in query params
			if (removeParams("result") == true) {
				props.app.addAlert("success", t("HomeScreen|External login activated"));
			} else {
				props.app.addAlert("danger", t("HomeScreen|External login was not activated"), 30);
			}
		}
		if (getParams("error") == "external_login_failed") {
			props.app.addAlert("danger", t("HomeScreen|External login was not activated"), 30);
		} else if (getParams("error") == "external_login_already_activated") {
			props.app.addAlert("danger", t("HomeScreen|External login already activated"), 30);
		} else if (getParams("error") == "external_login_not_activated") {
			props.app.addAlert("danger", t("HomeScreen|External login can't be activated"), 30);
		}
		removeParams("error");
		fetchFeatures();
		fetchUpdateFeatures();
		fetchLastLogin();
	}, []);

	useEffect(() => {
		if(features?.login?.external) {
			redirectAfterExtLogin();
		}
	}, [features])

	const fetchFeatures = async () => {
		try {
			const response = await SeaCatAuthAPI.get("/public/features");
			setFeatures(response.data);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchUpdateFeatures = async () => {
		try {
			const response = await SeaCatAuthAPI.get("/public/provider");

			if (response.data.result != "OK") throw response;

			const newUpdateFeatures = response.data.data?.update?.reduce((prev, curr) => {
				prev[curr.type] = { ...curr }
				return prev;
			}, { });

			setUpdateFeatures(prev => ({ ...prev, ...newUpdateFeatures }));
		} catch (e) {
			console.error(e);
		}
	};

	const fetchLastLogin = async () => {
		try {
			const response = await SeaCatAuthAPI.get("/public/last_login");
			setLastLogin(response.data);
		} catch (e) {
			console.error(e);
		}
	}

	const redirectAfterExtLogin = () => {
		// extract search params
		const params = new URLSearchParams(window.location.search)

		// check for state code
		if (!params.has("state") && !localStorage.getItem("redirect_code")) return ;

		const stateParam = params.get("state");
		const stateLocale = JSON.parse(localStorage.getItem("redirect_code"));
		localStorage.removeItem("redirect_code");

		// if state code is the same as we get from search params then redirect
		// to initial page
		if (stateLocale[stateParam]) {
			window.location.href = stateLocale[stateParam]["redirectUri"];
		}
	}

	// User is not logged in
	if (userinfo == null) {
		history.replace('/login');
		return (null);
	}

	let redirect_uri;
	let setup;
	let i = window.location.hash.indexOf('?');
	if (i > -1) {
		let qs = window.location.hash.substring(i+1);
		let params = new URLSearchParams(qs);
		redirect_uri = params.get("redirect_uri");
		setup = params.get("setup");
	}

	if (redirect_uri === undefined || redirect_uri === null) {
		redirect_uri = props.app.Config.get('login')?.redirect_uri || '/';
	}

	// If setup in params, trigger factor chaining
	if (setup) {
		factorChaining(setup, redirect_uri, history);
	}

	const confirmLogoutAll = () => {
		let msg = t("HomeScreen|Do you want to logout from all devices?")
		var r = confirm(msg);
		if (r == true) {
			logoutAll();
		}
	}

	const logoutAll = async () => {
		let response;
		try {
			response = await SeaCatAuthAPI.delete('/public/sessions');
			if (response.data.result !== "OK") {
				throw new Error(t("HomeScreen|Something went wrong when logging you out from all devices"));
			}
			props.app.addAlert("success", t("HomeScreen|You have been logged out from all devices, you will be redirected to Login in a while"));
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		} catch (e) {
			console.error("Failed to terminate all user's sessions", e);
			props.app.addAlert("danger", `${t("HomeScreen|Something went wrong when logging you out from all devices")}. ${e?.response?.data?.message}`, 30);
		}
	}

	const logout = async () => {
		props.app.addSplashScreenRequestor(this);
		try {
			await SeaCatAuthAPI.put('/public/logout');
			window.location.reload();
		}
		catch (e) {
			console.error("Failed to fetch userinfo", e);
			props.app.addAlert("danger", `${t("HomeScreen|Silly as it sounds, the logout failed")}. ${e?.response?.data?.message}`, 30);
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		}
	}

	// Remove external service verification
	const removeExternalServiceVerification = async (provider) => {
		const verification = confirm(t(`HomeScreen|Do you want to disconnect from ${provider.replace(provider[0], provider[0].toUpperCase())}?`))
		if (verification) {
			await removeExternalService(provider);
		}
	}

	// Remove external service method
	const removeExternalService = async (provider) => {
		try {
			await SeaCatAuthAPI.delete("/public/ext-login/" + provider);
			props.app.addAlert("success", t("HomeScreen|Service was successfully disconnected"));
			// reload in order to get updated userinfo
			window.location.reload();
		} catch (e) {
			console.error(e);
			props.app.addAlert("danger", `${t("HomeScreen|Failed to disconnect service")}. ${e?.response?.data?.message}`, 30);
		}
	}

	const externalServiceOnChange = async ({ item, isConnected }) => {
		// remove external service sign in
		if (isConnected) await removeExternalServiceVerification(item.type);
		// add external service sign in
		else window.location.replace(item.authorize_uri);
	}

	return (
		<Container>
			<Row className="justify-content-center">

					<Card className="shadow animated fadeIn homescreen-card auth-card">
						<CardHeader className="border-bottom card-header-login">
							<div className="card-header-title" >
								<CardTitle className="text-primary" tag="h2">{t('HomeScreen|My account')}</CardTitle>
							</div>
						</CardHeader>
						<CardBody>
							<ListGroup flush>

								<ListGroupItem className="mb-0">
									<CardSubtitle tag="h5" title={userinfo?.sub}>
										{userinfo?.username}
									</CardSubtitle>
									<React.Fragment>
										<Row className="pt-2">
											<Col sm={6}>{t('HomeScreen|Created')}</Col>
											<Col sm={6}>
												{userinfo?.created_at ?
													<div className="float-end"><DateTime value={userinfo?.created_at}/></div>
												:
													<div className="float-end">N/A</div>
												}
											</Col>
										</Row>
										<Row>
											<Col sm={6}>{t('HomeScreen|Last successful login')}</Col>
											<Col sm={6}>
												{lastLogin?.sat ?
													<div className="float-end"><DateTime value={lastLogin?.sat}/></div>
												:
													<div className="float-end">N/A</div>
												}
											</Col>
										</Row>
										<Row>
											<Col sm={6}>{t('HomeScreen|Last failed login')}</Col>
											<Col sm={6}>
												{lastLogin?.fat ?
													<div className="float-end"><DateTime value={lastLogin?.fat}/></div>
												:
													<div className="float-end">N/A</div>
												}
											</Col>
										</Row>
										<Row>
											<Col sm={6}>{t('HomeScreen|Session expiration')}</Col>
											<Col sm={6}>
												{userinfo?.exp ?
													<div className="float-end"><DateTime value={userinfo?.exp}/></div>
												:
													<div className="float-end">N/A</div>
												}
											</Col>
										</Row>
									</React.Fragment>
								</ListGroupItem>

								{features.my_account?.external_login?.map((item, i) => {
									const isConnected = external_login_enabled?.includes(item.type);

									return (
										<ListGroupItem key={i} className="mb-0">
											<Row>
												<Col sm={6}>
													<a onClick={() => externalServiceOnChange({ item, isConnected })} className="external-service-title">
														{t(`HomeScreen|${item.label}`)}
													</a>
												</Col>
												<Col sm={6}>
													<FormGroup className="p-0" switch>
														<Input
															id={`${item?.label?.replace(/[^\w\s]/gi, '-')}`}
															className="float-end"
															defaultChecked={isConnected}
															type="switch"
															onClick={() => externalServiceOnChange({ item, isConnected })}
														/>
													</FormGroup>
												</Col>
											</Row>
										</ListGroupItem>
									)
								})}

								<ListGroupItem className="mb-0">
									<Link to="/change-password" className="d-block">
										{t('HomeScreen|Password change')}
									</Link>
								</ListGroupItem>

								<ListGroupItem className="mb-0">
									<Row>
										<Col sm={5}>
											{updateFeatures.email?.policy === "anybody" ? (
												<Link to="/manage-email" className="d-block">
													{t('HomeScreen|Manage email address')}
												</Link>
											) : (
												<div className="text-muted">
													{t('HomeScreen|Manage email address')}
												</div>
											)}
										</Col>
										<Col sm={7}>
											<div
												className="float-end char-limit char-limit-text"
												id="emailAddress"
												name="emailAddress"
												title={userinfo?.email ?? "" }
											>
												{!userinfo?.email || userinfo?.email === "" ?
													'N/A'
												:
													userinfo?.email
												}
											</div>
										</Col>
									</Row>
								</ListGroupItem>

								<ListGroupItem className="mb-0">
									<Row>
										<Col sm={6}>
											{updateFeatures.phone?.policy === "anybody" ? (
												<Link to="/manage-number" className="d-block">
													{t('HomeScreen|Manage phone number')}
												</Link>
											) : (
												<div className="text-muted">
													{t('HomeScreen|Manage phone number')}
												</div>
											)}
										</Col>
										<Col sm={6}>
											<div
												className="float-end text-muted pointer char-limit char-limit-number"
												id="phoneNumber"
												name="phoneNumber"
												title={userinfo?.phone ?? ""}
											>
												{!userinfo?.phone || userinfo?.phone === "" ?
													'N/A'
												:
													userinfo?.phone
												}
											</div>
										</Col>
									</Row>
								</ListGroupItem>

								<ListGroupItem className="mb-0">
									<Row className="align-items-center">
										<Col sm={6}>
											<Link to="/manage-totp" className="d-block">
												{t('HomeScreen|Manage OTP')}
											</Link>
										</Col>
										<Col sm={6}>
											<div className="float-end text-muted pointer" id="webauthn" name="webauthn">
												<div
													className={((userinfo?.available_factors) && (userinfo.available_factors.indexOf("totp") != -1)) ?
														`status-circle status-active`
													:
														`status-circle`}
													title={((userinfo?.available_factors) && (userinfo.available_factors.indexOf("totp") != -1)) ?
														t("HomeScreen|Active")
													:
														t("HomeScreen|Inactive")}
												/>
											</div>
										</Col>
									</Row>
								</ListGroupItem>

								<ListGroupItem className="mb-0">
									<Row className="align-items-center">
										<Col sm={6}>
											<Link to="/manage-webauthn" className="d-block">
												{t('HomeScreen|Manage FIDO2/WebAuthn')}
											</Link>
										</Col>
										<Col sm={6}>
											<div className="float-end text-muted pointer" id="webauthn" name="webauthn">
												<div
													className={((userinfo?.available_factors) && (userinfo.available_factors.indexOf("webauthn") != -1)) ?
														`status-circle status-active`
													:
														`status-circle`}
													title={((userinfo?.available_factors) && (userinfo.available_factors.indexOf("webauthn") != -1)) ?
														t("HomeScreen|Active")
													:
														t("HomeScreen|Inactive")}
												/>
											</div>
										</Col>
									</Row>
								</ListGroupItem>

								<ListGroupItem className="mb-0 pb-0">
									<p>
										<a
											href="#"
											className="d-block text-danger"
											onClick={(e) => {e.preventDefault(); confirmLogoutAll();}}
										>
											{t('HomeScreen|Logout from all devices')}
										</a>
									</p>
								</ListGroupItem>

								<ListGroupItem>
									<h5>
										<a
											href="#"
											className="d-block text-danger"
											onClick={(e) => {e.preventDefault(); logout();}}
										>
											{t('HomeScreen|Logout')}
										</a>
									</h5>
								</ListGroupItem>

							</ListGroup>
						</CardBody>
					</Card>

			</Row>
		</Container>
	);
}

export default HomeScreen;
