import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import {
	Row, Col,
	Card, CardHeader, CardTitle,
	CardSubtitle, CardBody, CardFooter,
	Form, FormText,
	Label, Input, CustomInput,
	Collapse, Button, Progress, ButtonGroup
} from 'reactstrap';

import publicKeyValuesToJSON from "../webauthn/publicKeyValuesToJSON";
import base64url from '../utils/base64url';

// TODO: Reset the form is it stays too long in "after prologue" state (serverLoginKey !== undefined)

function LoginCard(props) {
	var rememberedIdent = window.localStorage.getItem('SeaCatIdent');

	const { t } = useTranslation();

	const { handleSubmit, register, getValues, reset, formState: { errors, isSubmitting } } = useForm({defaultValues: {
			'username': (rememberedIdent !== null ? rememberedIdent : ""),
			'rememberme': rememberedIdent !== null,
		}});

	const [ lsid, setLsid ] = useState(undefined);
	const [ clientLoginKey, setClientLoginKey ] = useState(null);
	const [ serverLoginKey, setServerLoginKey ] = useState(null);
	const [ sharedSecretKey, setSharedSecretKey ] = useState(null);

	const [ loginButtonHidden, setLoginButtonHidden ] = useState(false);

	const [ descriptors, setDescriptors ] = useState(undefined);
	const [ descriptor, setDescriptor ] = useState(undefined);

	const [ insecuredConnection, setInsecuredConnection ] = useState(false);

	// Submitting for webAuthn and external login onClick event for MacOS
	const [ isOnClickSubmitting, setIsOnClickSubmitting ] = useState(false);

	// Register ident
	const usernameRegister = register('username');

	// We generate a shared secret key (AES) with the server for this login session
	useEffect(() => {
		const generateClientLoginKey = async () => {
			let client_login_key = await window.crypto.subtle.generateKey(
				{ name: "ECDH", namedCurve: "P-256" },
				false,
				["deriveKey"]
			)
			setClientLoginKey(client_login_key);
		};
		generateClientLoginKey();
	}, []);


	// If ident has been remembered, do the first submit automatically
	useEffect(() => {
		if (rememberedIdent !== null) {
			// Initial the first step in a small delay after clientLoginKey is ready
			setTimeout(function () {
				handleSubmit(onPreludeSubmit)();
			}, 200);
		}
	}, [clientLoginKey]);


	// Check on insecured connection
	if (!insecuredConnection && location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
		props.app.addAlert("warning", t("LoginCard|Insecured connection"), 30);
		setInsecuredConnection(true);
	}

	// Configure encryption with shared secret key
	let SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');
	SeaCatAuthAPI.interceptors.request.use(
		async config => {
			var enc = new TextEncoder();
			var plaintext = enc.encode(JSON.stringify(config.data));
			let iv = window.crypto.getRandomValues(new Uint8Array(12));
			let cyphertext = await window.crypto.subtle.encrypt(
				{ name: "AES-GCM", iv: iv },
				sharedSecretKey,
				plaintext
			);

			// Construct the output encrypted
			var c = new Uint8Array(iv.length + cyphertext.byteLength);
			c.set(iv, 0);
			c.set(new Uint8Array(cyphertext), iv.length);
			config.data = c;
			config.responseType = "arraybuffer";

			return config;
		},
		error => { return Promise.reject(error); }
	);

	SeaCatAuthAPI.interceptors.response.use(
		async response => {
			let plaintext = await window.crypto.subtle.decrypt(
				{ name: "AES-GCM", iv: response.data.slice(0, 12) },
				sharedSecretKey,
				response.data.slice(12)
			);

			var dec = new TextDecoder();
			response.data = JSON.parse(dec.decode(plaintext));

			return response;
		},
		error => { return Promise.reject(error); }
	);


	const onPreludeSubmit = async () => {

		if (clientLoginKey === null) {
			return;
		}

		let jwk = await window.crypto.subtle.exportKey("jwk", clientLoginKey.publicKey);

		let expiration;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			jwk.qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(jwk.qs);
			expiration = params.get("expiration");
		}

		jwk.expiration = expiration === null ? undefined : expiration;

		jwk.ident = getValues().username;

		let SeaCatAuthPrologueAPI = props.app.axiosCreate('seacat-auth');
		let response;
		try {
			response = await SeaCatAuthPrologueAPI.put('/public/login.prologue', jwk)
		} catch (e) {
			props.app.addAlert(
				"danger",
				`${t("LoginCard|Something went wrong")}. ${e?.response?.data?.message}`, 30
			);
			return;
		}
		if (response.status != 200) {
			console.error("Server responsed with ", response.status);
			props.app.addAlert(
				"danger",
				`${t("LoginCard|Something went wrong")}. ${e?.response?.data?.message}`, 30
			);
			return;
		}

		setLsid(response.data.lsid)

		let server_login_key = await crypto.subtle.importKey(
			"jwk",
			response.data.key,
			{ name: "ECDH", namedCurve: response.data.key.crv },
			false,
			[]
		);

		setServerLoginKey(server_login_key);

		let shared_secret_key = await window.crypto.subtle.deriveKey(
			{ name: "ECDH", public: server_login_key },
			clientLoginKey.privateKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["encrypt", "decrypt"]
		)

		setSharedSecretKey(shared_secret_key);

		let lds = response.data.lds;

		setDescriptors(lds);
		setDescriptor(lds[0]);

	}


	const onSubmit = async (values) => {
		values.descriptor = descriptor.id;
		// Store or remove Ident from localstorage based on checked / unchecked checkbox Remember me
		if (values.rememberme !== undefined && values.rememberme) {
			window.localStorage.setItem('SeaCatIdent', values.username);
		} else {
			if ('SeaCatIdent' in window.localStorage) {
				window.localStorage.removeItem('SeaCatIdent')
			}
		}

		let response;
		try {
			response = await SeaCatAuthAPI.put("/public/login/"+lsid, values)
		} catch (e) {
			if (e.response.status == 401) {
				props.app.addAlert(
					"danger",
					t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
				);
			} else if (e.response.status == 504) {
				props.app.addAlert(
					"danger",
					t("LoginCard|Can't proceed due to connection problems"), 30
				);
			} else {
				props.app.addAlert(
					"danger",
					`${t("LoginCard|Something went wrong")}. ${e?.response?.data?.message}`, 30
				);
			}
			return;
		}

		if ((response === undefined) || (response.status != 200)) {
			props.app.addAlert(
				"danger",
				t("LoginCard|Server responded with incorrect response code, please try again"), 30
			);
			return;
		}

		if (response.data.result !== "OK") {
			props.app.addAlert(
				"danger",
				t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
			);
			return;
		}

		props.app.addAlert(
			"success",
			t("LoginCard|The login has been successful")
		);

		/*
			If register token is present, reload the page to stay in the register screen
			and eventually confirm/finish the registration action
		*/
		if (props.registerToken != undefined) {
			window.location.reload();
			// Basically wait forever, until the app is going to be reloaded with window.location.reload
			await new Promise(r => setTimeout(r, 3600*1000));
		}

		let redirect_uri;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			let qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(qs);
			redirect_uri = params.get("redirect_uri");
		}

		if (redirect_uri === undefined || redirect_uri === null) {
			redirect_uri = props.app.Config.get('login')?.redirect_uri || '/';
		}

		// Remove redirect_code from localStorage (if present)
		localStorage.removeItem("redirect_code");
		// Replace location with redirect URI
		window.location.replace(redirect_uri);
		// Basically wait forever, until the app is going to be reloaded with window.location.replace
		await new Promise(r => setTimeout(r, 3600*1000));
	}

	const onReset = () => {
		setDescriptor(undefined);
		setDescriptors(undefined);
		setLsid(undefined);
		setServerLoginKey(null);
		setSharedSecretKey(null);
		setLoginButtonHidden(false);
		reset({
			username: ""
		});

		document.getElementById("username").focus();
	}

	const onCantLogin = () => {
		let redirect_uri;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			let qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(qs);
			redirect_uri = params.get("redirect_uri");
		}

		if (redirect_uri === undefined) {
			props.app.props.history.push({
				pathname: "/cant-login"
			});
		} else {
			let params = `redirect_uri=${encodeURIComponent(redirect_uri)}`;
			props.app.props.history.push({
				pathname: "/cant-login",
				search: params
			});
		}
	}

	return (
		<Form onSubmit={lsid === undefined ? handleSubmit(onPreludeSubmit) : handleSubmit(onSubmit)}>
			<Card className="shadow auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">
							{props.registerToken == undefined ? t('LoginCard|Login') : t('LoginCard|Accept invitation as a existing user')}
						</CardTitle>
						<CardSubtitle tag="p">
							{t('LoginCard|Login here')}
						</CardSubtitle>
					</div>
				</CardHeader>
				<CardBody>
					{/* ident */}
					<fieldset disabled={isSubmitting || isOnClickSubmitting} className="text-center mb-3">
						<h5>
							<Label for="username" style={{display: "block"}} className='form-label'>
								{t('LoginCard|Username, email or phone')}
							</Label>
						</h5>
						<Input
							id="username"
							name="username"
							type="text"
							title={t('LoginCard|Please fill this field')}
							autoComplete="off"
							autoCapitalize="none"
							autoCorrect="off"
							autoFocus={descriptor === undefined}
							required="required"
							readOnly={lsid !== undefined}
							onChange={usernameRegister.onChange}
							onBlur={usernameRegister.onBlur}
							innerRef={usernameRegister.ref}
						/>
						<FormText>{t('LoginCard|Fill in your login credentials')}</FormText>
					</fieldset>

					<Collapse
						isOpen={descriptor !== undefined}
						onEntered={() => {
							let fi = document.getElementsByClassName("focus-me")[0];
							if (fi !== undefined) fi.focus();
						}}
					>

						{descriptor !== undefined && descriptor.factors.map((factor, idx) => {
							switch(factor.type) {
								case 'password': return(<PasswordField key={idx} register={register} idx={idx} factor={factor} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'keyote': return(<KeyoteField key={idx} register={register} idx={idx} factor={factor} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'yubikey': return(<YubiKeyField key={idx} register={register} idx={idx} factor={factor} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'totp': return(<TOTPField key={idx} register={register} idx={idx} factor={factor} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'webauthn': return(<WebAuthnField app={props.app} key={idx} factor={factor} lsid={lsid} descriptor={descriptor} getValues={getValues} SeaCatAuthAPI={SeaCatAuthAPI} isSubmitting={isOnClickSubmitting} setIsOnClickSubmitting={setIsOnClickSubmitting} clientLoginKey={clientLoginKey} setLoginButtonHidden={setLoginButtonHidden} loginButtonHidden={loginButtonHidden}/>)
								case 'smscode': return(<SMSLoginField app={props.app} key={idx} register={register} idx={idx} factor={factor} SeaCatAuthAPI={SeaCatAuthAPI} lsid={lsid} setLoginButtonHidden={setLoginButtonHidden} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'rememberme': return(<RememberMeField key={idx} register={register} idx={idx} factor={factor} isSubmitting={isSubmitting || isOnClickSubmitting}/>)
								case 'xheader': return // If xheader is among factor types, ignore it
								default: return(<div key={idx}>Unknown factor: "{factor.type}"</div>)
							}
						})}

					</Collapse>

					{!loginButtonHidden && <Row className="justify-content-center">
						<Col>
							<Button
								block
								color="primary"
								disabled={clientLoginKey === null || isSubmitting || isOnClickSubmitting}
								type="submit">{t('LoginCard|Enter')}
							</Button>
						</Col>
					</Row>}

					<Alternatives
						descriptor={descriptor}
						descriptors={descriptors}
						setDescriptor={setDescriptor}
						isSubmitting={isSubmitting || isOnClickSubmitting}
						setLoginButtonHidden={setLoginButtonHidden}
					/>

					{"external" in props.features && <Collapse
						isOpen={descriptor == undefined}
					>
						<hr />
						{props.features["external"] && props.features["external"].map((ext, idx) => (
							<Row key={idx} className="justify-content-center">
								<Col>{
									<ExternalLogin
										ext={ext}
										t={t}
										stateCode={props.stateCode}
										isSubmitting={isSubmitting}
										isOnClickSubmitting={isOnClickSubmitting}
										setIsOnClickSubmitting={setIsOnClickSubmitting}
									/>
								}</Col>
							</Row>
						))}
					</Collapse>}

				</CardBody>

				<CardFooter className="border-top">
					<ButtonGroup className="flex-nowrap w-100">
						<Button
							outline
							className="flex-fill justify-content-center card-footer-button-flex"
							color="primary"
							type="button"
							disabled={isSubmitting || isOnClickSubmitting}
							onClick={() => onReset() }
						>
							{t("LoginCard|Start again")}
						</Button>
						{props.registerToken == undefined ?
						<Button
							outline
							className="flex-fill justify-content-center card-footer-button-flex"
							style={{borderRadius: "0 0 7px 0"}}
							color="primary"
							type="button"
							disabled={isSubmitting || isOnClickSubmitting}
							onClick={() => onCantLogin()}
						>
							{t("LoginCard|Can't login?")}
						</Button>
						:
						<Button
							outline
							className="flex-fill justify-content-center card-footer-button-flex"
							style={{borderRadius: "0 0 7px 0"}}
							color="primary"
							type="button"
							disabled={isSubmitting || isOnClickSubmitting}
							onClick={() => {props.setSwitchCards("register")}}
						>
							{t("LoginCard|Create new registration")}
						</Button>}
					</ButtonGroup>
				</CardFooter>
			</Card>

		</Form>
	);
}


function mapStateToProps(state) {
	return {
		advmode: state.advmode.enabled,
	}
}

export default connect(mapStateToProps)(LoginCard);


function Alternatives(props) {
	const { t, i18n } = useTranslation();
	// Get current language, en is default
	const getCurrentLng = i18n.language || window.localStorage.i18nextLng || 'en';

	if (props.descriptor === undefined) return null;
	if (props.descriptors === undefined) return null;
	if (props.descriptors.length <= 1) return null;

	return (
		<React.Fragment>
			<Row className="justify-content-center pt-4">
				<Col style={{textAlign: "center"}}>
					{t('LoginCard|or')}
				</Col>
			</Row>

			{props.descriptors.map((d, idx) => {
				if (d.id === props.descriptor.id) return null;
				return(
					<Row key={d.id} className="justify-content-center mt-3">
						<Col style={{textAlign: "center"}}>
							<Button
								outline
								block
								color="primary"
								type="button"
								data-descriptor={idx}
								disabled={props.isSubmitting}
								onClick={(e) => {props.setDescriptor(props.descriptors[e.target.dataset.descriptor]), props.setLoginButtonHidden(false), e.preventDefault()}}
							>
								{typeof d.label == "string" ? d.label : d.label[`${getCurrentLng}`]}
							</Button>
						</Col>
					</Row>
				)
			})}
		</React.Fragment>
	)
}


function PasswordField(props) {
	const { t } = useTranslation();
	const reg = props.register(`${props.factor.type}`);
	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<h5>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					{t('LoginCard|Password')}
				</Label>
			</h5>
			<Input
				id={props.factor.type}
				name={props.factor.type}
				type="password"
				autoComplete="current-password"
				required="required"
				className={props.idx == 0 ? "focus-me" : ""}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
		</fieldset>
	);
}


function KeyoteField(props) {
	const { t } = useTranslation();
	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<h5>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					{t('LoginCard|Login with mobile application')}
				</Label>
			</h5>
			<div style={{margin: "0 20% 0 20%"}}>
				<Progress animated color="info" value="100"/>
			</div>
			<p>{t("LoginCard|Confirm the login")}</p>
		</fieldset>
	);
}


function YubiKeyField(props) {
	const { t } = useTranslation();
	const reg = props.register(`${props.factor.type}`);
	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<h5>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					{t('LoginCard|Yubikey')}
				</Label>
			</h5>
			<Input
				id={props.factor.type}
				name={props.factor.type}
				type="text"
				autoComplete="one-time-code"
				required="required"
				className={props.idx == 0 ? "focus-me" : ""}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
		</fieldset>
	);
}


function TOTPField(props) {
	const { t } = useTranslation();
	const reg = props.register(`${props.factor.type}`);
	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<h5>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					{t('LoginCard|OTP Code')}
				</Label>
			</h5>
			<Input
				id={props.factor.type}
				name={props.factor.type}
				type="text"
				autoComplete="one-time-code"
				required="required"
				minLength="6"
				maxLength="6"
				className={props.idx == 0 ? "focus-me" : ""}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
			<FormText color="muted">
				{t('LoginCard|Enter the code from authenticator app')}
			</FormText>
		</fieldset>
	);
}

