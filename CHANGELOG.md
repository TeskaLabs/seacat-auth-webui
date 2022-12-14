# CHANGELOG

## Release Candidate

### Features

- ASAB WebUI submodule version bump [[0b97139](https://github.com/TeskaLabs/asab-webui/commit/https://github.com/TeskaLabs/asab-webui/commit/0b97139df1c2dc0e4e82dd97fd5593334efc5d38)] commit (INDIGO Sprint 230106, [!21](https://github.com/TeskaLabs/seacat-auth-webui/pull/21))

### Refactoring

- Replace `phone_number` with `phone` and `preferred_username` with `username` (INDIGO Sprint 221209, [!19](https://github.com/TeskaLabs/seacat-auth-webui/pull/19))

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
