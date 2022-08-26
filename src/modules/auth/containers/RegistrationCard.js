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


function RegistrationCard(props) {
	const { t, i18n } = useTranslation();
	const { handleSubmit, register, getValues, formState: { errors, isSubmitting } } = useForm();

	const onSubmit = values => {
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

/*
class RegistrationCard extends Component {

	constructor(props) {
		super(props);

		this.App = props.app;
		this.SeaCatAuthAPI = this.App.axiosCreate('seacat_auth');

		this.register_token = props["token"];
		this.enckey = props["enckey"];
		this.inviteTenant = props["tenant"]; // Fetch tenant from invitation, initially inviteTenant = undefined
		this.defaultTenant = props["defaultTenant"]; // Fetch default tenant

		this.state = {

			features_email: (props.features.indexOf("email") > -1),
			email: '',
			validation_email: null,

			features_password: (props.features.indexOf("password") > -1),
			password: '',
			password2: '',
			validation_password: null,
			validation_password2: null,

			features_tenant: (props.features.indexOf("tenant") > -1),
			tenant: '',
			validation_tenant: null,

			readOnly: true,
			loading:false,

		};

		this.i18n = {
			email_placeholder: 'Email',
			email_hint: 'Provide an valid email.',
			password_placeholder: 'Password',
			password_hint: 'Use 8 or more characters with a mix of letters, numbers and symbols.',
			password2_placeholder: 'Confirm the password',
			password2_hint: 'Both passwords have to match.',
			tenant_hint: 'Change default tenant name.',
			button: 'Register',
			footer: 'By clicking this button, you agree to "Terms and Conditions" and "Privacy Policy". We guarantee that your email is safe with us.',
		}


		this.handleInput = this.handleInput.bind(this);
		this.register = this.register.bind(this);
		this.changeTenant = this.changeTenant.bind(this);
	}

	changeTenant() {
		this.setState(prevState => ({readOnly: !prevState.readOnly}))
	}


	handleInput(event) {
		this.setState({
			 [event.target.name]: event.target.value
		});
	}

	validate() {
		var validation_email = null;
		var validation_password = null;
		var validation_password2 = null;
		var validation_tenant = null;

		if (this.state.features_email) {
			if (this.state.email == '') {
				validation_email = "Email needs to be provided!";
			} else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)) {
				validation_email = "Provide a valid email address!";
			}
			// TODO: Other email validations
		}

		if (this.state.features_password) {
			if (this.state.password.length < 8) {
				validation_password = "Password is too short!";
			}

			// TODO: Other password strength validations

			// Validate password match
			if (this.state.password != this.state.password2) {
				validation_password2 = "Passwords don't match!";
			}
		}

		if (this.state.features_tenant) {
			if (!this.state.readOnly) {
				if (this.state.tenant.length < 2) {
					validation_tenant = "Tenant is too short!";
				}
			}

		}

		this.setState({
			validation_email: validation_email,
			validation_password: validation_password,
			validation_password2: validation_password2,
			validation_tenant: validation_tenant,
		});

		return (validation_email == null) && (validation_password == null) && (validation_password2 == null) && (validation_tenant == null);
	}


	register(event) {
		event.preventDefault();

		if (!this.validate()) {
			return;
		}

		this.setState({
			loading: true,
		});

		const that = this;
		var payload = {};

		if (this.state.features_email) {
			payload["email"] = this.state.email
		}

		if (this.state.features_password) {
			payload["password"] = this.state.password
		}

		if (this.state.features_tenant) {
			if (!this.state.readOnly) {
				payload["tenant"] = this.state.tenant
			} else {
				payload["tenant"] = this.defaultTenant
			}
		} else if (this.inviteTenant !== undefined) {
			payload["tenant"] = this.inviteTenant
		}

		var payload = JSON.stringify(payload);
		var enc = new TextEncoder();

		// If key is present use cryptography
		if (this.enckey == null) {
			this.SeaCatAuthAPI.post('/public/register/' + that.register_token,
				payload,
				{ headers: {
					'Content-Type': 'application/json',
					'Accept': '*' + '/' +'*'
				}},
			).then(response => {
				that.setState({status: response.status});
				that.setState({loading: false});
				if (response.status != 200) {
					this.App.addAlert("danger", "Server error. Try again shortly.");
					return;
				}

				if (response.data['result'] != 'OK') {
					this.App.addAlert("danger", "Registration failed.");
					return;
				}

				that.props.history.push('/registration/success');

			}).catch(error => {
				console.log(error);
				this.App.addAlert("danger", "General error. Try again shortly.");
				that.setState({
					loading: false,
				});

			});
		} else {
			// Encrypt the payload by an AES key that we received from a server
			const iv = window.crypto.getRandomValues(new Uint8Array(12));
			window.crypto.subtle.encrypt(
				{
					name: "AES-GCM",
					iv: iv,
					additionalData: enc.encode(that.register_token),
					tagLength: 128,
				},
				this.enckey, //from importKey
				enc.encode(payload)
			)
			.then(function(encrypted) {
				this.SeaCatAuthAPI.post('/public/register/' + that.register_token,
					concatUint8ArrayAndArrayBuffer(iv, encrypted),
					{ headers: {
						'Content-Type': 'application/octec-stream',
						'Accept' : 'application/json',
					}},
				).then(response => {
					that.setState({status: response.status});
					that.setState({loading: false});

					if (response.status != 200) {
						this.App.addAlert("danger", "Server error. Try again shortly.");
						return;
					}

					if (response.data['result'] != 'OK') {
						this.App.addAlert("danger", "Registration failed.");
						return;
					}

					that.props.history.push('/registration/success');

				}).catch(error => {
					console.log(error);
					this.App.addAlert("danger", "General error. Try again shortly.");
					that.setState({
						loading: false,
					});
				});

			}.bind(this))
			.catch(function(err){
				console.error(err);
				this.App.addAlert("danger", err.toString());
			});
		}
	}


	render() {
		return (
			<Form onSubmit={this.register}>

				{(this.state.features_email) ?
				<div>
					<InputGroup className="mt-4">
						<Input
						type="text"
						name="email"
						placeholder={this.i18n.email_placeholder}
						autoComplete="email"
						autoFocus={true}
						value={this.state.email}
						onChange={this.handleInput}
						invalid={this.state.validation_email != null}
					 />
					 <FormFeedback>{this.state.validation_email}</FormFeedback>
					</InputGroup>
					{(this.state.validation_email == null) && <FormText>{this.i18n.email_hint}</FormText>}
				</div>
				: null}

				{(this.state.features_password) ?
				<div>
					<InputGroup className="mb-1 mt-4">
						<Input
							type="password"
							name="password"
							placeholder={this.i18n.password_placeholder}
							value={this.state.password}
							onChange={this.handleInput}
							invalid={this.state.validation_password != null}
						/>
						<FormFeedback>{this.state.validation_password}</FormFeedback>
					</InputGroup>
					{(this.state.validation_password == null) && <FormText>{this.i18n.password_hint}</FormText>}

					<InputGroup className="mb-1 mt-4">
						<Input
							type="password"
							name="password2"
							placeholder={this.i18n.password2_placeholder}
							value={this.state.password2}
							onChange={this.handleInput}
							invalid={this.state.validation_password2 != null}
						/>
						<FormFeedback>{this.state.validation_password2}</FormFeedback>
					</InputGroup>
					{(this.state.validation_password2 == null) && <FormText>{this.i18n.password2_hint}</FormText>}
				</div>
				: null}

				{(this.state.features_tenant) ?
				<div>
					<InputGroup className="mt-4">
						<Input
						readOnly={this.state.readOnly}
						type="text"
						name="tenant"
						autoComplete="tenant"
						defaultValue={this.defaultTenant}
						onChange={this.handleInput}
						invalid={this.state.validation_tenant != null}
					 />
					 <FormFeedback>{this.state.validation_tenant}</FormFeedback>
					</InputGroup>
					{(this.state.validation_tenant == null) && <Button onClick={this.changeTenant} color="link" style={{"marginLeft": -13}}><FormText color="blue">{this.i18n.tenant_hint}</FormText></Button>}
				</div>
				: null}

				<InputGroup className="mt-4">
					<Button
						block
						color="primary"
						disabled={this.state.loading}
					>
						{this.state.loading && <span className="spinner-grow spinner-grow-sm ml-1" role="status"></span>}
						{this.i18n.button}
						{this.state.loading && <span className="spinner-grow spinner-grow-sm ml-1" role="status"></span>}
					</Button>
				</InputGroup>
				<FormText>{this.i18n.footer}</FormText>
			</Form>
		)
	}
}

function concatUint8ArrayAndArrayBuffer(a, b) {
	var c = new Uint8Array(a.length + b.byteLength);
	c.set(a, 0);
	c.set(new Uint8Array(b), a.length);
	return c;
}
*/

