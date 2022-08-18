import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router-dom";

import {
	Container, Row, Col,
	Card, CardHeader, CardTitle, CardBody
} from 'reactstrap';

function MessageScreen(props) {
	return (
		<Container>
			<Row className="justify-content-center">
				<Col md="5" className="mt-3">
					<MessageCard app={props.app} />
				</Col>
			</Row>
		</Container>
	);
}

export default MessageScreen;


function MessageCard(props) {
	const { t, i18n } = useTranslation();

	let params = new URLSearchParams(useLocation().search);
	let redirect_uri = params.get("redirect_uri");
	let successful = params.get("setup_successful");

	// Decode original redirect URI and redirect to Login page after 5 seconds
	setTimeout(() => {
		window.location.replace(decodeURIComponent(redirect_uri));
	}, 5000);

	return (
		successful === 'false' ? <FailedMessage /> : <SuccessMessage />
	);
}

const SuccessMessage = () => {
	const { t, i18n } = useTranslation();
	return(
		<Card className="shadow animated fadeIn auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t("MessageScreen|Setup completed successfully")}</CardTitle>
				</div>
			</CardHeader>
			<CardBody className="text-center">
				{t("MessageScreen|You will be redirected to the Login page")}
			</CardBody>
		</Card>
		)
}

// TODO: Prepared for future implementation
// TODO: Add better messages
const FailedMessage = () => {
	const { t, i18n } = useTranslation();
	return(
		<Card className="shadow animated fadeIn auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t("MessageScreen|Setup has not been completed")}</CardTitle>
				</div>
			</CardHeader>
			<CardBody className="text-center">
				{t("MessageScreen|You will be redirected to the Login page")}
			</CardBody>
		</Card>
		)
}
