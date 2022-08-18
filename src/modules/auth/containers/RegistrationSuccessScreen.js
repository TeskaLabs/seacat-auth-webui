import React, { Component } from 'react';
import {
	Container, Row, Col,
	Button,
	CardGroup, Card, CardHeader, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, FormText,
	Input, InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap';
import { useHistory } from "react-router-dom";

import { useTranslation } from 'react-i18next';


function SuccessContainer(props) {
	const { t, i18n } = useTranslation();
	let history = useHistory();

	return (
		<Container className="animated fadeIn">
			<Row className="justify-content-center">
				<Col md="6">
					<CardGroup>
						<Card className="auth-card">
							<CardBody className="text-center">
								<h1>{t("RegistrationSuccessScreen|Successful registration")}</h1>
								<p className="lead">{t("RegistrationSuccessScreen|Welcome")}</p>

								<div className="mt-4">
									<Button
										block
										color="primary"
										type="button"
										onClick={() => history.push("/")}
									>
										{t("RegistrationSuccessScreen|Continue")}
									</Button>
								</div>
							</CardBody>
						</Card>
					</CardGroup>
				</Col>
			</Row>
		</Container>
	);
}

export default SuccessContainer;