// WebAuthn login section
function WebAuthnField(props) {
	const { t } = useTranslation();
	const [ webAuthnData, setWebAuthnData ] = useState(undefined);

	/*
		Hide general login button everytime when webAuthn login is used
		with components which change loginButtonHidden state programatically
		e.g. smscode
	*/
	useEffect(() => {
		if (props.loginButtonHidden == false) {
			props.setLoginButtonHidden(true);
		}
	}, [props.loginButtonHidden])

	// Get data from webAuthn call to SeaCatAuth service on webAuthn descriptor
	useEffect(() => {
		if ((props.descriptor != null) && (props.descriptor.factors)) {
			// Getting the data for webAuthn
			if (props.descriptor.factors.some(obj => obj.type === 'webauthn') == true) {
				getWebAuthnDataForAuthentication();
			}
		}
	}, [props.descriptor]);

	// Obtain data for webAuthn
	const getWebAuthnDataForAuthentication = async () => {
		try {
			let response = await props.SeaCatAuthAPI.put('/public/login/'+props.lsid+'/webauthn', {'factor_type': "webauthn", 'descriptor_id': props.descriptor.id});
			if (response.data.result == 'FAILED') {
				throw new Error("Something went wrong, can't proceed with WebAuthn authentication")
			}
			let rData = response.data;
			// Convert all id's in allowCredentials
			let allowCred = [];
			await Promise.all(rData.allowCredentials.map((obj, idx) => {
				// Convert Id from Hex to string
				obj.id = base64url.decode(obj.id);
				allowCred.push(obj);
			}))
			rData["allowCredentials"] = allowCred;
			setWebAuthnData(rData);
		} catch (e) {
			if (e.response.status == 401) {
				props.app.addAlert(
					"danger",
					t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
				);
			} else {
				props.app.addAlert(
					"danger",
					`${t("LoginCard|Something went wrong, can't proceed with WebAuthn authentication")}. ${e?.response?.data?.message}`, 30
				);
			}
			return;
		}
	}

	// onClick function to handle FIDO2/WebAuthn
	const onHandleClick = async (values) => {
		values.descriptor = props.descriptor.id;
		// Store or remove Ident from localstorage based on checked / unchecked checkbox Remember me
		if (values.rememberme !== undefined && values.rememberme) {
			window.localStorage.setItem('SeaCatIdent', values.ident);
		} else {
			if ('SeaCatIdent' in window.localStorage) {
				window.localStorage.removeItem('SeaCatIdent')
			}
		}

		if (webAuthnData) {
			// Add asserted JSON to values under webauthn key
			values.webauthn = await webAuthnLogin();
			// Check if webauthn is undefined and if so, return to prevent multiple error alerts appear
			if (values.webauthn == undefined) {
				return;
			}
		}

		let response;
		try {
			response = await props.SeaCatAuthAPI.put("/public/login/"+props.lsid, values)
		} catch (e) {
			if (e.response.status == 401) {
				props.app.addAlert(
					"danger",
					t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
				);
			} else if (e.response.status == 504) {
				props.app.addAlert(
					"danger",
					t("LoginCard|Can't proceed due to connection problems"), 30
				);
			} else {
				props.app.addAlert(
					"danger",
					`${t("LoginCard|Something went wrong")}. ${e?.response?.data?.message}`, 30
				);
			}
			props.setIsOnClickSubmitting(false);
			return;
		}

		if ((response === undefined) || (response.status != 200)) {
			props.app.addAlert(
				"danger",
				t("LoginCard|Server responded with incorrect response code, please try again"), 30
			);
			props.setIsOnClickSubmitting(false);
			return;
		}

		if (response.data.result !== "OK") {
			props.app.addAlert(
				"danger",
				t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
			);
			props.setIsOnClickSubmitting(false);
			return;
		}

		props.app.addAlert(
			"success",
			t("LoginCard|The login has been successful")
		);

		let redirect_uri;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			let qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(qs);
			redirect_uri = params.get("redirect_uri");
		}

		if (redirect_uri === undefined || redirect_uri === null) {
			redirect_uri = props.app.Config.get('login')?.redirect_uri || '/';
		}

		window.location.replace(redirect_uri);
		// Basically wait forever, until the app is going to be reloaded with window.location.replace
		await new Promise(r => setTimeout(r, 3600*1000));
		props.setIsOnClickSubmitting(false);
	}

	// Function for returning assertion on FIDO2/WebAuthn login
	const webAuthnLogin = async () => {
		// Create public key credential request option object
		const publicKeyCredentialRequestOptions = {
			challenge: Uint8Array.from(
				webAuthnData.challenge, c => c.charCodeAt(0)),
			allowCredentials: webAuthnData.allowCredentials,
			rpId: webAuthnData.rpId,
			userVerification: webAuthnData.userVerification,
			timeout: webAuthnData.timeout,
		}
		// Assert and authenticate publicKey
		let assertion;
		try {
			assertion = await navigator.credentials.get({
				publicKey: publicKeyCredentialRequestOptions
			});
		} catch(e) {
			console.error(e);
			props.app.addAlert("danger", t("LoginCard|Authentication failed, can't identify used authenticator"), 30);
			props.setIsOnClickSubmitting(false);
			return undefined;
		}

		// Parse data to JSON and convert to base64 string
		let assertToJSON = publicKeyValuesToJSON(assertion);
		return assertToJSON;
	}

	return(
		<div className="text-center">
			<h6>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					<span className="cil-shield-alt pe-1" />{t('LoginCard|You will be prompted to login with FIDO2/WebAuthn')}
				</Label>
			</h6>

			<Button
				block
				color="primary"
				disabled={props.clientLoginKey === null || props.isSubmitting}
				onClick={(e) => {onHandleClick(props.getValues()), props.setIsOnClickSubmitting(true), e.preventDefault()}}
				type="button">{t('LoginCard|Click to Enter')}
			</Button>
		</div>
	);
}


