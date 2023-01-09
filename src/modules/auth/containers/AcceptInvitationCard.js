import React from 'react'
import { useTranslation } from 'react-i18next';

import {
	Row, Col,
	Card, CardHeader, CardTitle,
	CardSubtitle, CardBody,
	Label, Button
} from 'reactstrap';


function AcceptInvitationCard(props) {
	const { t } = useTranslation();
	let SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');


	const updateCredentials = async () => {
		if (props.registerToken == undefined) {
			props.app.addAlert("danger", t("AcceptInvitationCard|Can't proceed, registration token is undefined"));
			props.setIsSubmitting(false);
			return;
		}
		/*
			body is empty as on PUT and POST request
			we should send body in the request for any case.
			On update authorized credentials, we don't want
			to send anything in the body.
		*/
		let body = {};
		let response;
		try {
			// Use public logout
			response = await SeaCatAuthAPI.post(`/public/register/${props.registerToken}?update_current=true`,
				body,
				{ headers: {
					'Content-Type': 'application/json'
				}});
			if (response.data?.result != "OK") {
				throw new Error("Failed to update credentials");
			}
		} catch (e) {
			console.error(e);
			props.app.addAlert("danger", t("AcceptInvitationCard|Failed to update credentials and redirect to the application", {error: e?.response?.data?.message}), 30);
			props.setIsSubmitting(false);
			return;
		}

		props.setRegistrationSuccessful(true);

		/*
			TODO: if redirection for AcceptInvitation card will be needed,
			uncomment and remove `setRegistrationSuccessful(true);` above.
			Otherwise remove the commented lines.
		*/
		// let redirect_uri;
		// let i = window.location.hash.indexOf('?');
		// if (i > -1) {
		// 	let qs = window.location.hash.substring(i+1);
		// 	let params = new URLSearchParams(qs);
		// 	redirect_uri = params.get("redirect_uri");
		// }

		// if (redirect_uri == undefined) {
		// 	redirect_uri = '/';
		// }
		// props.setIsSubmitting(false);
		// window.location.replace(redirect_uri);
		// // Basically wait forever, until the app is going to be reloaded with window.location.replace
		// await new Promise(r => setTimeout(r, 3600*1000));
	}


	return (
		<Card className="shadow auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('AcceptInvitation|Accept invitation')}</CardTitle>
					<CardSubtitle tag="p">
						{t('AcceptInvitationCard|As a logged user')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody>
				<Row className="justify-content-center">
					<h5>
						<Label for="acceptas" style={{display: "block"}}>
							{t(`AcceptInvitationCard|Accept invitation as`)}
							<span className="primary-span">{props.credentials}</span>
						</Label>
					</h5>
				</Row>
				<Row className="justify-content-center">
					<Col>
						<Button
							block
							color="primary"
							disabled={props.isSubmitting}
							type="button"
							onClick={() => {updateCredentials(), props.setIsSubmitting(true)}}
						>
							{t('AcceptInvitationCard|Accept')}
						</Button>
					</Col>
				</Row>
			</CardBody>
		</Card>
	);
}

export default AcceptInvitationCard;