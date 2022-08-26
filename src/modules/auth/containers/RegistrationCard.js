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

// TODO: Registration card has not been implemented yet
function RegistrationCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors, isSubmitting } } = useForm();

	const onSubmit = values => {
		// TODO
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<Card className="shadow auth-card">
				<CardHeader className="border-bottom card-header-login">
					<div className="card-header-title" >
						<CardTitle tag="h1">{t('Registration')}</CardTitle>
						<CardSubtitle tag="p" className="lead">
							{t('New users, please register here.')}
						</CardSubtitle>
					</div>
				</CardHeader>
				{/*TODO*/}
				<CardBody>
					...
				</CardBody>

				<CardFooter>
					<Row className="justify-content-center">
						<Col style={{textAlign: "center"}}>
							<Button color="primary" type="submit">{t('Enter')}</Button>
						</Col>
					</Row>
				</CardFooter>

			</Card>
		</Form>
	);
}

export default RegistrationCard;
