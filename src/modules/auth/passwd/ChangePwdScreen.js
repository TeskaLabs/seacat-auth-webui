import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useHistory, useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormText, FormFeedback, Label, Input, Button
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";

function ChangePwdScreen(props) {

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
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors, isSubmitting } } = useForm();

	let history = useHistory();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	const [ completed, setCompleted ] = useState(false);

	const regOldpwd = register("oldpassword");
	const regNewpwd = register("newpassword",{
		validate: {
			shortInput: value => (getValues().newpassword.length >= 4)|| t("ChangePwdScreen|Short password"),
		}
	});
	const regNewpwd2 = register("newpassword2",{
		validate: {
			passEqual: value => (value === getValues().newpassword) || t("ChangePwdScreen|Passwords do not match"),
		}
	});

	const onSubmit = async (values) => {
		let SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');
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
						<Col className='text-center'>
							<h5>
								<Label for="oldpassword" className='d-block form-label'>
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
								disabled={isSubmitting}
							/>

							<h5 className='mt-3'>
								<Label for="newpassword" className='d-block form-label'>
									{t('ChangePwdScreen|New Password')}
								</Label>
							</h5>
							<Input
								id="newpassword"
								name="newpassword"
								type="password"
								autoComplete="new-password"
								required="required"
								invalid={errors.newpassword}
								onBlur={regNewpwd.onBlur}
								innerRef={regNewpwd.ref}
								onChange={regNewpwd.onChange}
								disabled={isSubmitting}
							/>
							{errors.newpassword && <FormFeedback>{errors.newpassword.message}</FormFeedback>}

							<h5 className='mt-3'>
								<Label for="newpassword2" className='d-block form-label'>
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
								disabled={isSubmitting}
							/>
							{errors.newpassword2 ?
								<FormFeedback>{errors.newpassword2.message}</FormFeedback>
								:
								<FormText>
									{t('ChangePwdScreen|Enter new password a second time to verify it')}
								</FormText>
							}
							<Button
								block
								className="my-3"
								color="primary"
								type="submit"
								disabled={isSubmitting}
							>
								{t("ChangePwdScreen|Set password")}
							</Button>
						</Col>

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
