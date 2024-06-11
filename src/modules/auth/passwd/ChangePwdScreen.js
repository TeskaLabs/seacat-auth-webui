import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useHistory, useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, Button
} from 'reactstrap';

import { factorChaining } from "../utils/factorChaining";
import generatePenrose from '../utils/generatePenrose';

import {
	PasswordChangeFieldGroup
} from '../containers/FormFields';

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
	const changePasswordForm = useForm();
	const { handleSubmit, formState: { isSubmitting } } = changePasswordForm;

	let history = useHistory();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");

	const [ completed, setCompleted ] = useState(false);

	const onSubmit = async (values) => {
		try {
			const response = await SeaCatAuthAPI.put('/public/password-change', values);

			if (response.data.result !== 'OK') {
				throw new Error(t('ChangePwdScreen|Unexpected server response'));
			}
		} catch (e) {
			if (e?.response?.status == 401 || e?.response?.data?.result == 'UNAUTHORIZED') {
				props.app.addAlert("danger", t('ChangePwdScreen|The current password is incorrect'), 30);
			} else {
				props.app.addAlert("danger", `${t("ResetPwdScreen|Password change failed")}. ${e?.response?.data?.message}`, 30);
			}

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
						<CardTitle className="text-primary" tag="h2">{t('ChangePwdScreen|Password change')}</CardTitle>
						<CardSubtitle tag="p">
							{t('ChangePwdScreen|Set new password here')}
						</CardSubtitle>
					</div>
				</CardHeader>

				<CardBody className="pb-1">
					<PasswordChangeFieldGroup 
						app={props.app}
						form={changePasswordForm}
						oldPasswordInput={true}
					/>

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
