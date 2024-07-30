import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useHistory } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody,
	Form, FormGroup, FormText, Label, Input, Button, FormFeedback
} from 'reactstrap';
import generatePenrose from '../utils/generatePenrose';
import { PasswordChangeFieldGroup } from '../containers/FormFields';

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
	const { t } = useTranslation();
	const SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');
	const resetPasswordForm = useForm();
	const { handleSubmit, formState: { isSubmitting } } = resetPasswordForm;

	generatePenrose();

	const history = useHistory();

	const [ completed, setCompleted ] = useState(false);

	const isButtonRemoved = props.app.Config.get('password_change')?.remove_btn;

	let i = window.location.hash.indexOf('?');
	let qs = window.location.hash.substring(i+1);
	let params = new URLSearchParams(qs);
	let resetPasswordCode = params.get("pwd_token");

	const onSubmit = async (values) => {
		let response;
		values.pwd_token = resetPasswordCode;

		try {
			response = await SeaCatAuthAPI.put("/public/password-reset", values);
			if (response.data.result !== 'OK') {
				throw new Error(t("ResetPwdScreen|Something went wrong, unable to set the password"));
			}
		} catch (e) {
			if (e?.response?.status == 401 || e?.response?.data?.result == 'UNAUTHORIZED') {
				props.app.addAlert("danger", t('ResetPwdScreen|Your password reset link has likely expired. Please request a new one.', 30));
				onRedirect("/cant-login", true);
			} else {
				props.app.addAlert("danger", `${t("ResetPwdScreen|Password change failed")}. ${e?.response?.data?.message}`, 30);
			}

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

	if (!resetPasswordCode || resetPasswordCode.length == 0) {
		// Show the "Invalid or expired code, reset your password again" page when there is no password reset code in query
		onRedirect("/cant-login", true);
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
							{t('ResetPwdScreen|Set a new password here')}
						</CardSubtitle>
					</div>
				</CardHeader>
				<CardBody className="pb-1">

					<PasswordChangeFieldGroup
						app={props.app}
						form={resetPasswordForm}
						currentPasswordInput={false}
					/>

					<FormGroup style={{textAlign: "center"}}>
						<Button
							block
							className="justify-content-center"
							color="primary"
							type="submit"
							disabled={isSubmitting}
						>
							{t("ResetPwdScreen|Set new password")}
						</Button>
					</FormGroup>
				</CardBody>
			</Card>
		</Form>
	);
}
