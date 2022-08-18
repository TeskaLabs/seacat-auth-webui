import React, { Component } from 'react';
import axios from "axios";
import {
	Container, Row, Col,
	Button,
	CardGroup, Card, CardHeader, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, FormText,
	Input, InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap';
import RegistrationCard from './RegistrationCard';
import LoginCard from './LoginCard'

class EntryContainer extends Component {

	constructor(props) {
		super(props);

		this.App = props.app;
		this.SeaCatAuthAPI = this.App.axiosCreate('seacat_auth');

		this.url = window.location.href;

		this.state = {
			tenant: '',
			key: null,
			register_token: null,
			loading:false,
			features: null,
		};

		this.i18n = {
			titleRegister: 'Register',
			subtitleRegister: 'If you do not have an account.',
			titleLogin: 'Login',
			subtitleLogin: 'If you have an account.',
			subtitleTenant: 'You have been invited to:',
			tenant_placeholder: 'Tenant',
			tenant_hint: 'Provide an existing tenant.',
		};

	}


	componentDidMount() {
		var invitationToken = this.url.split("/").pop()
		const that = this;

		this.SeaCatAuthAPI.get('/public/invitation/' + invitationToken,
			{ headers: {
				'Content-Type': 'application/json',
				'Accept' : 'application/json',
			}}
		).then(response => {
			const invitation_info = response.data;
			// If key is present in the response use cryptography
			if (invitation_info["key"] === undefined) {
				this.setState({
					register_token: invitation_info["register_token"],
					features: invitation_info["features"],
					tenant: invitation_info["tenant"],
				});

			} else {
				window.crypto.subtle.importKey(
					"jwk",
					invitation_info["key"][0],
					{ name: "AES-GCM" },
					false,
					["encrypt", "decrypt"]
				)
				.then(function(key){
					this.setState({
						key: key,
						register_token: invitation_info["register_token"],
						features: invitation_info["features"],
						tenant: invitation_info["tenant"],
					});
				}.bind(this))
				.catch(function(err){
					console.error(err);
					this.App.addAlert("danger", err.toString());
				});
			}
		}).catch(error => {
			console.log(error);
			this.App.addAlert("danger", error.toString());
		});;
	}


	render() {
		return (<Container className="animated fadeIn">
			<Row className="justify-content-center">
				<Col md="6">
					<CardGroup>
						<Card className="auth-card">
							<CardHeader className="text-center">
								<h1>{this.i18n.titleRegister}</h1>
								<p className="lead">{this.i18n.subtitleRegister}</p>
								<p>{this.i18n.subtitleTenant} <b>{this.state.tenant}</b></p>
							</CardHeader>
							<CardBody style={{minHeight: "20em"}}>
								{(this.state.register_token === null || this.state.features === null) ?
									<span>Loading ...</span>
								:
									<RegistrationCard
										history={this.props.history}
										enckey={this.state.key}
										token={this.state.register_token}
										features={this.state.features}
										tenant={this.state.tenant}
										app={this.App}
									/>
								}

							</CardBody>
						</Card>
					</CardGroup>
				</Col>
				<Col md="6">
					<CardGroup>
						<Card className="auth-card">
							<CardHeader className="text-center">
								<h1>{this.i18n.titleLogin}</h1>
								<p className="lead">{this.i18n.subtitleLogin}</p>
								<p>{this.i18n.subtitleTenant} <b>{this.state.tenant}</b></p>
							</CardHeader>
							<CardBody style={{minHeight: "20em"}}>
								{(this.state.register_token === null || this.state.features === null) ?
									<span>Loading ...</span>
								:
									<LoginCard
										history={this.props.history}
										enckey={this.state.key}
										token={this.state.register_token}
										features={this.state.features}
										tenant={this.state.tenant}
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

export default EntryContainer;
