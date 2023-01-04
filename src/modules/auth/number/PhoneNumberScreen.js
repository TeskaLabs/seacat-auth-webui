import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, Label, Input, Button
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";

function PhoneNumberScreen(props) {
	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="5">
					<ManageNumberCard app={props.app} userinfo={props.userinfo} />
				</Col>
			</Row>
		</Container>
	);
}


function mapStateToProps(state) {
	return { userinfo: state.auth.userinfo }
}

export default connect(mapStateToProps)(PhoneNumberScreen);


function ManageNumberCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors } } = useForm();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	let history = useHistory();
	let SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');
	let number = props.userinfo?.phone;
	let email = props.userinfo?.email ? props.userinfo.email : "";

	const [isSubmitting, setIsSubmitting] = useState(false);



	// Confirmation popup window for activation/deactivation of OTP
	const confirmNumberChange = (values) => {
		setIsSubmitting(true);
		let msg = number ? t("PhoneNumberScreen|Do you want to change your number?") : t("PhoneNumberScreen|Do you want to set the specified number?");
		var r = confirm(msg);
		if (r == true) {
			onSubmit(values);
		} else {
			setIsSubmitting(false);
		}
	}


	const onSubmit = async (values) => {
		let response;
		try {
			response = await SeaCatAuthAPI.put("/public/credentials",
				JSON.stringify(values),
				{ headers: {
					'Content-Type': 'application/json'
				}});

			if (response.data.result !== "OK") {
				if (number) {
					throw new Error(t("PhoneNumberScreen|Something went wrong, failed to change phone number"));
				} else {
					throw new Error(t("PhoneNumberScreen|Something went wrong, failed to set phone number"));
				}
			}

			if (number) {
				props.app.addAlert("success", t("PhoneNumberScreen|Phone number has been changed"));
			} else {
				props.app.addAlert("success", t("PhoneNumberScreen|Phone number has been set"));
			}

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
			if (number) {
				props.app.addAlert("danger", t("PhoneNumberScreen|Failed to change phone number"));
			} else {
				props.app.addAlert("danger", t("PhoneNumberScreen|Failed to set phone number"));
			}
			return;
		}

	}

	return (
		<Form onSubmit={handleSubmit(confirmNumberChange)}>

			<Card className="shadow animated fadeIn auth-card">
				{number ?
					<ChangeNumber
						number={number}
						email={email}
						errors={errors}
						register={register}
						isSubmitting={isSubmitting}
					/>
				:
					<SetNumber
						errors={errors}
						register={register}
						isSubmitting={isSubmitting}
					/>
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
							{t("PhoneNumberScreen|Go back")}
						</Button>
					</CardFooter>
				}
			</Card>

		</Form>
	);
}


function ChangeNumber(props) {
	const { t, i18n } = useTranslation();
	const reg = props.register("phone",{
		validate: {
			regexValidation: value => (/^(?=.*[0-9])[+ 0-9]+$/).test(value) || value.length < 1 || t('PhoneNumberScreen|Invalid phone number format'),
			lengthValidation: value => value.length >= 9 || value.length < 1 || t('PhoneNumberScreen|Phone number is too short'),
			emptyInput: value => (props.email.length != 0 || value.length != 0) || t("PhoneNumberScreen|Phone cannot be empty!")
		}
	});

	return (
		<>
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('PhoneNumberScreen|Change number')}</CardTitle>
					<CardSubtitle tag="p">
						{t('PhoneNumberScreen|Change your phone number here')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody className="text-center pb-1">
				<FormGroup tag="fieldset" disabled={props.isSubmitting}>
					<Input
						autoFocus
						type="text"
						id="phone"
						name="phone"
						maxLength="17"
						invalid={props.errors.phone}
						onChange={reg.onChange}
						onBlur={reg.onBlur}
						innerRef={reg.ref}
						defaultValue={props.number}
					/>
					{props.errors.phone && <FormFeedback>{props.errors.phone.message}</FormFeedback>}
				</FormGroup>

				<FormGroup style={{textAlign: "center"}}>
					<Button
						className="justify-content-center"
						block
						color="primary"
						type="submit"
						disabled={props.isSubmitting}
					>
						{t("PhoneNumberScreen|Confirm")}
					</Button>
				</FormGroup>
			</CardBody>
		</>
	)
}


function SetNumber(props) {
	const { t, i18n } = useTranslation();
	const reg = props.register("phone",{
		validate: {
			regexValidation: value => (/^(?=.*[0-9])[+ 0-9]+$/).test(value) || t('PhoneNumberScreen|Invalid phone number format'),
			lengthValidation: value => value.length >= 9 || t('PhoneNumberScreen|Phone number is too short')
		}
	});

	return (
		<>
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('PhoneNumberScreen|Set number')}</CardTitle>
					<CardSubtitle tag="p">
						{t('PhoneNumberScreen|Set your phone number here')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody className="text-center pb-1">
				<FormGroup tag="fieldset" disabled={props.isSubmitting}>
					<Input
						autoFocus
						type="text"
						id="phone"
						name="phone"
						invalid={props.errors.phone}
						maxLength="17"
						onChange={reg.onChange}
						onBlur={reg.onBlur}
						innerRef={reg.ref}
						defaultValue={props.number}
					/>
					{props.errors.phone && <FormFeedback>{props.errors.phone.message}</FormFeedback>}
				</FormGroup>

				<FormGroup style={{textAlign: "center"}}>
					<Button
						block
						className="justify-content-center"
						color="primary"
						type="submit"
						disabled={props.isSubmitting}
					>
						{t("PhoneNumberScreen|Confirm")}
					</Button>
				</FormGroup>
			</CardBody>
		</>
	)
}
