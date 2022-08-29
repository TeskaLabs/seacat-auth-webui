import { lazy } from 'react';
import Module from 'asab-webui/abc/Module';

const HomeScreen = lazy(() => import('./home/HomeScreen'));

const LoginScreen = lazy(() => import('./containers/LoginScreen'));

const ChangePwdScreen =  lazy(() => import('./passwd/ChangePwdScreen'));
const ResetPwdScreen =  lazy(() => import('./passwd/ResetPwdScreen'));
const ForgetPwdScreen =  lazy(() => import('./passwd/ForgetPwdScreen'));

const TOTPScreen =  lazy(() => import('./otp/TOTPScreen'));
const PhoneNumberScreen =  lazy(() => import('./number/PhoneNumberScreen'));
const EmailScreen =  lazy(() => import('./email/EmailScreen'));
const WebAuthnScreen =  lazy(() => import('./webauthn/WebAuthnScreen'));

const MessageScreen =  lazy(() => import('./utils/MessageScreen'));

import reducer from 'asab-webui/modules/auth/reducer';
import { types } from 'asab-webui/modules/auth/actions';
import './home/HomeScreen.scss';
import './webauthn/webauthn.scss';



export default class SeaCatAuthModule extends Module {

	constructor(app, name, props){
		super(app, "SeaCatAuthModule");


		this.UserInfo = null;
		app.ReduxService.addReducer("auth", reducer);
		this.App.addSplashScreenRequestor(this);


		app.Router.addRoute({
			path: '/',
			exact: true,
			name: 'Home',
			component: HomeScreen
		});

		app.Router.addRoute({
			path: '/login',
			exact: true,
			name: 'Login',
			component: LoginScreen
		});

		app.Router.addRoute({
			path: '/reset-password',
			exact: true,
			name: 'Reset password',
			component: ResetPwdScreen
		});

		app.Router.addRoute({
			path: '/change-password',
			exact: true,
			name: 'Change password',
			component: ChangePwdScreen
		});

		app.Router.addRoute({
			path: '/cant-login',
			exact: true,
			name: 'Cannot login',
			component: ForgetPwdScreen
		});

		app.Router.addRoute({
			path: '/manage-totp',
			exact: true,
			name: 'Manage TOTP',
			component: TOTPScreen
		});

		app.Router.addRoute({
			path: '/manage-webauthn',
			exact: true,
			name: 'Manage FIDO2/WebAuthn',
			component: WebAuthnScreen
		});

		app.Router.addRoute({
			path: '/manage-number',
			exact: true,
			name: 'Manage number',
			component: PhoneNumberScreen
		});

		app.Router.addRoute({
			path: '/manage-email',
			exact: true,
			name: 'Manage email',
			component: EmailScreen
		});

		app.Router.addRoute({
			path: '/finish-setup',
			exact: true,
			name: 'Finish setup',
			component: MessageScreen
		});

	}

	async initialize() {
		let axios = this.App.axiosCreate('openidconnect');
		let response;
		try {
			// Try to fetch the userinfo from the server, using the CSI cookie.
			response = await axios.get('/userinfo');
		}
		catch (err) {
			console.log("Failed to fetch userinfo", err);
		}

		if (response != null) {
			this.UserInfo = response.data;
		} else {
			this.UserInfo = null;
		}
		this.App.Store.dispatch({ type: types.AUTH_USERINFO, payload: this.UserInfo });
		this.App.removeSplashScreenRequestor(this);
	}

}
