import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useHistory, useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormText, FormFeedback, Label, Input, Button
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";
import generatePenrose from '../utils/generatePenrose';
import {
	validatePasswordLength,
	validatePasswordLowercaseCount,
	validatePasswordUppercaseCount,
	validatePasswordDigitCount,
	validatePasswordSpecialCount,
	PasswordCriteriaFeedback,
} from '../utils/passwordValidation';

function ChangePwdScreen(props) {

	generatePenrose();

	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="6">
					<ChangePwdCard app={props.app} />
				</Col>
			</Row>
		</Container>
	);

}

export default ChangePwdScreen;

function ChangePwdCard(props) {
	const { t } = useTranslation();
	const SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');
	const { handleSubmit, register, getValues, watch, formState: { errors, isSubmitting } } = useForm();

	let history = useHistory();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	const [ completed, setCompleted ] = useState(false);
	const [ passwordCriteria, setPasswordCriteria ] = useState({
		minLength: 10,
	});

	useEffect(() => {
		loadPasswordCriteria();
	}, []);

	const loadPasswordCriteria = async () => {
		try {
			const response = await SeaCatAuthAPI.get('/public/password/policy');
			setPasswordCriteria({
				minLength: response.data?.min_length,
				minLowercaseCount: response.data?.min_lowercase_count,
				minUppercaseCount: response.data?.min_uppercase_count,
				minDigitCount: response.data?.min_digit_count,
				minSpecialCount: response.data?.min_special_count,
			});
		} catch (e) {
			if (e?.response?.status == 404) {
				// Most likely older service version which does not have this endpoint
				console.error(e);
			} else {
				props.app.addAlertFromException(e, t('ChangePwdScreen|Failed to load password criteria'));
			}
		}
	};

	// Password is watched for immediate feedback to the user
	const watchedNewPassword = watch('newpassword', '');
	const validateNewPassword = (value) => ({
		minLength: validatePasswordLength(value, passwordCriteria?.minLength),
		minLowercaseCount: validatePasswordLowercaseCount(value, passwordCriteria?.minLowercaseCount),
		minUppercaseCount: validatePasswordUppercaseCount(value, passwordCriteria?.minUppercaseCount),
		minDigitCount: validatePasswordDigitCount(value, passwordCriteria?.minDigitCount),
		minSpecialCount: validatePasswordSpecialCount(value, passwordCriteria?.minSpecialCount),
	});

	const regOldpwd = register("oldpassword");
	const regNewpwd = register("newpassword", {
		validate: {
			passwordCriteria: (value) => (Object.values(validateNewPassword(value)).every(Boolean)
			|| t('ChangePwdScreen|Password does not meet security requirements')),
		}
	});
	const regNewpwd2 = register("newpassword2", {
		validate: {
			passEqual: value => (value === getValues().newpassword) || t("ChangePwdScreen|Passwords do not match"),
		}
	});

	const onSubmit = async (values) => {
		let response;

		try {
			response = await SeaCatAuthAPI.put("/public/password-change", values)
		} catch (e) {
			props.app.addAlert("danger", `${t("ChangePwdScreen|Something went wrong")}. ${e?.response?.data?.message}`, 30);
			return;
		}

		if (response.data.result == 'FAILED') {
			props.app.addAlert(
				"danger",
				t("ChangePwdScreen|Something went wrong"), 30
			);
			return;
		} else if (response.data.result == 'UNAUTHORIZED') {
			props.app.addAlert(
				"danger",
				t("ChangePwdScreen|The current password is incorrect"), 30
			);
			return;
		}

		if (redirect_uri !== null) {
			let setup = params.get("setup");
			factorChaining(setup, redirect_uri, history);
		}

		setCompleted(true);
	}


	if (completed) {
		return (
			<Card className="shadow animated fadeIn auth-card">
				<CardBody className="text-center pb-1">
					<CardTitle className="mb-0 text-primary" tag="h2">{t('ChangePwdScreen|CompletedChangePwdCard|Password changed')}</CardTitle>
				</CardBody>
				<CardFooter className="border-top">
					<Button
						outline
						color="primary"
						type="button"
						onClick={() => history.goBack()}
					>
						{t("ChangePwdScreen|CompletedChangePwdCard|Go back")}
					</Button>
				</CardFooter>
			</Card>
		)
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="shadow animated fadeIn auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('ChangePwdScreen|Set password')}</CardTitle>
						<CardSubtitle tag="p">
							{t('ChangePwdScreen|Set new password here')}
						</CardSubtitle>
					</div>
				</CardHeader>

				<CardBody className="pb-1">
					<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
						<h5>
							<Label for="oldpassword" style={{display: "block"}}>
								{t('ChangePwdScreen|Current Password')}
							</Label>
						</h5>
						<Input
							autoFocus
							id="oldpassword"
							name="oldpassword"
							type="password"
							autoComplete="off"
							required="required"
							onChange={regOldpwd.onChange}
							onBlur={regOldpwd.onBlur}
							innerRef={regOldpwd.ref}
						/>
					</FormGroup>

					<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
						<h5>
							<Label for="newpassword" style={{display: "block"}}>
								{t('ChangePwdScreen|New Password')}
							</Label>
						</h5>
						<Input
							id='newpassword'
							name='newpassword'
							type='password'
							autoComplete='new-password'
							required='required'
							invalid={Boolean(errors?.newpassword)}
							onBlur={regNewpwd.onBlur}
							innerRef={regNewpwd.ref}
							onChange={regNewpwd.onChange}
						/>
						{errors?.newpassword?.type !== 'passwordCriteria'
							&& <FormFeedback>{errors?.newpassword?.message}</FormFeedback>
						}
						<PasswordCriteriaFeedback
							passwordCriteria={passwordCriteria}
							validatePassword={validateNewPassword}
							watchedPassword={watchedNewPassword}
							passwordErrors={errors?.newpassword}
						/>
					</FormGroup>

					<FormGroup tag="fieldset" disabled={isSubmitting} className="text-center">
						<h5>
							<Label for="newpassword2" style={{display: "block"}}>
								{t('ChangePwdScreen|Re-enter Password')}
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
								{t('ChangePwdScreen|Enter new password a second time to verify it')}
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
							{t("ChangePwdScreen|Set password")}
						</Button>
					</FormGroup>

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
							{t("ChangePwdScreen|Go back")}
						</Button>
					</CardFooter>
				}
			</Card>
		</Form>
	);
}
