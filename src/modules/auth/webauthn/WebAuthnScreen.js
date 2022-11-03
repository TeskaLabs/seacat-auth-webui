import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

import { CellContentLoader, DateTime } from 'asab-webui';

import publicKeyValuesToJSON from "./publicKeyValuesToJSON";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Input, Button, ButtonGroup,
	Table, Form, FormFeedback
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";

export default function WebAuthnScreen(props) {
	return (
		<Container>
			<Row className="justify-content-center">
				<Col lg={11} className="col-webauthn-card">
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
	const [ globalEditMode, setGlobalEditMode ] = useState(false);

	const { handleSubmit, register, formState: { errors }, setValue, resetField, getValues } = useForm();

	// Register input for authenticator name
	const regName = register(
		"name",
		{
			validate: {
				emptyInput: value => (value && value.toString().length !== 0) || t("WebAuthnScreen|Authenticator name can't be empty!"),
				startWithNumber: value => !(/^\d/).test(value) || t("WebAuthnScreen|Invalid format, authenticator name can't start with a number"),
				startWithDash: value => !(/^[-]$/).test(value) || t("WebAuthnScreen|Invalid format, authenticator name can't start with a dash"),
				startWithUnderscore: value => !(/^[_]$/).test(value) || t("WebAuthnScreen|Invalid format, authenticator name can't start with a underscore"),
				formatValidation: value => (/^[a-z][a-z0-9._-]{0,128}[a-z0-9]$/).test(value) || t("WebAuthnScreen|Invalid format, only lower-case letters, numbers, dash and underscore are allowed"),
			}
		});

	useEffect(() => {
		setIsLoading(true);
		getAuthenticators();
	}, []);

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
			setGlobalEditMode(false);
		} catch(e) {
			// TODO: add error message for already registered credentials
			console.error(e);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, can't retrieve authenticators"));
			setIsLoading(false);
			setGlobalEditMode(false);
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

	const onSubmitKeyName = async (values) => {
		let response;
		try {
			response = await SeaCatAuthAPI.put(`/public/webauthn/${values.id}`,
				{"name": `${values.name}`}
			);
			if (response.data.result != 'OK') {
				throw new Error(t("WebAuthnScreen|Something went wrong, can't update authenticator"));
			}
			props.app.addAlert("success", t("WebAuthnScreen|Authenticator successfully updated"));
			resetField("name");
			setIsSubmitting(false);
			getAuthenticators();
		} catch(e) {
			console.error(e.response.data.message);
			props.app.addAlert("danger", t("WebAuthnScreen|Something went wrong, can't update authenticator"));
			props.app.addAlert("danger", e.response.data.message);
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
				<div className="card-header-title">
					<CardTitle className="text-primary" tag="h2">{t('WebAuthnScreen|Manage FIDO2/WebAuthn')}</CardTitle>
					<CardSubtitle tag="p">
						{t('WebAuthnScreen|Here you can manage authenticators')}
					</CardSubtitle>
				</div>
			</CardHeader>
			<CardBody>
				{authenticators && authenticators.length > 0 ?
					<Form onSubmit={handleSubmit(onSubmitKeyName)}>
						<Table responsive borderless>
							<thead>
								<tr>
									<th className="webauthn-th-keyname">
										{t('WebAuthnScreen|Key name')}
									</th>
									<th className="webauthn-th-sign-count td-not-display">
										{t('WebAuthnScreen|Sign count')}
									</th>
									<th className="webauthn-th-last-login td-not-display">
										{t('WebAuthnScreen|Last successful login')}
									</th>
									<td className="webauthn-th-button"></td>
								</tr>
							</thead>
							<tbody>
								{authenticators.map((obj, idx) => {
									return (
										<TableRow
											key={idx}
											obj={obj}
											regName={regName}
											setValue={setValue}
											errors={errors}
											getValues={getValues}
											resetField={resetField}
											isSubmitting={isSubmitting}
											globalEditMode={globalEditMode}
											setGlobalEditMode={setGlobalEditMode}
											confirmWebAuthnUnregister={confirmWebAuthnUnregister}
										/>
									)
								})}
							</tbody>

						</Table>
					</Form>
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
						disabled={isSubmitting || (globalEditMode == true)}
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

function TableRow (props) {
	const { t, i18n } = useTranslation();
	const [ localEditMode, setLocalEditMode ] = useState(false);
	let obj = props.obj;

	// Cancel edit mode for an authenticator name
	const cancelChanges = () => {
		const confirmation = confirm(t("WebAuthnScreen|Are you sure you want to cancel changes?"));
		if (confirmation) {
			props.setGlobalEditMode(false);
			setLocalEditMode(false);
			props.resetField("name");
		}
	}

	// Open edit mode for changing authenticator name
	const editAuthenticatorName = (e, id) => {
		e.preventDefault();
		props.setGlobalEditMode(true);
		setLocalEditMode(true);
		props.setValue("id", id);
	}

	return (
		<tr>
			<td className="p-2 align-middle">
				{(localEditMode && props.globalEditMode && obj?.id == props.getValues("id")) ?
					<>
						<Input
							style={{height: "35px"}}
							id="name"
							name="name"
							type="text"
							title={obj?.name}
							invalid={props.errors.name}
							onChange={props.regName.onChange}
							onBlur={props.regName.onBlur}
							innerRef={props.regName.ref}
							defaultValue={obj?.name}
						/>
						{props.errors.name && <FormFeedback>{props.errors.name.message}</FormFeedback>}
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
			<td className="p-2 align-middle text-right">
				<ButtonGroup className="table-button-group">
					{(localEditMode && props.globalEditMode && (obj?.id == props.getValues("id"))) ?
						<>
							<Button
								outline
								color="success"
								size="sm"
								type="submit"
								title={t("WebAuthnScreen|Save")}
							>
								{t("WebAuthnScreen|Save")}
							</Button>
							<Button
								outline
								color="danger"
								size="sm"
								type="button"
								title={t("WebAuthnScreen|Cancel")}
								onClick={() => {cancelChanges()}}
							>
								{t("WebAuthnScreen|Cancel")}
							</Button>
						</>
					:
						<>
							<Button
								outline
								type="button"
								title={t("WebAuthnScreen|Edit authenticator")}
								size="sm"
								color="secondary"
								icon="cil-cloud-download"
								onClick={(e) => editAuthenticatorName(e, obj?.id)}
								disabled={props.isSubmitting || (props.globalEditMode == true)}
							>
								<span className="cil-color-border"></span>
							</Button>
							<Button
								outline
								size="sm"
								color="danger"
								type="button"
								title={t("WebAuthnScreen|Unregister authenticator")}
								className="float-right"
								onClick={(e) => {props.confirmWebAuthnUnregister(obj?.id), e.preventDefault()}}
								disabled={props.isSubmitting || (props.globalEditMode == true)}
							>
								{t("WebAuthnScreen|Unregister")}
							</Button>
						</>
					}
				</ButtonGroup>
			</td>
		</tr>
	)
}

