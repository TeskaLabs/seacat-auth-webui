import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useHistory } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormText, Label, Input, Button, FormFeedback
} from 'reactstrap';
import generatePenrose from '../utils/generatePenrose';

function ResetPwdScreen(props) {

	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="6">
					<ResetPwdCard app={props.app} />
				</Col>
			</Row>
		</Container>
	);

}

export default ResetPwdScreen;

function ResetPwdCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors, isSubmitting } } = useForm();

	generatePenrose();
	
	let history = useHistory();

	const [ completed, setCompleted ] = useState(false);

	const isButtonRemoved = props.app.Config.get('password_change')?.remove_btn;

	let i = window.location.hash.indexOf('?');
	let qs = window.location.hash.substring(i+1);
	let params = new URLSearchParams(qs);
	let resetPasswordCode = params.get("pwd_token");

	const regNewpwd = register("newpassword",{
		validate: {
			shortInput: value => (getValues().newpassword.length >= 4) || t("ResetPwdScreen|Short password"),
		}
	});
	const regNewpwd2 = register("newpassword2",{
		validate: {
			passEqual: value => (value === getValues().newpassword) || t("ResetPwdScreen|Passwords do not match"),
		}
	});


	const onSubmit = async (values) => {
		let SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');
		let response;
		values.pwd_token = resetPasswordCode;

		try {
			response = await SeaCatAuthAPI.put("/public/password-reset", values);
			if (response.data.result === 'INVALID-CODE') {
				props.app.addAlert("danger", t("ResetPwdScreen|Invalid password reset link, please set your password again"), 30);
				onRedirect("/cant-login", true);
				return;
			}
			if (response.data.result !== 'OK') {
				throw new Error(t("ResetPwdScreen|Something went wrong, unable to set the password"));
			}
		} catch (e) {
			props.app.addAlert("danger", `${t("ResetPwdScreen|Something went wrong, unable to set the password")}. ${e?.response?.data?.message}`, 30);
			return;
		}
		setCompleted(true);
	}

	const onRedirect = (pathname, isInvalid) => {
		let redirect_uri = getRedirectUri();

		if (redirect_uri === undefined || redirect_uri === null) {
			if (isInvalid) {
				let params = `invalid_code=${isInvalid}`;
				history.push({
					pathname: pathname,
					search: params
				});
				return;
			}
			history.push({
				pathname: pathname
			});
		} else {
			let params = `redirect_uri=${encodeURIComponent(redirect_uri)}`;
			if (isInvalid) {
				params = `${params}&invalid_code=${isInvalid}`;
				history.push({
					pathname: pathname,
					search: params
				});
				return;
			}
			history.push({
				pathname: pathname,
				search: params
			});
		}
	}

	const getRedirectUri = () => {
		let redirect_uri = undefined;
		let i = window.location.hash.indexOf('?');
		if (i > -1) {
			let qs = window.location.hash.substring(i+1);
			let params = new URLSearchParams(qs);
			redirect_uri = params.get("redirect_uri");
		}
		return redirect_uri
	}

	if (completed) {
		return (
			<Card className="shadow animated fadeIn auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('ResetPwdScreen|CompletedResetPwdCard|Password set')}</CardTitle>
					</div>
				</CardHeader>
				<CardBody className="text-center pb-1">
					<FormGroup style={{textAlign: "center"}}>
						{!isButtonRemoved &&
							<Button
								className="justify-content-center"
								block
								color="primary"
								type="submit"
								disabled={isSubmitting}
								onClick={() => onRedirect("/login", false)}
							>
								{t('ResetPwdScreen|CompletedResetPwdCard|Continue')}
							</Button>
						}
					</FormGroup>
				</CardBody>
			</Card>
		)
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="shadow animated fadeIn auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('ResetPwdScreen|Set password')}</CardTitle>
						<CardSubtitle tag="p">
							{t('ResetPwdScreen|Set new password here')}
						</CardSubtitle>
					</div>
				</CardHeader>
				<CardBody className="pb-1">
					<FormGroup tag="fieldset" disabled={isSubmitting} style={{textAlign: "center"}}>
						<h5>
							<Label for="newpassword" style={{display: "block"}}>
								{t('ResetPwdScreen|New Password')}
							</Label>
						</h5>
						<Input
							autoFocus
							id="newpassword"
							name="newpassword"
							type="password"
							invalid={errors.newpassword}
							autoComplete="new-password"
							required="required"
							onBlur={regNewpwd.onBlur}
							innerRef={regNewpwd.ref}
							onChange={regNewpwd.onChange}
						/>
						{errors.newpassword && <FormFeedback>{errors.newpassword.message}</FormFeedback>}
					</FormGroup>

					<FormGroup tag="fieldset" disabled={isSubmitting} style={{textAlign: "center"}}>
						<h5>
							<Label for="newpassword2" style={{display: "block"}}>
								{t('ResetPwdScreen|Re-enter Password')}
							</Label>
						</h5>
						<Input
							id="newpassword2"
							name="newpassword2"
							type="password"
							autoComplete="new-password"
							required="required"
							invalid={errors.newpassword2}
							onChange={regNewpwd2.onChange}
							onBlur={regNewpwd2.onBlur}
							innerRef={regNewpwd2.ref}
						/>

						{errors.newpassword2 ?
							<FormFeedback>{errors.newpassword2.message}</FormFeedback>
							:
							<FormText>
								{t('ResetPwdScreen|Enter new password a second time to verify it')}
							</FormText>
						}
					</FormGroup>

					<FormGroup style={{textAlign: "center"}}>
						<Button
							block
							className="justify-content-center"
							color="primary"
							type="submit"
							disabled={isSubmitting}
						>
							{t("ResetPwdScreen|Set password")}
						</Button>
					</FormGroup>
				</CardBody>
			</Card>
		</Form>
	);
}
