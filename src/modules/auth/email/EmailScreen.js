import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, Input, Button
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";
import generatePenrose from '../utils/generatePenrose';

function EmailScreen(props) {
	generatePenrose();
	
	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="6">
					<ManageEmailCard app={props.app} userinfo={props.userinfo} />
				</Col>
			</Row>
		</Container>
	);
}


function mapStateToProps(state) {
	return { userinfo: state.auth.userinfo }
}

export default connect(mapStateToProps)(EmailScreen);


function ManageEmailCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors } } = useForm();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	let history = useHistory();
	let SeaCatAccountAPI = props.app.axiosCreate('seacat-auth/account');
	let email = props.userinfo?.email;
	let number = props.userinfo?.phone ? props.userinfo.phone : "";

	const [isSubmitting, setIsSubmitting] = useState(false);


	// Confirmation popup window for activation/deactivation of OTP
	const confirmEmailChange = (values) => {
		setIsSubmitting(true);
		let msg = email ? t("EmailScreen|Do you want to change your email?") : t("EmailScreen|Do you want to set the specified email?");
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
			response = await SeaCatAccountAPI.put("/credentials",
				JSON.stringify(values),
				{ headers: {
					'Content-Type': 'application/json'
				}});
			if (response.data.result !== "OK") {
				if (email) {
					throw new Error(t("EmailScreen|Something went wrong, failed to change email"));
				} else {
					throw new Error(t("EmailScreen|Something went wrong, failed to set email"));
				}
			}
			if (email) {
				props.app.addAlert("success", t("EmailScreen|Email has been changed"));
			} else {
				props.app.addAlert("success", t("EmailScreen|Email has been set"));
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
			if (email) {
				props.app.addAlert("danger", `${t("EmailScreen|Failed to change email")}. ${e?.response?.data?.message}`, 30);
			} else {
				props.app.addAlert("danger", `${t("EmailScreen|Failed to set email")}. ${e?.response?.data?.message}`, 30);
			}
			return;
		}

	}

	return (
		<Form onSubmit={handleSubmit(confirmEmailChange)}>

			<Card className="shadow animated fadeIn auth-card">
				<ManageEmail
					email={email}
					number={number}
					errors={errors}
					register={register}
					isSubmitting={isSubmitting}
				/>
				{!redirect_uri &&
					<CardFooter className="border-top">
						<Button
							outline
							color="primary"
							type="button"
							disabled={isSubmitting}
							onClick={() => history.goBack()}
						>
							{t("EmailScreen|Go back")}
						</Button>
					</CardFooter>
				}
			</Card>

		</Form>
	);
}


function ManageEmail(props) {
	const { t, i18n } = useTranslation();
	const reg = props.register("email",{
		validate: {
			emptyInput: value => (props.number.length != 0 || value.length != 0) || t("EmailScreen|Email can't be empty!"),
		}
	});

	return (
		<>
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{props.email ? t('EmailScreen|Change email') : t('EmailScreen|Set email')}</CardTitle>
					<CardSubtitle tag="p">
						{props.email ? t('EmailScreen|Change your email address here') : t('EmailScreen|Set your email address here')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody className="text-center pb-1">
				<FormGroup tag="fieldset" disabled={props.isSubmitting}>
					<Input
						autoFocus
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						invalid={props.errors.email}
						defaultValue={props.email ? props.email : ""}
						onChange={reg.onChange}
						onBlur={reg.onBlur}
						innerRef={reg.ref}
					/>
					{props.errors.email && <FormFeedback>{props.errors.email.message}</FormFeedback>}
				</FormGroup>

				<FormGroup style={{textAlign: "center"}}>
					<Button
						block
						className="justify-content-center"
						color="primary"
						type="submit"
						disabled={props.isSubmitting}
					>
						{t("EmailScreen|Confirm")}
					</Button>
				</FormGroup>
			</CardBody>
		</>
	)
}
