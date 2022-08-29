# Optional configuration

Example:

```
{
	login: {
		redirect_uri: "#/cant-login"
	},
	password_change: {
		remove_btn: true
	}
}
```

If configuration `password_change: remove_btn` is true, it places only button's text instead of the button from Password Change screen after successfully completed change of password.

Configuration `login: redirect_uri` is setting default redirection after login if none is defined in params.