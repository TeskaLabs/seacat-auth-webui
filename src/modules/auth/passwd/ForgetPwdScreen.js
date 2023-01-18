import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useHistory } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormText, FormGroup, Label, Input, Button
} from 'reactstrap';

function ForgetPwdScreen(props) {

	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="6" className="mt-3">
					<ForgetPwdCard app={props.app} />
				</Col>
			</Row>
		</Container>
	);

}

export default ForgetPwdScreen;



function ForgetPwdCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors, isSubmitting } } = useForm();
	let history = useHistory();

	const [ completed, setCompleted ] = useState(false);
	let invalidCode = getParams("invalid_code");

	const usernameRegister = register('username');

	const onSubmit = async (values) => {
		/* 
			'username' to 'ident' conversion is necessary here as the put request expects identity information key labeled 
			as 'ident'. in our form, we use 'username' to prevent browsers from mistakingly recognizing 
			<input name='ident' key='ident'/> as a credit card info field.
		*/
		values["ident"] = values["username"];
		delete values["username"];
		let SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');
		let redirect_uri = getParams("redirect_uri");

		// Append redirect_uri to the values payload
		values["redirect_uri"] = encodeURIComponent(redirect_uri);
		let response;
		try {
			response = await SeaCatAuthAPI.put("/public/lost-password", values);
			if (response.data.result !== 'OK') {
				throw new Error(t("ForgetPwdScreen|Something went wrong, can't reset the password"));
			}
		} catch (e) {
			props.app.addAlert(
				"danger",
				t("ForgetPwdScreen|Something went wrong, can't reset the password", {error: e?.response?.data?.message}), 30
			);
			return;
		}

		setCompleted(true);

		// TODO: implement better solution how to set a paramter in url when pwd link has been sent successfully / unsuccessfully
		if (redirect_uri === undefined || redirect_uri === null) {
			let params = "pwdlinksent=true";
			history.push({
				pathname: "/cant-login",
				search: params
			});
		} else {
			let params = `redirect_uri=${encodeURIComponent(redirect_uri)}&pwdlinksent=true`;
			history.push({
				pathname: "/cant-login",
				search: params
			});
		}
	}


	const onRedirect = () => {
		let redirect_uri = getParams("redirect_uri");

		if (redirect_uri === undefined || redirect_uri === null) {
			history.push({
				pathname: "/login"
			});
		} else {
			let params = `redirect_uri=${encodeURIComponent(redirect_uri)}`;
			history.push({
				pathname: "/login",
				search: params
			});
		}
	}


	function getParams(param) {
		let parameter = undefined;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			let qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(qs);
			parameter = params.get(param);
		}
		return parameter;
	}

	if (completed) {
		return (
			<Card className="shadow animated fadeIn auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('ForgetPwdScreen|CompletedPwdResetCard|Password reset')}</CardTitle>
						<CardSubtitle tag="p" className="mt-0">
							{t('ForgetPwdScreen|CompletedPwdResetCard|Check your email or sms for instructions')}
						</CardSubtitle>
					</div>
				</CardHeader>
				<CardBody className="text-center">
					<Row>
						<Col>
							<Button
								block
								color="primary"
								type="submit"
								disabled={isSubmitting}
								onClick={() => onRedirect()}
							>
								{t("ForgetPwdScreen|CompletedPwdResetCard|Continue")}
							</Button>
						</Col>
					</Row>

				</CardBody>
			</Card>
		)
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="animated fadeIn auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{!invalidCode ? t("ForgetPwdScreen|Can't login?") : t('ForgetPwdScreen|Invalid password reset link')}</CardTitle>
						<CardSubtitle tag="p">
							{!invalidCode ? t('ForgetPwdScreen|Reset password here') : t('ForgetPwdScreen|The link has expired, you can reset your password here')}
						</CardSubtitle>
					</div>
				</CardHeader>

				<CardBody className="pb-1">

					{/* ident */}
					<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
						<h5>
							<Label for="username" style={{display: "block"}}>
								{t('ForgetPwdScreen|Username, email or phone')}
							</Label>
						</h5>
						<Input
							autoFocus
							id="username"
							name="username"
							type="text"
							title={t('ForgetPwdScreen|Please fill this field')}
							autoComplete="off"
							autocapitalization="off"
							autoCorrect="off"
							required="required"
							onChange={usernameRegister.onChange}
							onBlur={usernameRegister.onBlur}
							innerRef={usernameRegister.ref}
						/>
						<FormText>{t('ForgetPwdScreen|Fill in your login credentials')}</FormText>
					</FormGroup>

					<FormGroup style={{textAlign: "center"}}>
						<Button
							block
							className="justify-content-center"
							color="primary"
							type="submit"
							disabled={isSubmitting}
						>
							{t("ForgetPwdScreen|Reset password")}
						</Button>

						<p className="text-center mt-1">
							{t('ForgetPwdScreen|You will receive instructions')}
						</p>
					</FormGroup>

				</CardBody>

				{!invalidCode &&
				<CardFooter className="border-top">
					<Button
						outline
						color="primary"
						type="button"
						disabled={isSubmitting}
						onClick={() => history.goBack()}
					>
						{t("ForgetPwdScreen|Go back")}
					</Button>
				</CardFooter>}
			</Card>
		</Form>
	);
}
