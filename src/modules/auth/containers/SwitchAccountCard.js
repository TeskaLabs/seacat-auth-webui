import React from 'react'
import { useTranslation } from 'react-i18next';

import {
	Row, Col,
	Card, CardHeader, CardTitle,
	CardSubtitle, CardBody,
	Label, Button
} from 'reactstrap';


function SwitchAccountCard(props) {
	const { t } = useTranslation();
	let SeaCatAuthAPI = props.app.axiosCreate('seacat_auth');

	// Redirect to Login with whole URI
	const redirectToLogin = async () => {
		let response;
		try {
			// Use public logout
			response = await SeaCatAuthAPI.put('/public/logout');
			if (response.data?.result != "OK") {
				throw new Error("Silly as it sounds, the logout failed");
			}
		} catch (e) {
			console.error(e);
			props.app.addAlert("danger", t("SwitchAccountCard|Silly as it sounds, the logout failed", {e?.response?.data?.message}), 30);
		}

		// Reload with whole URI string after logout
		window.location.reload();
		// Basically wait forever, until the app is going to be reloaded with window.location.reload
		await new Promise(r => setTimeout(r, 3600*1000));
	}


	return (
		<Card className="shadow auth-card">
			<CardHeader className="border-bottom card-header-login">
				<div className="card-header-title" >
					<CardTitle className="text-primary" tag="h2">{t('SwitchAccountCard|Switch account')}</CardTitle>
					<CardSubtitle tag="p">
						{t('SwitchAccountCard|Switch account here')}
					</CardSubtitle>
				</div>
			</CardHeader>

			<CardBody>
				<Row className="justify-content-center">
					<h5>
						<Label for="switchaccount" style={{display: "block"}}>
							{t(`SwitchAccountCard|Is`)}
							<span className="primary-span">{props.credentials}</span>
							{t(`SwitchAccountCard|not your account?`)}
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
							onClick={() => {redirectToLogin(), props.setIsSubmitting(true)}}
						>
							{t('SwitchAccountCard|Switch account')}
						</Button>
					</Col>
				</Row>
			</CardBody>
		</Card>
	);
}

export default SwitchAccountCard;