function SMSLoginField(props) {

	const { t } = useTranslation();
	const [ codeSent, setCodeSent ] = useState(false);
	const [ disable, setDisable ] = useState(false);
	const reg = props.register(`${props.factor.type}`);

	// Set loginButtonHidden to true when login by SMS is being triggered and codeSent is set to false
	useEffect(() => {
		if (codeSent == false) {
			props.setLoginButtonHidden(true);
		} else {
			props.setLoginButtonHidden(false)
		}
	}, [props.loginButtonHidden])

	const onClick = async () => {
		let response;
		try {
			response = await props.SeaCatAuthAPI.put('/public/login/'+props.lsid+'/smslogin', {'factor_id': props.factor.type});
			if (response.data.result != "OK") {
				props.app.addAlert(
					"danger",
					t("LoginCard|Sending SMS code has failed"), 30
				);
				console.error('Sending SMS code has failed')
				setDisable(false);
				return;
			}
		} catch (err) {
			if (err.response.status == 401) {
				props.app.addAlert(
					"danger",
					t("LoginCard|The provided information is likely incorrect. The login has failed"), 30
				);
			} else {
				props.app.addAlert(
					"danger",
					`${t("LoginCard|Something went wrong")}. ${e?.response?.data?.message}`, 30
				);
			}
			setDisable(false);
			return;
		}

		setCodeSent(true);
		props.setLoginButtonHidden(false);

		document.getElementById(props.factor.type).focus();
	}

	if (codeSent) {
		return(
			<fieldset disabled={props.isSubmitting} className="text-center mb-3">
				<h5>
					<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
						{t('LoginCard|Code from SMS')}
					</Label>
				</h5>
				<Input
					id={props.factor.type}
					name={props.factor.type}
					type="text"
					autoComplete="false"
					autoCorrect="false"
					required="required"
					onChange={reg.onChange}
					onBlur={reg.onBlur}
					innerRef={reg.ref}
					style={{width: "10em", marginLeft: "auto", marginRight: "auto", fontFamily: "monospace"}}
				/>
			</fieldset>
		);
	}

	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<h5>
				<Label for={props.factor.type} style={{display: "block"}} className='form-label'>
					{t('LoginCard|Login by SMS code')}
				</Label>
			</h5>
			<Button
				type="button"
				block
				color="primary"
				disabled={disable}
				onClick={(e) => {onClick(), setDisable(true)}}
			>
				{t('LoginCard|Send SMS code')}
			</Button>
		</fieldset>
	);
}


function RememberMeField(props) {
	const { t } = useTranslation();
	const reg = props.register(`${props.factor.type}`);
	return(
		<fieldset disabled={props.isSubmitting} className="text-center mb-3">
			<CustomInput
				type="checkbox"
				id={props.factor.type}
				name={props.factor.type}
				label={t("LoginCard|Remember me")}
				onChange={reg.onChange}
				onBlur={reg.onBlur}
				innerRef={reg.ref}
			/>
		</fieldset>
	);
}


const ExternalLogin = ({ t, ext, stateCode, isSubmitting, isOnClickSubmitting, setIsOnClickSubmitting }) => {
	let authorize_uri = new URL(ext.authorize_uri);

	if (stateCode) {
		let params = new URLSearchParams(authorize_uri.search);
		params.append("state", stateCode);
		authorize_uri.search = params;
	}

	return (
		<Button
			tag="a"
			block
			outline
			color="primary"
			href={authorize_uri}
			onClick={() => setIsOnClickSubmitting(true)}
			disabled={isSubmitting || isOnClickSubmitting}
		>
			{t("LoginCard|" + ext.label)}
		</Button>
	);
}
