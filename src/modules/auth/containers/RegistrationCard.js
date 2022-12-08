import React, { Component } from 'react'
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, FormText,
	Label, Input, InputGroup, InputGroupAddon, InputGroupText,
	Collapse,
	Button
} from 'reactstrap';

import {
	PhoneField,
	EmailField,
	PasswordField,
	UserNameField
} from './FormFields';

// TODO: Registration card has not been implemented yet
function RegistrationCard(props) {
	const { t, i18n } = useTranslation();

	const { handleSubmit, register, getValues, setValue, formState: { errors, isSubmitting } } = useForm();

	const onSubmit = values => {
		console.log(values, "VALUES")
		// TODO
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="shadow auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle className="text-primary" tag="h2">{t('RegistrationCard|New user?')}</CardTitle>
						<CardSubtitle tag="p">
							{t('If you are a new users, please register here')}
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

			</Card>
		</Form>
	);
}

export default RegistrationCard;
