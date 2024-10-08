# CHANGELOG

## v24.31

### Releases

- v24.31-beta
- v24.31-alpha3
- v24.31-alpha2
- v24.31-alpha1

### Features

- Redirect to invalid code page when pwd_token is missing in query (#46, v24.31-alpha1, PLUM Sprint 240726)

### Fix

- Fix on Help button displaying on SeaCat Auth header (#49, v24.31-alpha3, INDIGO Sprint 240913)
- Fix dynamic page title (#48, v24.31-alpha2, PLUM Sprint 240906)

## v24.19

### Releases

- v24.19-alpha3
- ~~v24.19-alpha2~~
- v24.19-alpha

### Compatibility

No breaking changes, tested with Seacat Auth v24.17-beta2

### Fix

- Rename password field in registration form (#45, v24.19-alpha3, PLUM Sprint 240531)

### Features

- Advanced password validation in new user registration form (#44, v24.19-alpha2, PLUM Sprint 240531)
- Advanced password validation (#43, v24.19-alpha, PLUM Sprint 240503)


## v23.29

- v23.29-beta
- v23.29-alpha
- v23.27-beta
- v23.16-beta
- v23.13-beta

## v23.29-beta

### Features

- ASAB WebUI submodule version bump [[fdc969f](https://github.com/TeskaLabs/asab-webui/commit/fdc969f8c6eb41a9c96abfa887d9ed54e9a4456f)] commit (INDIGO Sprint 230804, [!41](https://github.com/TeskaLabs/seacat-auth-webui/pull/41))

### Refactoring

- Change visibility of username to readonly and focus on password input field after wrong password. (INDIGO Sprint 230623, [!35](https://github.com/TeskaLabs/seacat-auth-webui/pull/35))

- Add penrose background to be used in all screens. (INDIGO Sprint 230804, [!40](https://github.com/TeskaLabs/seacat-auth-webui/pull/40))

## v23.29-alpha

### Breaking change

- All service names need to be updaded in nginx configuration according following example: `seacat_auth` -> `seacat-auth`

### Features

- ASAB WebUI submodule version bump [[31b7bb5](https://github.com/TeskaLabs/asab-webui/commit/31b7bb5519f7b8fa6f71853ba83f71e9dabc0ef4)] commit (INDIGO Sprint 230713, [!38](https://github.com/TeskaLabs/seacat-auth-webui/pull/38))

### Refactoring

- Favicons assets update with new logo (INDIGO Sprint 230623, [!34](https://github.com/TeskaLabs/seacat-auth-webui/pull/34))
- Refactor services names from underscores to dashes. (INDIGO Sprint 230623, [!38](https://github.com/TeskaLabs/seacat-auth-webui/pull/38))

## v23.27-beta

### Compatibility

To display last successful and unsuccessful login information, Seacat Auth service [v23.27-beta](https://github.com/TeskaLabs/seacat-auth/releases/tag/v23.27-beta) and newer must be used.

### Features

- ASAB WebUI submodule version bump [[06af558](https://github.com/TeskaLabs/asab-webui/commit/06af558428a2106e14d00d3fdb0b9457b761f787)] commit (INDIGO Sprint 230623, [!37](https://github.com/TeskaLabs/seacat-auth-webui/pull/37))

### Refactoring

- Asab-webui's `componentLoader` used as a callback within lazy() method to prevent chunk loading error. (INDIGO Sprint 230428, [!30](https://github.com/TeskaLabs/seacat-auth-webui/pull/30))

- Changing logo based on app's theme. (INDIGO Sprint 230428, [!20](https://github.com/TeskaLabs/seacat-auth-webui/pull/20))

- Refactored dynamic locales (INDIGO Sprint 230623, [!432](https://github.com/TeskaLabs/asab-webui/pull/432))

- Refactor fetching of last successful and failed logins from specific API endpoint. (INDIGO Sprint 230623, [!36](https://github.com/TeskaLabs/seacat-auth-webui/pull/36))

## v23.16-beta

### Compatibility

Tested with Seacat Auth service [v23.16-beta](https://github.com/TeskaLabs/seacat-auth/releases/tag/v23.16-beta)

### Features

- ASAB WebUI submodule version bump [[c7d682a](https://github.com/TeskaLabs/asab-webui/commit/c7d682ad8f08e432ddbed2c0d21f16a73b23bd58)] commit (INDIGO Sprint 230414, [!28](https://github.com/TeskaLabs/seacat-auth-webui/pull/28))

### Refactoring

- Remove `external_code` from localstorage when login in with external services, update eternal login error messages, polish code (INDIGO Sprint 230331, [!26](https://github.com/TeskaLabs/seacat-auth-webui/pull/26))

- Update `Insecured connection` alert message in the LoginCard component to the new format (INDIGO Sprint 230414, [!27](https://github.com/TeskaLabs/seacat-auth-webui/pull/27))

### Bugfix

- Version bump of ASAB WebUI with fix on userinfo loop when session expiration time is set to small values (INDIGO Sprint 230414, [!28](https://github.com/TeskaLabs/seacat-auth-webui/pull/28))

## v23.13-beta

### Features

- ASAB WebUI submodule version bump [[1960466](https://github.com/TeskaLabs/asab-webui/commit/1960466a45d0c48ec279e703317ebf0a59fdcbda)] commit (INDIGO Sprint 230317, [!25](https://github.com/TeskaLabs/seacat-auth-webui/pull/25))

### Refactoring

- Remove react-helmet from the package.json (INDIGO Sprint 230217, [!22](https://github.com/TeskaLabs/seacat-auth-webui/pull/22))

- Webpack V4 to V5 migration. (INDIGO Sprint 230303, [!17](https://github.com/TeskaLabs/seacat-auth-webui/pull/17))


## v23.4

### Compatibility

- [x] **SeaCat Admin UI `v23.4` or newer**
- [x] **SeaCat Auth `v23.3` or newer**

⚠️ Due to implementation of new features, invitation will not work with SeaCat Auth service versions older than `v23.3`

### Features

- ASAB WebUI submodule version bump [[25d5a5c](https://github.com/TeskaLabs/asab-webui/commit/https://github.com/TeskaLabs/asab-webui/commit/25d5a5ce97c6f2286525127cc3a31531b03312f3)] commit (INDIGO Sprint 230106, [!16](https://github.com/TeskaLabs/seacat-auth-webui/pull/16))

- Implement registration by invitation - create invitation and registration screens and cards (INDIGO Sprint 230106, [!16](https://github.com/TeskaLabs/seacat-auth-webui/pull/16))

### Refactoring

- Replace `phone_number` with `phone` and `preferred_username` with `username` (INDIGO Sprint 221209, [!19](https://github.com/TeskaLabs/seacat-auth-webui/pull/19))

- Update alert responses with full message from the service and prolong the time of the error message to 30s (INDIGO Sprint 230106, [!16](https://github.com/TeskaLabs/seacat-auth-webui/pull/16))

## v22.48

### Compatibility

- [x] **ASAB UI `v22.48` or newer**
- [x] **SeaCat Auth `v22.48` or newer**

⚠️ Due to breaking changes in the OpenID Connect module of SeaCat Auth service, tenant authorization will not work with older versions of SeaCat Auth service and ASAB UI based apps.

### Features

- ASAB WebUI submodule version bump [[e7c9b7e](https://github.com/TeskaLabs/asab-webui/commit/https://github.com/TeskaLabs/asab-webui/commit/e7c9b7eb60eaba9cae39ea18d569301dcc7500c4)] commit (INDIGO Sprint 221125, [!15](https://github.com/TeskaLabs/seacat-auth-webui/pull/15))

### Refactoring

- Implement change key name in Webauthn (INDIGO Sprint 221031, [!12](https://github.com/TeskaLabs/seacat-auth-webui/pull/12))

## v22.44

### Bugfix

- Temporary downgrade of `react-hook-form` from `“^7.22.1"` to `"7.37.0"` to avoid issues with non functional submit button in forms with v `"7.38.0"`. (INDIGO Sprint 221014, [!13](https://github.com/TeskaLabs/seacat-auth-webui/pull/13/files))

## v22.42

### Features

- ASAB WebUI submodule version bump [[899679e](https://github.com/TeskaLabs/asab-webui/commit/https://github.com/TeskaLabs/asab-webui/commit/899679ebfab1862706504e60ceb396d72d2a4ad9)] commit (INDIGO Sprint 221014, [!10](https://github.com/TeskaLabs/seacat-auth-webui/pull/10))

### Refactoring

- Add correct gray background and spinner when the page is loaded (INDIGO Sprint 220916, [!4](https://github.com/TeskaLabs/seacat-auth-webui/pull/4))

- Change spinner to progress-bar, when the page is loaded (INDIGO Sprint 220930, [!9](https://github.com/TeskaLabs/seacat-auth-webui/pull/9))

### Bugfix

- Google Chrome issue - browser assumed login card username input was a credit card number. (INDIGO Sprint 220930, [!8](https://github.com/TeskaLabs/seacat-auth-webui/pull/8))

## v22.38

### Breaking changes

- From release `v22.38`, only same (`v22.38`) or newer release tags of SeaCat Auth service is compatible with SeaCat Auth WebUI due to changes in `userinfo` response

### Features

- ASAB WebUI submodule version bump [[22ab54c](https://github.com/TeskaLabs/asab-webui/commit/https://github.com/TeskaLabs/asab-webui/commit/22ab54c22c61d247702a6912db84ed81836497ab)] commit (INDIGO Sprint 220916, [!5](https://github.com/TeskaLabs/seacat-auth-webui/pull/5))

### Refactoring

- Change the switch input to a different coloured indicator (INDIGO Sprint 220819, [!2](https://github.com/TeskaLabs/seacat-auth-webui/pull/2))

- Allow dynamic (custom) branding of header image (full and minimized), title and CSS (INDIGO Sprint 220902, [!3](https://github.com/TeskaLabs/seacat-auth-webui/pull/3))

### Bugfix
