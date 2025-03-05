import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

const modules = [];

import { Application, I18nModule } from 'asab_webui_shell';
modules.push(I18nModule);

import SeaCatAuthFederationModule from './main.js';
modules.push(SeaCatAuthFederationModule);


const ConfigDefaults = {
	title: 'TeskaLabs SeaCat Auth',
	vendor: 'TeskaLabs',
	website: 'https://teskalabs.com',
	email: 'info@teskalabs.com',
	i18n: {
		fallbackLng: 'en',
		supportedLngs: ['en', 'cs'],
		debug: false,
		nsSeparator: false,
	},
	brandImage: {
		light: {
			full: 'media/logo/header-logo-full.svg',
			minimized: 'media/logo/header-logo-minimized.svg',
		},
		dark: {
			full: 'media/logo/header-logo-full-dark.svg',
			minimized: 'media/logo/header-logo-minimized-dark.svg',
		},
	},
	hasSidebar: false,
	hasHeaderTitle: false,
};

// Render
ReactDOM.render((
	<HashRouter>
		<Application
			configdefaults={ConfigDefaults} 
			modules={modules}
		/>
	</HashRouter>
), document.getElementById('app'));
