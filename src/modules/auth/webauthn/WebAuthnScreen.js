import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

import { CellContentLoader, DateTime } from 'asab-webui';

import { connect } from 'react-redux';

import publicKeyValuesToJSON from "./publicKeyValuesToJSON";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Input, Button, ButtonGroup,
	Table, InputGroup, InputGroupAddon, Form, FormText, FormFeedback
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";

export default function WebAuthnScreen(props) {
	return (
		<Container>
			<Row className="justify-content-center">
				<Col className="col-webauthn-card">
					<WebAuthnCard app={props.app}/>
				</Col>
			</Row>
		</Container>
	);
}


function WebAuthnCard(props) {
	const { t, i18n } = useTranslation();
	let history = useHistory();
	let SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	const [ isLoading, setIsLoading ] = useState(true);
	const [ isSubmitting, setIsSubmitting ] = useState(false);
	const [ authenticators, setAuthenticators ] = useState([]);
	const [ editing, setEditing ] = useState(false);
	const [editMode, setEditMode] = useState(false);

	const { handleSubmit, register, formState: { errors }, setValue } = useForm();

	const reg = register(
		"keyname",
		{
			validate: {
				emptyInput: value => (value && value.toString().length !== 0) || t("TenantCreateContainer|Tenant name cannot be empty!"),
			}
		}
	);

	useEffect(() => {
		if (authenticators) {
			authenticators.map((obj, idx) => {
				setValue("keyname", obj.name)
			})
		}

	}, [authenticators]);

	useEffect(() => {
		setIsLoading(true);
		getAuthenticators();
	}, [])

	// Get authenticators
	const getAuthenticators = async () => {
		let response;
		try {
			response = await SeaCatAuthAPI.get('/public/webauthn');
			// TODO: enable validation, when ready in SA service
			if (response.data.result != 'OK') {
				throw new Error(t("WebAuthnScreen|Something went wrong, can't retrieve authenticators"));
			}
			setAuthenticators(response.data.data);
			setIsLoading(false);
		} catch(e) {
			// TODO: add error message for already registered credentials
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, can't retrieve authenticators"));
			setIsLoading(false);
			return;
		}
	}

	// TODO: implement on authenticator detail change
	// const onAuthenticatorDetailsChange = async (obj) => {

	// }

	// Register credentials
	const onRegister = async () => {
		// Get register options for WebAuthn
		let response;
		try {
			response = await SeaCatAuthAPI.get('/public/webauthn/register-options');
			// TODO: enable validation, when ready in SA service
			// if (response.data.result != 'OK') {
			// 	throw new Error(t("WebAuthnScreen|Something went wrong, registration of authenticator failed"));
			// }
		} catch(e) {
			// TODO: add error message for already registered credentials
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, registration of authenticator failed"));
			setIsSubmitting(false);
			return;
		}

		// Register options data obtained from register-options endpoint
		// Response returns just data, because of used WebAuthn library
		const registerOptionsData = response.data;
		// Fill pubKey credentail registration options from response of register-options endpoint
		const publicKeyCredentialRegisterOptions = {
			challenge: Uint8Array.from(
				registerOptionsData.challenge, c => c.charCodeAt(0)),
			rp: registerOptionsData.rp,
			user: {
				id: Uint8Array.from(
					registerOptionsData.user.id, c => c.charCodeAt(0)),
				name: registerOptionsData.user.name,
				displayName: registerOptionsData.user.displayName,
			},
			pubKeyCredParams: registerOptionsData.pubKeyCredParams,
			timeout: registerOptionsData.timeout,
			attestation: registerOptionsData.attestation,
			// TODO: enable when ready
			// authenticatorSelection: registerOptionsData.authenticatorSelection
		};

		// The credential object returned from the register-options call is an object
		// containing the public key and other attributes used to validate the registration event
		let credential;
		try {
			credential = await navigator.credentials.create({
				publicKey: publicKeyCredentialRegisterOptions
			});
		} catch(e) {
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Registration failed, can't identify used authenticator"));
			setIsSubmitting(false);
			return;
		}

		// Parse data to JSON and convert to base64 string
		let credToJSON = publicKeyValuesToJSON(credential);

		// Register credentials
		let registerResponse;
		try {
			registerResponse = await SeaCatAuthAPI.put('/public/webauthn/register', credToJSON);
			if (registerResponse.data.result != 'OK') {
				throw new Error(t("WebAuthnScreen|Something went wrong, registration of authenticator failed"));
			}
		} catch(e){
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, registration of authenticator failed"));
			setIsSubmitting(false);
			return;
		}

		// Return to Home page after successful registration or continue in factor chaining process (if part of faactor chaining)
		props.app.addAlert("success", t("WebAuthnScreen|Authenticator successfully registered"));
		if (redirect_uri !== null) {
			let setup = params.get("setup");
			factorChaining(setup, redirect_uri, history);
		} else {
			// Get authenticators
			getAuthenticators();
			setIsSubmitting(false);
		}
	}

	// Unregister credentials
	const onUnregister = async (id) => {
		let response;
		try {
			response = await SeaCatAuthAPI.delete(`/public/webauthn/${id}`);
			// TODO: enable validation, when ready in SA service
			if (response.data.result != 'OK') {
				throw new Error(t("WebAuthnScreen|Something went wrong, can't unregister authenticator"));
			}
			props.app.addAlert("success", t("WebAuthnScreen|Authenticator successfully unregistered"));
			if (redirect_uri !== null) {
				let setup = params.get("setup");
				factorChaining(setup, redirect_uri, history);
			} else {
				// Get authenticators
				getAuthenticators();
				setIsSubmitting(false);
			}
		} catch(e) {
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, can't unregister authenticator"));
			setIsSubmitting(false);
			return;
		}
	}

	// Edit keyname
	const changeKeyName = async (values) => {
		console.log(values,"change name");
		setEditMode(false);
		// setEditMode(!editMode);
		// let response;
		// try {
		// 	response = await SeaCatAuthAPI.put(`/public/webauthn/${id}`, {"name": "frantuv-klic"});
		// 	// TODO: enable validation, when ready in SA service
		// 	if (response.data.result != 'OK') {
		// 		throw new Error(t("WebAuthnScreen|Something went wrong, can't edit authenticator"));
		// 	}
		// 	props.app.addAlert("success", t("WebAuthnScreen|Authenticator successfully changed"));
		// } catch(e) {
		// 	console.error(e);
		// 	props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, can't changed authenticator"));
		// 	// setIsSubmitting(false);
		// 	// return;
		// }
	}

	const cancelChanges = () => {
		const confirmation = confirm(t("ASABLibraryModule|Are you sure you want to cancel changes?"));
		if (confirmation) {
			setEditMode(false);
		}
	}

	// Confirmation popup window for activation/deactivation of OTP
	const confirmWebAuthnUnregister = (id) => {
		setIsSubmitting(true);
		let msg = t("WebAuthnScreen|Do you want to unregister this authenticator?")

		var r = confirm(msg);
		if (r == true) {
			onUnregister(id);
		} else {
			setIsSubmitting(false);
		}
	}

	return (
		<Card className="shadow animated fadeIn auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('WebAuthnScreen|Manage FIDO2/WebAuthn')}</CardTitle>
					<CardSubtitle tag="p">
						{t('WebAuthnScreen|Here you can manage authenticators')}
					</CardSubtitle>
				</div>
			</CardHeader>
			<CardBody>
				{authenticators.length > 0 ?
				<Table responsive borderless>
					<thead>
						<tr>
							<th>
								{t('WebAuthnScreen|Key name')}
							</th>
							<th className="td-not-display">
								{t('WebAuthnScreen|Sign count')}
							</th>
							<th className="td-not-display">
								{t('WebAuthnScreen|Last successful login')}
							</th>
							<td>
							</td>
						</tr>
					</thead>
					<tbody>
						{authenticators.map((obj, idx) => {
							return (
								<tr key={idx}>
									<td className="p-2 align-middle">
										{editMode ?
											<>
												<Input
													id="keyname"
													name="keyname"
													type="text"
													autoComplete="off"
													invalid={errors.id}
													placeholder={t("WebAuthnScreen|Name of the key")}
													onChange={reg.onChange}
													onBlur={reg.onBlur}
													innerRef={reg.ref}
												/>
												{/*{errors.id ?*/}
												{/*	<FormFeedback>{errors.id.message}</FormFeedback>*/}
												{/*	:*/}
												{/*	<FormText>{t("WebAuthnScreen|blalbalba")}</FormText>*/}
												{/*}*/}
											</>
										:
											<div className="div-key-wordwrap" title={obj?.name}>
												<span className="cil-shield-alt pr-1" />{obj?.name}
											</div>
										}

									</td>
									<td className="p-2 td-not-display align-middle">
										{obj?.sign_count}
									</td>
									<td className="p-2 td-not-display align-middle">
										<DateTime value={obj?.last_login}/>
									</td>
									<td className="p-2 align-middle">
										<ButtonGroup>
											{editMode ?
												<>
													<Button
														outline
														color="success"
														size="sm"
														type="submit"
													>
														{t("ASABLibraryModule|Save")}
													</Button>
													<Button
														outline
														color="danger"
														size="sm"
														type="button"
														onClick={cancelChanges}
													>
														{t("ASABLibraryModule|Cancel")}
													</Button>
												</>
												:
												<>
													<Button
														outline
														type="button"
														title={t("WebAuthnScreen|Edit")}
														size="sm"
														color="secondary"
														icon="cil-cloud-download"
														onClick={() => setEditMode(true)}
													>
														<span className="cil-color-border"></span>
													</Button>
													<Button
														outline
														size="sm"
														color="danger"
														type="button"
														title={t("WebAuthnScreen|Unregister authenticator")}
														onClick={(e) => {confirmWebAuthnUnregister(obj?.id), e.preventDefault()}}
														className="float-right"
														disabled={isSubmitting}
													>
														{t("WebAuthnScreen|Unregister")}
													</Button>
												</>
											}

										</ButtonGroup>
									</td>
								</tr>
							)
						})}
					</tbody>
				</Table>
				:
				isLoading ?
					<CellContentLoader cols={1} rows={2} title={t("WebAuthnScreen|Loading")}/>
					:
					<p className="text-center">
						{t("WebAuthnScreen|No authenticator registered")}
					</p>
				}
				<div className="div-button-center">
					<Button
						block
						className="button-webauthn-register justify-content-center"
						color="primary"
						type="button"
						disabled={isSubmitting}
						onClick={(e) => {onRegister(), setIsSubmitting(true), e.preventDefault()}}
					>
						{t("WebAuthnScreen|Register new authenticator")}
					</Button>
				</div>
			</CardBody>
			{!redirect_uri &&
				<CardFooter className="border-top">
					<Button
						outline
						color="primary"
						type="button"
						disabled={isSubmitting}
						onClick={() => history.goBack()}
					>
						{t("WebAuthnScreen|Go back")}
					</Button>
				</CardFooter>
			}
		</Card>

	);
}
