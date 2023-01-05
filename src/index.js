import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Application, SplashScreen } from 'asab-webui';
import { HashRouter } from 'react-router-dom';

// Setting external CSS stylesheet file path
// Custom styles will be appended to the styles imported and configured in index.scss
/*
	module.exports = {
		app: {
			css_file_path: 'external_resources/custom.css',
		},
	}
*/

// Load custom CSS stylesheet if available
if (__CONFIG__.css_file_path != undefined) {
	// Create new link element
	const link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', __CONFIG__.css_file_path);
	// Append to the `head` element
	document.head.appendChild(link);
}

// Configuration
const ConfigDefaults = {
	i18n: {
		fallbackLng: 'en',
		supportedLngs: ['en', 'cs'],
		debug: false,
	},
	brandImage: {
		// TODO: uncomment and add file to media/logo when dark version of SeaCat's logo is released
		// dark: {
		// 	full: 'media/logo/header-logo-full-dark.svg'
		// },
		light: {
			full: 'media/logo/header-logo-full-light.svg'
		}
	}
};

const modules = [];

// The load event is fired when the whole page has loaded. Adds a class with which to set the colour from the variable
window.addEventListener('load', (event) => {
	document.body.classList.add('loaded')
})

// Add internationalization module
import I18nModule from 'asab-webui/modules/i18n';
modules.push(I18nModule);

// Add auth module
import SeaCatAuthModule from './modules/auth';
modules.push(SeaCatAuthModule);

// Render
ReactDOM.render((
	<HashRouter>
		<Suspense fallback={<SplashScreen />}>
			<Application
				configdefaults={ConfigDefaults} 
				modules={modules}
				defaultpath="/"
				hasSidebar={false}
				disableAppBreadcrumbs={true}
			/>
		</Suspense>
	</HashRouter>
), document.getElementById('app'));
