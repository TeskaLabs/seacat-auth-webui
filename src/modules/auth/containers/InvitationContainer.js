import React, { Component } from 'react'
import axios from "axios";
import {
	Container, Row, Col,
	Button,
	CardGroup, Card, CardHeader, CardBody, CardFooter,
	Form, FormGroup, FormFeedback, FormText,
	Input, InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap';
// import {CopyToClipboard} from 'react-copy-to-clipboard';


class InvitationContainer extends Component {

	constructor(props) {
		super(props);

		this.App = props.app;
		this.SeaCatAuthAPI = this.App.axiosCreate('seacat_auth');

		this.state = {
			tenant: '',
			register_token: null,
			loading:false,
			parsedUrl: '',

			tenantsList: null
		};

		this.i18n = {
			title: 'Invitation',
			subtitle: 'Create invitation URL.',
			button: 'Create',
			buttonCopy: 'Copy URL to clipboard',
			tenant_placeholder: 'Select tenant',
			tenant_hint: 'Tenant must be selected to proceed.',
		};

		this.handleInput = this.handleInput.bind(this);
		this.invite = this.invite.bind(this);
		this.parseUrl = this.parseUrl.bind(this);
		this.renderUrl = this.renderUrl.bind(this);
	}


	handleInput(event) {
		if (event.target.value != this.i18n.tenant_placeholder){
			this.setState({
				 [event.target.name]: event.target.value
			});
		} else {
			this.setState({
				 [event.target.name]: null
			});
		}
	}

	componentDidMount() {
		var accessToken = "";
		if (this.App.Modules) {
			this.App.Modules.map((arr) => {
				if (arr.OAuthToken !== undefined){
					accessToken = arr.OAuthToken.access_token
				}
			})
		}

		this.SeaCatAuthAPI.get('/openidconnect/userinfo',
			{ headers: {
				'Authorization': 'Bearer ' + accessToken,
				'Content-Type': 'application/json',
				'Accept' : 'application/json',
			}}
		).then(response => {
			const userInfo = response.data;
			this.setState({
				tenantsList: userInfo.tenants,
			});
		}).catch(error => {
			console.log(error);
			this.App.addAlert("danger", error.toString());
		});

	}

	invite(event) {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		var tenantId = this.state.tenant;
		this.SeaCatAuthAPI.get('/' + tenantId + '/register/invite',
			{ headers: {
				'Content-Type': 'application/json',
				'Accept' : 'application/json',
			}}
		).then(response => {
			const invitation_info = response.data;
			this.setState({
				parsedUrl: this.parseUrl(invitation_info),
			});
		}).catch(error => {
			console.log(error);
			this.App.addAlert("danger", error.toString());
		});
	}

	parseUrl(invitation_info) {
		var baseUrl = window.location.href;
		var regToken = invitation_info["register_token"];

		if (baseUrl.endsWith("/")) {
			baseUrl = baseUrl.slice(0, -1);
		}
		return (baseUrl + '/' + regToken)
	}


	onCopy() {
		this.App.addAlert("success", "URL copied");
	}

	renderUrl() {
		return(
			<Form>
				<div>
					<InputGroup className="mt-4">
						<Input type="textarea" name="text" value={this.state.parsedUrl} readOnly={this.state.parsedUrl}/>
					</InputGroup>
				</div>

				<div>
					<InputGroup className="mt-4">
						{/*<CopyToClipboard text={this.state.parsedUrl}>*/}
							<Button
								block
								color="success"
								onClick={() => { this.onCopy() }}
							>
								{this.i18n.buttonCopy}
							</Button>
						{/*</CopyToClipboard>*/}
					</InputGroup>
				</div>
			</Form>
		)
	}


	render() {
		var { tenantsList } = this.state;
		return (<Container className="animated fadeIn mt-5">
			<Row className="justify-content-center">
				<Col md="6">
					<CardGroup>
						<Card className="auth-card">
							<CardHeader className="text-center">
								<h1>{this.i18n.title}</h1>
								<p className="lead">{this.i18n.subtitle}</p>
							</CardHeader>
							<CardBody style={{minHeight: "15em"}}>
								{(this.state.parsedUrl === '') ?
									<Form onSubmit={(e) => {this.invite(e)}}>
										<div>
											<InputGroup className="mt-4">
											{tenantsList !== null && tenantsList !== undefined ? (
												<Input
												type="select"
												name="tenant"
												id="selectTenant"
												onChange={this.handleInput}>
													<option>{this.i18n.tenant_placeholder}</option>
													{tenantsList.map((tenant) =>
															<option key={tenant}>{tenant}</option>
														)
													}
												</Input>) : <div><p className="text-danger">No tenant available!</p></div>}
											</InputGroup>
											<FormText>{this.i18n.tenant_hint}</FormText>
										</div>

										<InputGroup className="mt-4">
											<Button
												block
												color="primary"
												disabled={this.state.loading || !this.state.tenant}
											>
												{this.state.loading && <span className="spinner-grow spinner-grow-sm ml-1" role="status"></span>}
												{this.i18n.button}
												{this.state.loading && <span className="spinner-grow spinner-grow-sm ml-1" role="status"></span>}
											</Button>
										</InputGroup>
									</Form>
								: this.renderUrl()}
							</CardBody>
						</Card>
					</CardGroup>
				</Col>
			</Row>
		</Container>);
	}
}

export default InvitationContainer;
