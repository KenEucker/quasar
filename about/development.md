# Development

Useful CLI commands:

- `bin/dev` will run `bin/clean` and `bin/buildWebForm` to build a new version of the app then `bin/web` so you can test quasar output from the webform.
- `bin/clean` will delete the outputFolder.
- `bin/cleanOutput` will delete the outputFolder.
- `bin/cleanDev` will delete the local development folders and the dist folder.
- `bin/app` takes the has the following default arguments that you can override the cli with --[arg]=[val] _(eg: --runWebApi=true )_:

```
defaultCliArgs = {
		port: process.env.PORT,
		runOnce: false,
		watchJobs: false,
		qType: false,
		runWebForm: false,
		autoBuildWebForm: false,
		runWebApi: false }
```

- there is a `.vscode/launch.json` file in the repository that enables debugging of the application in vscode. You can use the above arguments in your IDE and override any of the above arguments.
