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
						<CardTitle className="text-primary" tag="h2">{t('RegistrationCard|New user?')}</CardTitle>
						<CardSubtitle tag="p">
							{t('New users, please register here')}
						</CardSubtitle>
					</div>
				</CardHeader>
				{/*TODO*/}
				<CardBody>
					...

					<Row className="justify-content-center">
						<Col>
							<Button
								block
								color="primary"
								disabled={props.isSubmitting}
								type="button"
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
