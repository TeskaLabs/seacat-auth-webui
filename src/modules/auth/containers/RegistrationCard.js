import React from 'react'
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, FormText,
	Label, Input, InputGroup, InputGroupAddon, InputGroupText,
	Button
} from 'reactstrap';

import {
	PhoneField,
	EmailField,
	PasswordField,
	UserNameField
} from './FormFields';

function RegistrationCard(props) {
	const { t, i18n } = useTranslation();
	const SeaCatAuthAPI = props.app.axiosCreate('seacat-auth');

	const { handleSubmit, register, getValues, setValue, formState: { errors, isSubmitting } } = useForm();

	/*
		TODO: implement option to save values with this endpoint and avoid validation
		This option will not register user, but it will enable them to save the already
		filled input data (on press Save)
	*/
	const onSubmit = async (values) => {
		let body = values;
		delete body["password2"];
		Promise.all(Object.keys(body).map((key, i) => {
			if ((body[key] == undefined) || (body[key].length == 0)) {
				delete body[key];
			}
		}))

		// Save registered inputs
		try {
			const response = await SeaCatAuthAPI.put(`/public/register/${props.registerToken}`,
				body,
				{ headers: {
					'Content-Type': 'application/json'
				}}
				);
			if (response.data?.result != "OK") {
				throw new Error({ result: response.data.result });
			}
		} catch (e) {
			console.error("Failed to register: ", e);
			props.app.addAlert("danger", `${t("RegistrationCard|Failed to register")}. ${e?.response?.data?.message}`, 30);
			return;
		}

		// Validate registration
		try {
			const response = await SeaCatAuthAPI.post(`/public/register/${props.registerToken}`,
				{},
				{ headers: {
					'Content-Type': 'application/json'
				}}
				);
			if (response.data?.result != "OK") {
				throw new Error({ result: response.data.result });
			}
		} catch (e) {
			console.error("Failed to confirm registration: ", e);
			props.app.addAlert("danger", `${t("RegistrationCard|Failed to confirm registration")}. ${e?.response?.data?.message}`, 30);
			return;
		}

		props.setRegistrationSuccessful(true);
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="shadow auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('RegistrationCard|Accept invitation as a new user')}</CardTitle>
						<CardSubtitle tag="p">
							{t('RegistrationCard|If you are a new user, please register here')}
						</CardSubtitle>
					</div>
				</CardHeader>
				{/*TODO*/}
				<CardBody>
					{props.registerFeatures && props.registerFeatures?.credentials && Object.keys(props.registerFeatures?.credentials).map((key, idx) => {
						switch(key) {
							case 'username': return(<UserNameField key={idx} content={props.registerFeatures?.credentials?.username} register={register} getValues={getValues} setValue={setValue} errors={errors} />)
							case 'email': return(<EmailField key={idx} content={props.registerFeatures?.credentials?.email} register={register} getValues={getValues} setValue={setValue} errors={errors} />)
							case 'password': return(<PasswordField key={idx} content={props.registerFeatures?.credentials?.password} register={register} getValues={getValues} setValue={setValue} errors={errors} />)
							case 'phone': return(<PhoneField key={idx} content={props.registerFeatures?.credentials?.phone} register={register} getValues={getValues} setValue={setValue} errors={errors} />)
							default: return(<div key={idx}>Unknown item: "{key}"</div>)
						}
					})}

					<Row className="justify-content-center">
						<Col>
							<Button
								block
								color="primary"
								disabled={props.isSubmitting}
								type="submit"
							>
								{t('RegistrationCard|Register')}
							</Button>
						</Col>
					</Row>
				</CardBody>
				<CardFooter className="border-top">
					<Button
						color="primary"
						outline
						className="flex-fill justify-content-center card-footer-button-flex"
						style={{borderRadius: "0 0 7px 7px"}}
						onClick={() => {props.setSwitchCards("login")}}
					>
						{t('RegistrationCard|Accept invitation as a existing user')}
					</Button>
			</CardFooter>
			</Card>
		</Form>
	);
}

export default RegistrationCard;
