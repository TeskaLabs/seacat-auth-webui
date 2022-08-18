import React, { Component } from 'react'
import {
	Container, Row, Col,
	CardGroup, Card, CardHeader, CardBody, CardFooter,
} from 'reactstrap';

import RegistrationCard from './RegistrationCard';


class RegistrationContainer extends Component {

	constructor(props) {
		super(props);
		this.App = props.app;
		this.SeaCatAuthAPI = this.App.axiosCreate('seacat_auth');

		this.state = {
			key: null,
			register_token: null,
			features: null,
			defaultTenant: null,
		};

		this.i18n = {
			title: 'Registration',
			subtitle: 'Speed trumps perfection.',
		}

		this.refresh();
	}

	refresh() {
		const that = this;
		this.SeaCatAuthAPI.get('/public/register',
			{ headers: {
				'Content-Type': 'application/json',
				'Accept' : 'application/json',
			}}
		).then(response => {
			const registration_info = response.data;
			// If key is present in the response use cryptography
			if (registration_info["key"] === undefined){
				that.setState({
					register_token: registration_info["register_token"],
					features: registration_info["features"],
				});
			} else {
				window.crypto.subtle.importKey(
					"jwk",
					registration_info["key"][0],
					{ name: "AES-GCM" },
					false,
					["encrypt", "decrypt"]
				)
				.then(function(key){
					that.setState({
						key: key,
						register_token: registration_info["register_token"],
						features: registration_info["features"],
					});
				})
				.catch(function(err){
					console.error(err);
					this.App.addAlert("danger", err.toString());
				});
			}
		}).catch(error => {
			console.log(error);
			this.App.addAlert("danger", error.toString());
		});

		// Get default tenant
		this.SeaCatAuthAPI.get('/public/tenant_propose',
			{ headers: {
				'Content-Type': 'application/json',
				'Accept' : 'application/json',
			}}
		).then(response => {
			that.setState({
				defaultTenant: response.data.tenant_id,
			});
		}).catch(error => {
			console.log(error);
			this.App.addAlert("danger", error.toString());
		});
	}


	render() {
		return (<Container className="animated fadeIn">
			<Row className="justify-content-center">
				<Col md="6">
					<CardGroup>
						<Card className="auth-card">
							<CardHeader className="border-bottom card-header-login">
								<div className="card-header-title" >
									<h1>{this.i18n.title}</h1>
									<p className="lead">{this.i18n.subtitle}</p>
								</div>
							</CardHeader>
							<CardBody style={{minHeight: "20em"}}>
								{(this.state.register_token == null || this.state.defaultTenant == null || this.state.features == null) ?
									<span>Loading ...</span>
									:
									<RegistrationCard
										history={this.props.history}
										enckey={this.state.key}
										token={this.state.register_token}
										features={this.state.features}
										defaultTenant={this.state.defaultTenant}
										app={this.App}
									/>
								}
							</CardBody>
						</Card>
					</CardGroup>
				</Col>
			</Row>
		</Container>);
	}
}

export default RegistrationContainer;
