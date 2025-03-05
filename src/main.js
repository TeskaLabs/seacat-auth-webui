import React from 'react';
import { Module } from 'asab_webui_components';

// TODO: remove the styling from here
import './containers/screens.scss';

export default class SeaCatAuthFederationModule extends Module {

	constructor(app){
		super(app, 'SeaCatAuthFederationModule');
		// this.App = app;

		// app.Services?.I18nService.addSource(async (language, namespace) => {
		// 	// Dynamic locales import
		// 	const data = await import(`./locales/${language}/${namespace}.json`);
		// 	return data.default;
		// });


		const HomeScreen = React.lazy(() => import('./home/HomeScreen'));
		const LoginScreen =  React.lazy(() => import('./containers/LoginScreen'));
		const RegisterScreen =  React.lazy(() => import('./containers/RegisterScreen'));
		const ResetPwdScreen = React.lazy(() => import('./passwd/ResetPwdScreen'));
		const ForgetPwdScreen = React.lazy(() => import('./passwd/ForgetPwdScreen'));


		app.Router.addRoute({
			path: '/',
			end: true,
			name: 'Home',
			component: HomeScreen,
			resource: '*'
		});


		app.Router.addRoute({
			path: '/login',
			end: true,
			name: 'Login',
			component: LoginScreen,
			resource: '*'
		});

		app.Router.addRoute({
			path: '/register',
			end: true,
			name: 'Register',
			component: RegisterScreen,
			resource: '*'
		});

		app.Router.addRoute({
			path: '/reset-password',
			end: true,
			name: 'Reset password',
			component: ResetPwdScreen,
			resource: '*'
		});

		app.Router.addRoute({
			path: '/cant-login',
			end: true,
			name: "Can't login",
			component: ForgetPwdScreen,
			resource: '*'
		});

	}
}
