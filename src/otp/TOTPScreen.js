import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useHistory, useLocation } from "react-router-dom";

import QRCode from "react-qr-code";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormText, Label, Input, Button, FormFeedback
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";
import generatePenrose from '../utils/generatePenrose';

function TOTPScreen(props) {
	
	generatePenrose();
	
	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="6">
					<SetTOTPCard app={props.app} />
				</Col>
			</Row>
		</Container>
	);
}

export default TOTPScreen;


function SetTOTPCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors } } = useForm();
	let history = useHistory();
	let SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	const [ configURL, setConfigURL ] = useState(undefined);
	const [ secret, setSecret ] = useState(undefined);
	const [ active, setActive ] = useState(false);
	const [ isSubmitting, setIsSubmitting ] = useState(false);

	useEffect(() => {
		getData()
	},[])

	// Confirmation popup window for activation/deactivation of OTP
	const confirmTOTPActivation = (values) => {
		setIsSubmitting(true);
		let msg;
		if (active) {
			msg = t("TOTPScreen|Do you want to deactivate OTP?")
		} else {
			msg = t("TOTPScreen|Do you want to activate OTP?")
		}
		var r = confirm(msg);
		if (r == true) {
			onSubmit(values);
		} else {
			setIsSubmitting(false);
		}
	}

	// Get data from TOTP endpoint
	const getData = async () => {
		let response;
		try {
			response = await SeaCatAuthAPI.get("/public/totp");
			if (response.data.result == 'OK') {
				setActive(response.data.active);
				setConfigURL(response.data.url);
				setSecret(response.data.secret);
			} else {
				props.app.addAlert("danger", t("TOTPScreen|Something went wrong, can't fetch OTP data"), 30);
			}
		} catch (e) {
			console.error(e);
			props.app.addAlert("danger", `${t("TOTPScreen|Something went wrong, can't fetch OTP data")}. ${e?.response?.data?.message}`, 30);
			return;
		}
	}

	const onSubmit = async (values) => {
		// TODO: Submited values (password input) are temporarily not used until universal verifying mechanism will be created in SA
		let response;
		if (active) {
			try {
				response = await SeaCatAuthAPI.put("/public/unset-totp");
				if (response.data.result !== "OK") {
					throw new Error(t("TOTPScreen|Something went wrong, can't deactivate OTP"));
				}
				props.app.addAlert("success", t("TOTPScreen|OTP successfuly deactivated"));
				/*
					To display success message and to redirect to homepage with reloading
					and thus obtaining the new data from userinfo, timeout for 1s has been added.
					React router dom history.goBack() has been replaced with window.location.replace(document.referrer)
					to go back to homepage and reload the page with updated userinfo.

					history.goBack() itself does not trigger the userinfo reload

				*/
				setTimeout(() => {
					window.location.replace(document.referrer);
				}, 1000);
			} catch (e) {
				console.error(e);
				setIsSubmitting(false);
				props.app.addAlert("danger", `${t("TOTPScreen|Something went wrong, can't deactivate OTP")}. ${e?.response?.data?.message}`, 30);
				return;
			}

		} else {
			try {
				response = await SeaCatAuthAPI.put("/public/set-totp",
					JSON.stringify(values),
					{ headers: {
						'Content-Type': 'application/json'
					}});
				if (response.data.result !== "OK") {
					throw new Error(t("TOTPScreen|Something went wrong, can't activate OTP"));
				}
				props.app.addAlert("success", t("TOTPScreen|OTP successfuly activated"));
				if (redirect_uri !== null) {
					let setup = params.get("setup");
					factorChaining(setup, redirect_uri, history);
				} else {
					/*
						To display success message and to redirect to homepage with reloading
						and thus obtaining the new data from userinfo, timeout for 1s has been added.
						React router dom history.goBack() has been replaced with window.location.replace(document.referrer)
						to go back to homepage and reload the page with updated userinfo.

						history.goBack() itself does not trigger the userinfo reload

					*/
					setTimeout(() => {
						window.location.replace(document.referrer);
					}, 1000);
				}
			} catch (e) {
				console.error(e);
				setIsSubmitting(false);
				props.app.addAlert("danger", `${t("TOTPScreen|Something went wrong, can't activate OTP")}. ${e?.response?.data?.message}`, 30);
				return;
			}
		}
	}

	return (
		<Form onSubmit={handleSubmit(confirmTOTPActivation)}>

			<Card className="shadow animated fadeIn auth-card">
				{!active && configURL ?
					<ActivateTOTP
						secret={secret}
						configURL={configURL}
						register={register}
						errors={errors}
						isSubmitting={isSubmitting}
					/>
				:
					<DeactivateTOTP isSubmitting={isSubmitting}/>
				}
				{!redirect_uri &&
					<CardFooter className="border-top">
						<Button
							outline
							color="primary"
							type="button"
							disabled={isSubmitting}
							onClick={() => history.goBack()}
						>
							{t("TOTPScreen|Go back")}
						</Button>
					</CardFooter>
				}
			</Card>

		</Form>
	);
}


function ActivateTOTP(props) {
	const { t, i18n } = useTranslation();
	const reg = props.register("otp",{
		validate: {
			lengthValidation: value => value.length >= 6 || t('TOTPScreen|OTP code is too short')
		}
	});
	return (
		<>
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('TOTPScreen|Manage OTP')}</CardTitle>
					<CardSubtitle tag="p">
						{t('TOTPScreen|Your second login factor')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody className="text-center pb-1">
				<Row className="justify-content-center">
					<Col>
						<h5>{t('TOTPScreen|QR Code')}</h5>
						<span className="d-inline-block" style={{border: "15px solid white"}}>
							<QRCode
								value={props.configURL}
								size={192}
							/>
						</span>
						<br />
						{t('TOTPScreen|Scan with authenticator app')}
					</Col>
				</Row>

				<Row className="justify-content-center">
					<Col>
						<h5>{t('TOTPScreen|The secret')}</h5>
						<code>{props.secret}</code>
					</Col>
				</Row>

				<FormGroup tag="fieldset" disabled={props.isSubmitting} style={{textAlign: "center"}}>
					<Input
						autoFocus
						id="otp"
						name="otp"
						type="text"
						autoComplete="off"
						required="required"
						maxLength="6"
						invalid={props.errors.otp}
						onChange={reg.onChange}
						onBlur={reg.onBlur}
						innerRef={reg.ref}
					/>
					{props.errors.otp ?
						<FormFeedback style={{paddingBottom: "1em"}}>{props.errors.otp.message}</FormFeedback>
						:
						<FormText style={{paddingBottom: "1em"}}>{t('TOTPScreen|Enter the code from authenticator app')}</FormText>
					}

					<Button
						block
						className="justify-content-center"
						color="primary"
						type="submit"
					>
						{t("TOTPScreen|Activate OTP")}
					</Button>
				</FormGroup>
			</CardBody>
		</>
	)
}

function DeactivateTOTP(props) {
	const { t, i18n } = useTranslation();
	return (
		<>
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('TOTPScreen|Manage OTP')}</CardTitle>
					<CardSubtitle tag="p">
						{/*TODO: Better text*/}
						{t('TOTPScreen|Your second login factor')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody className="pb-1">
				<FormGroup style={{textAlign: "center"}}>
					<Button
						block
						className="justify-content-center"
						color="primary"
						type="submit"
						disabled={props.isSubmitting}
					>
						{t("TOTPScreen|Deactivate OTP")}
					</Button>
				</FormGroup>
			</CardBody>
		</>
	)
}
