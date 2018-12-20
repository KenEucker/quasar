## Classes

<dl>
<dt><a href="#QuasarApi">QuasarApi</a> ⇐ <code><a href="#QuasarRuntime">QuasarRuntime</a></code></dt>
<dd><p>The API wrapper around the quasar runtime.</p>
</dd>
<dt><a href="#QuasarCli">QuasarCli</a></dt>
<dd><p>Processes command line arguments to run quasar runtime methods.</p>
</dd>
<dt><a href="#QuasarConfig">QuasarConfig</a></dt>
<dd><p>Contains the path information for loading quasar files.</p>
</dd>
<dt><a href="#DTQuasarTask">DTQuasarTask</a> ⇐ <code><a href="#QuasarTask">QuasarTask</a></code></dt>
<dd><p>A quasar task with Digital Trends specific business logic</p>
</dd>
<dt><a href="#QuasarElectronApp">QuasarElectronApp</a></dt>
<dd><p>Runs the QuasarWebApp in an electron window</p>
</dd>
<dt><a href="#QuasArgs">QuasArgs</a></dt>
<dd><p>The default quasArgs object used in quasar builds.</p>
</dd>
<dt><a href="#QuasarRuntime">QuasarRuntime</a></dt>
<dd><p>The quasar Runtime [use the quasar API, not this class directly].</p>
</dd>
<dt><a href="#QuasarTask">QuasarTask</a></dt>
<dd><p>A task that can be run by the quasar runtime API.</p>
</dd>
<dt><a href="#QuasarWebApp">QuasarWebApp</a></dt>
<dd><p>The web application for running the quasar API and webform.</p>
</dd>
</dl>

<a name="QuasarApi"></a>

## QuasarApi ⇐ [<code>QuasarRuntime</code>](#QuasarRuntime)
The API wrapper around the quasar runtime.

**Kind**: global class  
**Extends**: [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Export**:   

* [QuasarApi](#QuasarApi) ⇐ [<code>QuasarRuntime</code>](#QuasarRuntime)
    * [.config](#QuasarRuntime+config) : [<code>QuasarConfig</code>](#QuasarConfig)
    * [.cleanDevFolders(quasArgs)](#QuasarRuntime+cleanDevFolders) ⇒ <code>promise</code>
    * [.cleanOutputFolders(quasArgs, [allFolders])](#QuasarRuntime+cleanOutputFolders) ⇒ <code>promise</code>
    * [.cleanAssetsFolder(quasArgs, subdirectory)](#QuasarRuntime+cleanAssetsFolder) ⇒ <code>promise</code>
    * [.compileScriptsToAssetsFolder(quasArgs, files, outputFilename)](#QuasarRuntime+compileScriptsToAssetsFolder) ⇒ <code>promise</code>
    * [.compileStylesToAssetsFolder(quasArgs, files, outputFilename)](#QuasarRuntime+compileStylesToAssetsFolder) ⇒ <code>promise</code>
    * [.compileTargetFileToAssetsFolder(quasArgs)](#QuasarRuntime+compileTargetFileToAssetsFolder) ⇒ <code>promise</code>
    * [.copyFilesFromAssetsFolderToOutput(quasArgs, files, excludeFiles)](#QuasarRuntime+copyFilesFromAssetsFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesFromSourcesFolderToOutput(quasArgs, [files], [excludeFiles])](#QuasarRuntime+copyFilesFromSourcesFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesFromTemplatesFolderToAssetsFolder(quasArgs, files, [excludeFiles])](#QuasarRuntime+copyFilesFromTemplatesFolderToAssetsFolder) ⇒ <code>promise</code>
    * [.copyFilesFromTemplatesFolderToOutput(quasArgs, files, [excludeFiles])](#QuasarRuntime+copyFilesFromTemplatesFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesToOutputFolder(quasArgs, fromDirectory, files, [excludeFiles])](#QuasarRuntime+copyFilesToOutputFolder) ⇒ <code>promise</code>
    * [.copyTemplateFilesToAssetsPath(quasArgs)](#QuasarRuntime+copyTemplateFilesToAssetsPath) ⇒ <code>promise</code>
    * [.debug(message, obj, condition)](#QuasarRuntime+debug)
    * [.downloadFileFromUrlToSourcesFolder(quasArgs, url)](#QuasarRuntime+downloadFileFromUrlToSourcesFolder) ⇒ <code>promise</code>
    * [.downloadSourceFilesToSourcesFolder(quasArgs)](#QuasarRuntime+downloadSourceFilesToSourcesFolder) ⇒ <code>promise</code>
    * [.findTargetFile(quasArgs, nextPath, originalPath, exhausted)](#QuasarRuntime+findTargetFile) ⇒ <code>string</code>
    * [.getAvailableSourceFilenames(quasArgs)](#QuasarRuntime+getAvailableSourceFilenames) ⇒ <code>array</code>
    * [.getAvailableDebrisFilenames(quasArgs)](#QuasarRuntime+getAvailableDebrisFilenames) ⇒ <code>array</code>
    * [.getAvailableTaskNames()](#QuasarRuntime+getAvailableTaskNames) ⇒ <code>array</code>
    * [.getQuasarOutputPath([quasArgs])](#QuasarRuntime+getQuasarOutputPath) ⇒ <code>string</code>
    * [.getTaskNames([dir])](#QuasarRuntime+getTaskNames) ⇒ <code>array</code>
    * [.getTasksAssociatedByOutputType(taskNames, [orderByQuasar])](#QuasarRuntime+getTasksAssociatedByOutputType) ⇒ <code>object</code>
    * [.injectCode(quasArgs)](#QuasarRuntime+injectCode) ⇒ <code>object</code>
    * [.injectDebrisFilesIntoStream(quasArgs, contents, [minify])](#QuasarRuntime+injectDebrisFilesIntoStream) ⇒ <code>stream</code>
    * [.injectRequiredFilesIntoStream(quasArgs, contents)](#QuasarRuntime+injectRequiredFilesIntoStream) ⇒ <code>stream</code>
    * [.loadTasks(taskPaths, [loadDefaults], [clobber])](#QuasarRuntime+loadTasks) ⇒ <code>array</code>
    * [.logArgsToFile(quasArgs, [toStatus], [overwite])](#QuasarRuntime+logArgsToFile) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.logBuildQueued(quasArgs)](#QuasarRuntime+logBuildQueued) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.logCritical(message, obj, color)](#QuasarRuntime+logCritical)
    * [.logData(message, obj, color)](#QuasarRuntime+logData)
    * [.logEnd(message, obj, color)](#QuasarRuntime+logEnd)
    * [.logError(message, obj, color)](#QuasarRuntime+logError)
    * [.logInfo(message, obj, color)](#QuasarRuntime+logInfo)
    * [.logSuccess(message, obj, color)](#QuasarRuntime+logSuccess)
    * [.makePromptRequired()](#QuasarRuntime+makePromptRequired) ⇒ <code>function</code>
    * [.makePromptRequiredAndSanitary()](#QuasarRuntime+makePromptRequiredAndSanitary) ⇒ <code>function</code>
    * [.moveTargetFilesToRootOfAssetsPath(quasArgs)](#QuasarRuntime+moveTargetFilesToRootOfAssetsPath) ⇒ <code>promise</code>
    * [.outputToHtmlFile(quasArgs)](#QuasarRuntime+outputToHtmlFile) ⇒ <code>object</code>
    * [.outputToJsonFile(quasArgs)](#QuasarRuntime+outputToJsonFile) ⇒ <code>object</code>
    * [.outputToTextFile(quasArgs)](#QuasarRuntime+outputToTextFile) ⇒ <code>object</code>
    * [.promptConsole(questions, getResults, [showOptional], [optionalOnly])](#QuasarRuntime+promptConsole) ⇒ <code>promise</code>
    * [.runFromArgsFile(qType, argsFile)](#QuasarRuntime+runFromArgsFile)
    * [.runLastSuccessfulBuild([quasArgs])](#QuasarRuntime+runLastSuccessfulBuild) ⇒ <code>promise</code>
    * [.runQuasar(quasar, [quasArgs], registerTask, end)](#QuasarRuntime+runQuasar) ⇒ <code>promise</code>
    * [.unpackSourceFiles(quasArgs, subDirectory)](#QuasarRuntime+unpackSourceFiles) ⇒ <code>promise</code>
    * [.uploadOutputFiles(quasArgs, [excludeFiles])](#QuasarRuntime+uploadOutputFiles) ⇒ <code>promise</code>
    * [.uploadOutputFileAsTxt(quasArgs)](#QuasarRuntime+uploadOutputFileAsTxt) ⇒ <code>promise</code>
    * [.uploadOutputFileWithMetadata(quasArgs)](#QuasarRuntime+uploadOutputFileWithMetadata) ⇒ <code>promise</code>

<a name="QuasarRuntime+config"></a>

### quasarApi.config : [<code>QuasarConfig</code>](#QuasarConfig)
**Kind**: instance property of [<code>QuasarApi</code>](#QuasarApi)  
<a name="QuasarRuntime+cleanDevFolders"></a>

### quasarApi.cleanDevFolders(quasArgs) ⇒ <code>promise</code>
cleans local files in the application root for development testing

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>cleanDevFolders</code>](#QuasarRuntime+cleanDevFolders)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+cleanOutputFolders"></a>

### quasarApi.cleanOutputFolders(quasArgs, [allFolders]) ⇒ <code>promise</code>
deletes the contents of the output root folder and all subdirectories

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>cleanOutputFolders</code>](#QuasarRuntime+cleanOutputFolders)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [allFolders] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+cleanAssetsFolder"></a>

### quasarApi.cleanAssetsFolder(quasArgs, subdirectory) ⇒ <code>promise</code>
deletes the contents of the assets folder for this quasar

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>cleanAssetsFolder</code>](#QuasarRuntime+cleanAssetsFolder)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| subdirectory | <code>string</code> | 

<a name="QuasarRuntime+compileScriptsToAssetsFolder"></a>

### quasarApi.compileScriptsToAssetsFolder(quasArgs, files, outputFilename) ⇒ <code>promise</code>
Compiles jsx templates in the templates folder and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>compileScriptsToAssetsFolder</code>](#QuasarRuntime+compileScriptsToAssetsFolder)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| files | <code>array</code> \| <code>string</code> | gulp src input |
| outputFilename | <code>string</code> |  |

<a name="QuasarRuntime+compileStylesToAssetsFolder"></a>

### quasarApi.compileStylesToAssetsFolder(quasArgs, files, outputFilename) ⇒ <code>promise</code>
Compiles sass templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>compileStylesToAssetsFolder</code>](#QuasarRuntime+compileStylesToAssetsFolder)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| files | <code>array</code> \| <code>string</code> | gulp src input |
| outputFilename | <code>string</code> |  |

<a name="QuasarRuntime+compileTargetFileToAssetsFolder"></a>

### quasarApi.compileTargetFileToAssetsFolder(quasArgs) ⇒ <code>promise</code>
compiles mustache templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>compileTargetFileToAssetsFolder</code>](#QuasarRuntime+compileTargetFileToAssetsFolder)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+copyFilesFromAssetsFolderToOutput"></a>

### quasarApi.copyFilesFromAssetsFolderToOutput(quasArgs, files, excludeFiles) ⇒ <code>promise</code>
copies files from the assets folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyFilesFromAssetsFolderToOutput</code>](#QuasarRuntime+copyFilesFromAssetsFolderToOutput)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| files | <code>\*</code> | 
| excludeFiles | <code>\*</code> | 

<a name="QuasarRuntime+copyFilesFromSourcesFolderToOutput"></a>

### quasarApi.copyFilesFromSourcesFolderToOutput(quasArgs, [files], [excludeFiles]) ⇒ <code>promise</code>
copies files the sources folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyFilesFromSourcesFolderToOutput</code>](#QuasarRuntime+copyFilesFromSourcesFolderToOutput)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [files] | <code>\*</code> | <code></code> | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesFromTemplatesFolderToAssetsFolder"></a>

### quasarApi.copyFilesFromTemplatesFolderToAssetsFolder(quasArgs, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from the templates folder to the assets folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyFilesFromTemplatesFolderToAssetsFolder</code>](#QuasarRuntime+copyFilesFromTemplatesFolderToAssetsFolder)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesFromTemplatesFolderToOutput"></a>

### quasarApi.copyFilesFromTemplatesFolderToOutput(quasArgs, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from the templates folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyFilesFromTemplatesFolderToOutput</code>](#QuasarRuntime+copyFilesFromTemplatesFolderToOutput)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesToOutputFolder"></a>

### quasarApi.copyFilesToOutputFolder(quasArgs, fromDirectory, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from a directory to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyFilesToOutputFolder</code>](#QuasarRuntime+copyFilesToOutputFolder)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| fromDirectory | <code>\*</code> |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyTemplateFilesToAssetsPath"></a>

### quasarApi.copyTemplateFilesToAssetsPath(quasArgs) ⇒ <code>promise</code>
copies files from the templates folder to the assets folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>copyTemplateFilesToAssetsPath</code>](#QuasarRuntime+copyTemplateFilesToAssetsPath)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+debug"></a>

### quasarApi.debug(message, obj, condition)
makes a call to log and is used as a canary for testing

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>debug</code>](#QuasarRuntime+debug)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| condition | <code>string</code> | 

<a name="QuasarRuntime+downloadFileFromUrlToSourcesFolder"></a>

### quasarApi.downloadFileFromUrlToSourcesFolder(quasArgs, url) ⇒ <code>promise</code>
downloads source files from a url into the sources folder to be used at build time

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>downloadFileFromUrlToSourcesFolder</code>](#QuasarRuntime+downloadFileFromUrlToSourcesFolder)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| url | <code>string</code> | 

<a name="QuasarRuntime+downloadSourceFilesToSourcesFolder"></a>

### quasarApi.downloadSourceFilesToSourcesFolder(quasArgs) ⇒ <code>promise</code>
downloads source files from a url into the sources folder to be used at build time

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>downloadSourceFilesToSourcesFolder</code>](#QuasarRuntime+downloadSourceFilesToSourcesFolder)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+findTargetFile"></a>

### quasarApi.findTargetFile(quasArgs, nextPath, originalPath, exhausted) ⇒ <code>string</code>
searches for a target file in the various available folders by name, qType, oType, and extension until it finds one

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>findTargetFile</code>](#QuasarRuntime+findTargetFile)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| nextPath | <code>string</code> | 
| originalPath | <code>string</code> | 
| exhausted | <code>string</code> | 

<a name="QuasarRuntime+getAvailableSourceFilenames"></a>

### quasarApi.getAvailableSourceFilenames(quasArgs) ⇒ <code>array</code>
gets the filenames of the source extension type from the sources folder

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getAvailableSourceFilenames</code>](#QuasarRuntime+getAvailableSourceFilenames)  
**Returns**: <code>array</code> - list of filenames from sources folder  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+getAvailableDebrisFilenames"></a>

### quasarApi.getAvailableDebrisFilenames(quasArgs) ⇒ <code>array</code>
gets the debris filenames from the debris folder

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getAvailableDebrisFilenames</code>](#QuasarRuntime+getAvailableDebrisFilenames)  
**Returns**: <code>array</code> - list of filenames from debris folder  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+getAvailableTaskNames"></a>

### quasarApi.getAvailableTaskNames() ⇒ <code>array</code>
gets an array of the loaded task names

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getAvailableTaskNames</code>](#QuasarRuntime+getAvailableTaskNames)  
<a name="QuasarRuntime+getQuasarOutputPath"></a>

### quasarApi.getQuasarOutputPath([quasArgs]) ⇒ <code>string</code>
gets the outputPath for quasars

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getQuasarOutputPath</code>](#QuasarRuntime+getQuasarOutputPath)  

| Param | Type | Default |
| --- | --- | --- |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarRuntime+getTaskNames"></a>

### quasarApi.getTaskNames([dir]) ⇒ <code>array</code>
gets the task names from the tasks folder

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getTaskNames</code>](#QuasarRuntime+getTaskNames)  

| Param | Type | Default |
| --- | --- | --- |
| [dir] | <code>string</code> | <code>null</code> | 

<a name="QuasarRuntime+getTasksAssociatedByOutputType"></a>

### quasarApi.getTasksAssociatedByOutputType(taskNames, [orderByQuasar]) ⇒ <code>object</code>
gets task names associated with the oType field

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>getTasksAssociatedByOutputType</code>](#QuasarRuntime+getTasksAssociatedByOutputType)  

| Param | Type | Default |
| --- | --- | --- |
| taskNames | <code>array</code> |  | 
| [orderByQuasar] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+injectCode"></a>

### quasarApi.injectCode(quasArgs) ⇒ <code>object</code>
Injects asset file references into the output file in the assets folder.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>injectCode</code>](#QuasarRuntime+injectCode)  
**Returns**: <code>object</code> - the quasargs used  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+injectDebrisFilesIntoStream"></a>

### quasarApi.injectDebrisFilesIntoStream(quasArgs, contents, [minify]) ⇒ <code>stream</code>
Injects require statements for debris.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>injectDebrisFilesIntoStream</code>](#QuasarRuntime+injectDebrisFilesIntoStream)  
**Returns**: <code>stream</code> - the stream written to  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| contents | <code>stream</code> |  | 
| [minify] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+injectRequiredFilesIntoStream"></a>

### quasarApi.injectRequiredFilesIntoStream(quasArgs, contents) ⇒ <code>stream</code>
Injects require statements for the default asset files (css and js).

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>injectRequiredFilesIntoStream</code>](#QuasarRuntime+injectRequiredFilesIntoStream)  
**Returns**: <code>stream</code> - the stream written to  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| contents | <code>stream</code> | 

<a name="QuasarRuntime+loadTasks"></a>

### quasarApi.loadTasks(taskPaths, [loadDefaults], [clobber]) ⇒ <code>array</code>
loads the quasar tasks into the gulp taskList

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>loadTasks</code>](#QuasarRuntime+loadTasks)  
**Returns**: <code>array</code> - the tasks loaded  

| Param | Type | Default |
| --- | --- | --- |
| taskPaths | <code>array</code> |  | 
| [loadDefaults] | <code>boolean</code> | <code>false</code> | 
| [clobber] | <code>boolean</code> | <code>true</code> | 

<a name="QuasarRuntime+logArgsToFile"></a>

### quasarApi.logArgsToFile(quasArgs, [toStatus], [overwite]) ⇒ [<code>QuasArgs</code>](#QuasArgs)
writes the args to file with the status passed in

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logArgsToFile</code>](#QuasarRuntime+logArgsToFile)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [toStatus] | <code>string</code> | <code>null</code> | 
| [overwite] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+logBuildQueued"></a>

### quasarApi.logBuildQueued(quasArgs) ⇒ [<code>QuasArgs</code>](#QuasArgs)
logs quasArgs to the jobFile

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logBuildQueued</code>](#QuasarRuntime+logBuildQueued)  
**Returns**: [<code>QuasArgs</code>](#QuasArgs) - the quasargs logged with updated argsFile entry  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+logCritical"></a>

### quasarApi.logCritical(message, obj, color)
ogs a critical message

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logCritical</code>](#QuasarRuntime+logCritical)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logData"></a>

### quasarApi.logData(message, obj, color)
Logs a data message

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logData</code>](#QuasarRuntime+logData)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logEnd"></a>

### quasarApi.logEnd(message, obj, color)
Logs an end message

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logEnd</code>](#QuasarRuntime+logEnd)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logError"></a>

### quasarApi.logError(message, obj, color)
Logs an error message

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logError</code>](#QuasarRuntime+logError)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logInfo"></a>

### quasarApi.logInfo(message, obj, color)
Logs an info message (default)

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logInfo</code>](#QuasarRuntime+logInfo)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logSuccess"></a>

### quasarApi.logSuccess(message, obj, color)
Logs a success message

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>logSuccess</code>](#QuasarRuntime+logSuccess)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+makePromptRequired"></a>

### quasarApi.makePromptRequired() ⇒ <code>function</code>
used with inquirer questions to ensure that values entered have a length

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>makePromptRequired</code>](#QuasarRuntime+makePromptRequired)  
<a name="QuasarRuntime+makePromptRequiredAndSanitary"></a>

### quasarApi.makePromptRequiredAndSanitary() ⇒ <code>function</code>
used with inquirer questions to ensure that values entered from the CLI follow the required ruleset

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>makePromptRequiredAndSanitary</code>](#QuasarRuntime+makePromptRequiredAndSanitary)  
<a name="QuasarRuntime+moveTargetFilesToRootOfAssetsPath"></a>

### quasarApi.moveTargetFilesToRootOfAssetsPath(quasArgs) ⇒ <code>promise</code>
moves the target html, js, and css files to the assetsFolder

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>moveTargetFilesToRootOfAssetsPath</code>](#QuasarRuntime+moveTargetFilesToRootOfAssetsPath)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToHtmlFile"></a>

### quasarApi.outputToHtmlFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as HTML.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>outputToHtmlFile</code>](#QuasarRuntime+outputToHtmlFile)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToJsonFile"></a>

### quasarApi.outputToJsonFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as JSON.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>outputToJsonFile</code>](#QuasarRuntime+outputToJsonFile)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToTextFile"></a>

### quasarApi.outputToTextFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as TXT.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>outputToTextFile</code>](#QuasarRuntime+outputToTextFile)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+promptConsole"></a>

### quasarApi.promptConsole(questions, getResults, [showOptional], [optionalOnly]) ⇒ <code>promise</code>
prompts the terminal with questions

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>promptConsole</code>](#QuasarRuntime+promptConsole)  
**Returns**: <code>promise</code> - the promise of a prompt of the user to the command line interface  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| questions | <code>array</code> |  | the questions to ask the user |
| getResults | <code>function</code> |  | callback after prompt has completed |
| [showOptional] | <code>boolean</code> | <code>false</code> |  |
| [optionalOnly] | <code>boolean</code> | <code></code> |  |

<a name="QuasarRuntime+runFromArgsFile"></a>

### quasarApi.runFromArgsFile(qType, argsFile)
spawns a task to run a quasar from quasArgs saved in a json file.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>runFromArgsFile</code>](#QuasarRuntime+runFromArgsFile)  

| Param | Type |
| --- | --- |
| qType | <code>\*</code> | 
| argsFile | <code>\*</code> | 

<a name="QuasarRuntime+runLastSuccessfulBuild"></a>

### quasarApi.runLastSuccessfulBuild([quasArgs]) ⇒ <code>promise</code>
runs the last successfully recorded argsFile

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>runLastSuccessfulBuild</code>](#QuasarRuntime+runLastSuccessfulBuild)  
**Returns**: <code>promise</code> - resolves to the QuasArgs used  

| Param | Type | Default |
| --- | --- | --- |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code></code> | 

<a name="QuasarRuntime+runQuasar"></a>

### quasarApi.runQuasar(quasar, [quasArgs], registerTask, end) ⇒ <code>promise</code>
Runs a quasar build task

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>runQuasar</code>](#QuasarRuntime+runQuasar)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| quasar | <code>string</code> |  | name of the quasar to run |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> |  |
| registerTask | <code>bool</code> |  | whether or not to register the quasar with gulp |
| end | <code>function</code> |  | the callback for when the task has completed |

<a name="QuasarRuntime+unpackSourceFiles"></a>

### quasarApi.unpackSourceFiles(quasArgs, subDirectory) ⇒ <code>promise</code>
unzips or moves source files to the assets folder

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>unpackSourceFiles</code>](#QuasarRuntime+unpackSourceFiles)  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| subDirectory | <code>string</code> | the subdirectory of the assets folder to place the source files |

<a name="QuasarRuntime+uploadOutputFiles"></a>

### quasarApi.uploadOutputFiles(quasArgs, [excludeFiles]) ⇒ <code>promise</code>
Uploads output files to Amazon S3.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>uploadOutputFiles</code>](#QuasarRuntime+uploadOutputFiles)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [excludeFiles] | <code>array</code> | <code>[]</code> | 

<a name="QuasarRuntime+uploadOutputFileAsTxt"></a>

### quasarApi.uploadOutputFileAsTxt(quasArgs) ⇒ <code>promise</code>
Uploads the outputFile to Amazon S3.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>uploadOutputFileAsTxt</code>](#QuasarRuntime+uploadOutputFileAsTxt)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+uploadOutputFileWithMetadata"></a>

### quasarApi.uploadOutputFileWithMetadata(quasArgs) ⇒ <code>promise</code>
Uploads the outputFile to Amazon S3.

**Kind**: instance method of [<code>QuasarApi</code>](#QuasarApi)  
**Overrides**: [<code>uploadOutputFileWithMetadata</code>](#QuasarRuntime+uploadOutputFileWithMetadata)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarCli"></a>

## QuasarCli
Processes command line arguments to run quasar runtime methods.

**Kind**: global class  
**Export**:   

* [QuasarCli](#QuasarCli)
    * [.app](#QuasarCli+app)
    * [.applicationRoot](#QuasarCli+applicationRoot)
    * [.jobsFolder](#QuasarCli+jobsFolder)
    * [.outputRoot](#QuasarCli+outputRoot)
    * [.getJobError(jobFile)](#QuasarCli+getJobError) ⇒ <code>string</code>
    * [.init([appRoot], [outRoot])](#QuasarCli+init)
    * [.packageIntoElectronApp()](#QuasarCli+packageIntoElectronApp) ⇒ <code>promise</code>
    * [.processArgsFile(argsFile, data)](#QuasarCli+processArgsFile)
    * [.quasarSelectPrompt(tasks)](#QuasarCli+quasarSelectPrompt) ⇒ <code>promise</code>
    * [.run([args])](#QuasarCli+run) ⇒ <code>promise</code>
    * [.runProcess(args, resolve, reject)](#QuasarCli+runProcess) ⇒ <code>promise</code>
    * [.spawnElectronApp()](#QuasarCli+spawnElectronApp)
    * [.spawnWebApp()](#QuasarCli+spawnWebApp) ⇒ <code>boolean</code>
    * [.spawnWebForm()](#QuasarCli+spawnWebForm) ⇒ <code>boolean</code>
    * [.watchJobs()](#QuasarCli+watchJobs)

<a name="QuasarCli+app"></a>

### quasarCli.app
returns the application attached to the CLI

**Kind**: instance property of [<code>QuasarCli</code>](#QuasarCli)  
**Read only**: true  
<a name="QuasarCli+applicationRoot"></a>

### quasarCli.applicationRoot
the absolute path to the application root

**Kind**: instance property of [<code>QuasarCli</code>](#QuasarCli)  
**Read only**: true  
<a name="QuasarCli+jobsFolder"></a>

### quasarCli.jobsFolder
the absolute path to the jobs folder

**Kind**: instance property of [<code>QuasarCli</code>](#QuasarCli)  
**Read only**: true  
<a name="QuasarCli+outputRoot"></a>

### quasarCli.outputRoot
the absolute path to the output root folder

**Kind**: instance property of [<code>QuasarCli</code>](#QuasarCli)  
**Read only**: true  
<a name="QuasarCli+getJobError"></a>

### quasarCli.getJobError(jobFile) ⇒ <code>string</code>
extracts the error from the jobfile

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type | Description |
| --- | --- | --- |
| jobFile | <code>string</code> | the jobFile path |

<a name="QuasarCli+init"></a>

### quasarCli.init([appRoot], [outRoot])
creates the application job folders and sets initial vars

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type | Default |
| --- | --- | --- |
| [appRoot] | <code>\*</code> | <code>process.cwd()</code> | 
| [outRoot] | <code>string</code> | <code>&quot;&#x60;${os.homedir()}/Documents/quasar/&#x60;&quot;</code> | 

<a name="QuasarCli+packageIntoElectronApp"></a>

### quasarCli.packageIntoElectronApp() ⇒ <code>promise</code>
runs electron-packager on the applicationRoot and uses the electron.js file for driving the application

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  
**Summary**: [INCOMPLETE]  
**Returns**: <code>promise</code> - gulp chain  
<a name="QuasarCli+processArgsFile"></a>

### quasarCli.processArgsFile(argsFile, data)
processes a job file and kicks off a build from those args

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type | Description |
| --- | --- | --- |
| argsFile | <code>string</code> | the path to the argsfile to process |
| data | <code>\*</code> |  |

<a name="QuasarCli+quasarSelectPrompt"></a>

### quasarCli.quasarSelectPrompt(tasks) ⇒ <code>promise</code>
prompts the user from the command line with the given tasks

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type | Description |
| --- | --- | --- |
| tasks | [<code>QuasarTask</code>](#QuasarTask) | defaults to available tasks |

<a name="QuasarCli+run"></a>

### quasarCli.run([args]) ⇒ <code>promise</code>
runs the command from the arguments passed in from the command line and invocation

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | <code>object</code> | <code>{}</code> | 

<a name="QuasarCli+runProcess"></a>

### quasarCli.runProcess(args, resolve, reject) ⇒ <code>promise</code>
runs the arguments as a single batch process

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 
| resolve | <code>function</code> | 
| reject | <code>function</code> | 

<a name="QuasarCli+spawnElectronApp"></a>

### quasarCli.spawnElectronApp()
spawns a new instance of electron from the applicationRoot folder

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  
<a name="QuasarCli+spawnWebApp"></a>

### quasarCli.spawnWebApp() ⇒ <code>boolean</code>
spawns the web app and web api in an express application

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  
**Returns**: <code>boolean</code> - whether or not the web app was successfully run  
<a name="QuasarCli+spawnWebForm"></a>

### quasarCli.spawnWebForm() ⇒ <code>boolean</code>
spawns the web form and web api in an express application

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  
**Returns**: <code>boolean</code> - whether or not the web form was successfully run  
<a name="QuasarCli+watchJobs"></a>

### quasarCli.watchJobs()
watches the jobs created folder for new files created and process the argsFile as a new quasar build

**Kind**: instance method of [<code>QuasarCli</code>](#QuasarCli)  
<a name="QuasarConfig"></a>

## QuasarConfig
Contains the path information for loading quasar files.

**Kind**: global class  
**Export**:   

* [QuasarConfig](#QuasarConfig)
    * [.applicationRoot](#QuasarConfig+applicationRoot) ⇒ <code>string</code>
    * [.assetsFolder](#QuasarConfig+assetsFolder) ⇒ <code>string</code>
    * [.debrisFolder](#QuasarConfig+debrisFolder) ⇒ <code>string</code>
    * [.jobsFolder](#QuasarConfig+jobsFolder) ⇒ <code>string</code>
    * [.node_modules](#QuasarConfig+node_modules) ⇒ <code>string</code>
    * [.outputFolder](#QuasarConfig+outputFolder) ⇒ <code>string</code>
    * [.quasarsFolder](#QuasarConfig+quasarsFolder) ⇒ <code>string</code>
    * [.sourcesFolder](#QuasarConfig+sourcesFolder) ⇒ <code>string</code>
    * [.tasks](#QuasarConfig+tasks) ⇒ <code>array</code>
    * [.tasks](#QuasarConfig+tasks)
    * [.templatesFolder](#QuasarConfig+templatesFolder) ⇒ <code>string</code>
    * [.init(applicationRoot, [outputRoot])](#QuasarConfig+init)

<a name="QuasarConfig+applicationRoot"></a>

### quasarConfig.applicationRoot ⇒ <code>string</code>
the absolute path of the application

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - application root path  
**Read only**: true  
<a name="QuasarConfig+assetsFolder"></a>

### quasarConfig.assetsFolder ⇒ <code>string</code>
the absolute path of the assets folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - assets folder path  
**Read only**: true  
<a name="QuasarConfig+debrisFolder"></a>

### quasarConfig.debrisFolder ⇒ <code>string</code>
the absolute path of the debris folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - debris folder path  
**Read only**: true  
<a name="QuasarConfig+jobsFolder"></a>

### quasarConfig.jobsFolder ⇒ <code>string</code>
the absolute path of the jobs folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - jobs folder path  
**Read only**: true  
<a name="QuasarConfig+node_modules"></a>

### quasarConfig.node_modules ⇒ <code>string</code>
the absolute path of the node_modules folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - node_modules folder path  
**Read only**: true  
<a name="QuasarConfig+outputFolder"></a>

### quasarConfig.outputFolder ⇒ <code>string</code>
the absolute path of the output folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - output folder path  
**Read only**: true  
<a name="QuasarConfig+quasarsFolder"></a>

### quasarConfig.quasarsFolder ⇒ <code>string</code>
the absolute path of the quasars folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - quasars folder path  
**Read only**: true  
<a name="QuasarConfig+sourcesFolder"></a>

### quasarConfig.sourcesFolder ⇒ <code>string</code>
the absolute path of the sources folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - sources folder path  
**Read only**: true  
<a name="QuasarConfig+tasks"></a>

### quasarConfig.tasks ⇒ <code>array</code>
an array of tasks for this configuration

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>array</code> - list of tasks  
**Read only**: true  
<a name="QuasarConfig+tasks"></a>

### quasarConfig.tasks
sets the list of tasks for this configuration

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  

| Param | Type |
| --- | --- |
| tasks | <code>array</code> | 

<a name="QuasarConfig+templatesFolder"></a>

### quasarConfig.templatesFolder ⇒ <code>string</code>
the absolute path of the templates folder

**Kind**: instance property of [<code>QuasarConfig</code>](#QuasarConfig)  
**Returns**: <code>string</code> - templates folder path  
**Read only**: true  
<a name="QuasarConfig+init"></a>

### quasarConfig.init(applicationRoot, [outputRoot])
initializes the configuration values from an applicationRoot which defaults to the running process location

**Kind**: instance method of [<code>QuasarConfig</code>](#QuasarConfig)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| applicationRoot | <code>string</code> |  | defaults to the running process location |
| [outputRoot] | <code>string</code> | <code>null</code> | the output root location |

<a name="DTQuasarTask"></a>

## DTQuasarTask ⇐ [<code>QuasarTask</code>](#QuasarTask)
A quasar task with Digital Trends specific business logic

**Kind**: global class  
**Extends**: [<code>QuasarTask</code>](#QuasarTask)  
**Export**:   

* [DTQuasarTask](#DTQuasarTask) ⇐ [<code>QuasarTask</code>](#QuasarTask)
    * [.getDefaultQuasarQuestions()](#DTQuasarTask+getDefaultQuasarQuestions) ⇒ <code>array</code>
    * [.resolveQuasArgs([args])](#DTQuasarTask+resolveQuasArgs)
    * [.build()](#QuasarTask+build) ⇒ <code>promise</code>
    * [.cleanUp()](#QuasarTask+cleanUp)
    * [.getQuasarPrompts()](#QuasarTask+getQuasarPrompts) ⇒ <code>array</code>
    * [.promptUser()](#QuasarTask+promptUser) ⇒ <code>promise</code>
    * [.registerRequiredQuasArgs([requiredArgs], [optionalRequiredArgs], [clobber])](#QuasarTask+registerRequiredQuasArgs)
    * [.registerTasks()](#QuasarTask+registerTasks)
    * [.run([args])](#QuasarTask+run) ⇒ <code>promise</code>
    * [.setConfig(_config, [applicationRoot], [force])](#QuasarTask+setConfig)
    * [.setDefaultQuasArgs(qType, [additionalArgs])](#QuasarTask+setDefaultQuasArgs) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.setSourceAndOutputPlusArgs([args])](#QuasarTask+setSourceAndOutputPlusArgs)
    * [.setSourceQuaArgsFromSourceFiles(map, defaultKey)](#QuasarTask+setSourceQuaArgsFromSourceFiles)
    * [.validateRequiredArgs([args])](#QuasarTask+validateRequiredArgs) ⇒ <code>promise</code>

<a name="DTQuasarTask+getDefaultQuasarQuestions"></a>

### dtQuasarTask.getDefaultQuasarQuestions() ⇒ <code>array</code>
returns a list of default prompts for a quasar.

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Overrides**: [<code>getDefaultQuasarQuestions</code>](#QuasarTask+getDefaultQuasarQuestions)  
**Returns**: <code>array</code> - list of default prompts  
<a name="DTQuasarTask+resolveQuasArgs"></a>

### dtQuasarTask.resolveQuasArgs([args])
sets digital trends specific quasArgs data.

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Overrides**: [<code>resolveQuasArgs</code>](#QuasarTask+resolveQuasArgs)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+build"></a>

### dtQuasarTask.build() ⇒ <code>promise</code>
Builds the quasar into a single outputFile.

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Returns**: <code>promise</code> - the build promise chane  
<a name="QuasarTask+cleanUp"></a>

### dtQuasarTask.cleanUp()
deletes the assets folder and any other temporary build files

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
<a name="QuasarTask+getQuasarPrompts"></a>

### dtQuasarTask.getQuasarPrompts() ⇒ <code>array</code>
retrieves the list of inquirer questions to ask the user

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Returns**: <code>array</code> - array of questions  
**See**: https://www.npmjs.com/package/inquirer#questions  
<a name="QuasarTask+promptUser"></a>

### dtQuasarTask.promptUser() ⇒ <code>promise</code>
prompts the user from the CLI to get the QuasArgs

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Returns**: <code>promise</code> - prompt promise  
<a name="QuasarTask+registerRequiredQuasArgs"></a>

### dtQuasarTask.registerRequiredQuasArgs([requiredArgs], [optionalRequiredArgs], [clobber])
adds required and optional defined arguments, and the defaults, within the quasArgs

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Summary**: This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter  
**See**: https://www.npmjs.com/package/inquirer#questions  

| Param | Type | Default |
| --- | --- | --- |
| [requiredArgs] | <code>array</code> | <code>[]</code> | 
| [optionalRequiredArgs] | <code>array</code> | <code>[]</code> | 
| [clobber] | <code>boolean</code> | <code>true</code> | 

<a name="QuasarTask+registerTasks"></a>

### dtQuasarTask.registerTasks()
register the build tasks for this quasar

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
<a name="QuasarTask+run"></a>

### dtQuasarTask.run([args]) ⇒ <code>promise</code>
Runs the quasar through validation, build, then cleanup.

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+setConfig"></a>

### dtQuasarTask.setConfig(_config, [applicationRoot], [force])
sets the configuration values from the quasar runtime

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| _config | [<code>QuasarConfig</code>](#QuasarConfig) |  | 
| [applicationRoot] | <code>String</code> | <code>process.cwd()</code> | 
| [force] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarTask+setDefaultQuasArgs"></a>

### dtQuasarTask.setDefaultQuasArgs(qType, [additionalArgs]) ⇒ [<code>QuasArgs</code>](#QuasArgs)
sets the default quasArgs including command line arguments in order of priority from: QuasArgs class, additionalArgs param, cliArgs, loaded from file

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| qType | <code>string</code> |  | 
| [additionalArgs] | <code>object</code> | <code>{}</code> | 

<a name="QuasarTask+setSourceAndOutputPlusArgs"></a>

### dtQuasarTask.setSourceAndOutputPlusArgs([args])
sets the default values of the source and output arguments from user input

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+setSourceQuaArgsFromSourceFiles"></a>

### dtQuasarTask.setSourceQuaArgsFromSourceFiles(map, defaultKey)
unpacks source files and sets quasArg values using the regex map passed in

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  

| Param | Type |
| --- | --- |
| map | <code>object</code> | 
| defaultKey | <code>string</code> | 

<a name="QuasarTask+validateRequiredArgs"></a>

### dtQuasarTask.validateRequiredArgs([args]) ⇒ <code>promise</code>
sets args from quasar form data and runs validation on the final fields

**Kind**: instance method of [<code>DTQuasarTask</code>](#DTQuasarTask)  
**Returns**: <code>promise</code> - resolves to true if validation is successful  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarElectronApp"></a>

## QuasarElectronApp
Runs the QuasarWebApp in an electron window

**Kind**: global class  
**Export**:   

* [QuasarElectronApp](#QuasarElectronApp)
    * [.createWindow([title], [htmlContent])](#QuasarElectronApp+createWindow) ⇒ <code>BrowserWindow</code>
    * [.electrify()](#QuasarElectronApp+electrify) ⇒ <code>BrowserWindow</code>
    * [.getIconFilePath([rootPath], [iconName], [iconExt])](#QuasarElectronApp+getIconFilePath) ⇒ <code>BrowserWindow</code>
    * [.runElectron()](#QuasarElectronApp+runElectron)
    * [.showErrorWindow(error)](#QuasarElectronApp+showErrorWindow) ⇒ <code>BrowserWindow</code>

<a name="QuasarElectronApp+createWindow"></a>

### quasarElectronApp.createWindow([title], [htmlContent]) ⇒ <code>BrowserWindow</code>
creates an electron window

**Kind**: instance method of [<code>QuasarElectronApp</code>](#QuasarElectronApp)  

| Param | Type | Default |
| --- | --- | --- |
| [title] | <code>string</code> | <code>&quot;&#x27;quasar&#x27;&quot;</code> | 
| [htmlContent] | <code>string</code> | <code>null</code> | 

<a name="QuasarElectronApp+electrify"></a>

### quasarElectronApp.electrify() ⇒ <code>BrowserWindow</code>
runs the quasar cli to watch the jobs folder, then creates the app window

**Kind**: instance method of [<code>QuasarElectronApp</code>](#QuasarElectronApp)  
<a name="QuasarElectronApp+getIconFilePath"></a>

### quasarElectronApp.getIconFilePath([rootPath], [iconName], [iconExt]) ⇒ <code>BrowserWindow</code>
returns the path to the icon file

**Kind**: instance method of [<code>QuasarElectronApp</code>](#QuasarElectronApp)  

| Param | Type | Default |
| --- | --- | --- |
| [rootPath] | <code>string</code> | <code>&quot;appRoot&quot;</code> | 
| [iconName] | <code>string</code> | <code>&quot;&#x27;icon&#x27;&quot;</code> | 
| [iconExt] | <code>string</code> | <code>&quot;&#x27;.ico&#x27;&quot;</code> | 

<a name="QuasarElectronApp+runElectron"></a>

### quasarElectronApp.runElectron()
Creates an electron app and sets it up to run quasar

**Kind**: instance method of [<code>QuasarElectronApp</code>](#QuasarElectronApp)  
<a name="QuasarElectronApp+showErrorWindow"></a>

### quasarElectronApp.showErrorWindow(error) ⇒ <code>BrowserWindow</code>
creates a window with the content of an error for debugging purposes

**Kind**: instance method of [<code>QuasarElectronApp</code>](#QuasarElectronApp)  

| Param | Type |
| --- | --- |
| error | <code>\*</code> | 

<a name="QuasArgs"></a>

## QuasArgs
The default quasArgs object used in quasar builds.

**Kind**: global class  
**Export**:   

* [QuasArgs](#QuasArgs)
    * [.qType](#QuasArgs+qType) : <code>string</code>
    * [.domain](#QuasArgs+domain) : <code>string</code>
    * [.signature](#QuasArgs+signature) : <code>string</code>
    * [.buildUser](#QuasArgs+buildUser) : <code>string</code>
    * [.target](#QuasArgs+target) : <code>string</code>
    * [.status](#QuasArgs+status) : <code>string</code>
    * [.jobTimestamp](#QuasArgs+jobTimestamp) : <code>string</code>
    * [.outputFolder](#QuasArgs+outputFolder) : <code>string</code>
    * [.sourcesFolder](#QuasArgs+sourcesFolder) : <code>string</code>
    * [.jobsFolder](#QuasArgs+jobsFolder) : <code>string</code>
    * [.debrisFolder](#QuasArgs+debrisFolder) : <code>string</code>
    * [.templatesFolder](#QuasArgs+templatesFolder) : <code>string</code>
    * [.assetsFolder](#QuasArgs+assetsFolder) : <code>string</code>
    * [.targetFilePath](#QuasArgs+targetFilePath) : <code>string</code>
    * [.argsFile](#QuasArgs+argsFile) : <code>string</code>
    * [.targetEnvironments](#QuasArgs+targetEnvironments) : <code>array</code>
    * [.cliArgs](#QuasArgs+cliArgs) : <code>map</code>
    * [.runArgs](#QuasArgs+runArgs) : <code>map</code>
    * [.sourceFileRegexMaps](#QuasArgs+sourceFileRegexMaps) : <code>map</code>
    * [.debris](#QuasArgs+debris) : <code>array</code>
    * [.requiredArgs](#QuasArgs+requiredArgs) : <code>array</code>
    * [.dbFolder](#QuasArgs+dbFolder) : <code>string</code>
    * [.bucket](#QuasArgs+bucket) : <code>string</code>
    * [.logFile](#QuasArgs+logFile) : <code>string</code>
    * [.sourceExt](#QuasArgs+sourceExt) : <code>string</code>
    * [.outputExt](#QuasArgs+outputExt) : <code>string</code>
    * [.cdnUrlStart](#QuasArgs+cdnUrlStart) : <code>string</code>
    * [.cssInjectTargets](#QuasArgs+cssInjectTargets) : <code>Array.&lt;string&gt;</code>
    * [.jsInjectTargets](#QuasArgs+jsInjectTargets) : <code>Array.&lt;string&gt;</code>
    * [.outputVersion](#QuasArgs+outputVersion) : <code>int</code>
    * [.uploadOutputFileAsTxtFile](#QuasArgs+uploadOutputFileAsTxtFile) : <code>boolean</code>
    * [.uploadToS3](#QuasArgs+uploadToS3) : <code>boolean</code>
    * [.unpackSourceFiles](#QuasArgs+unpackSourceFiles) : <code>boolean</code>
    * [.minifyScripts](#QuasArgs+minifyScripts) : <code>boolean</code>
    * [.minifyStyles](#QuasArgs+minifyStyles) : <code>boolean</code>
    * [.minifyHtml](#QuasArgs+minifyHtml) : <code>boolean</code>
    * [.overwriteUnpackDestination](#QuasArgs+overwriteUnpackDestination) : <code>boolean</code>
    * [.overwriteTargetFileFromTemplate](#QuasArgs+overwriteTargetFileFromTemplate) : <code>boolean</code>
    * [.cleanUpTargetFileTemplate](#QuasArgs+cleanUpTargetFileTemplate) : <code>boolean</code>
    * [.useJobTimestampForBuild](#QuasArgs+useJobTimestampForBuild) : <code>boolean</code>
    * [.buildCompletedSuccessfully](#QuasArgs+buildCompletedSuccessfully) : <code>boolean</code>
    * [.excludeOutputFileFromUpload](#QuasArgs+excludeOutputFileFromUpload) : <code>boolean</code>
    * [.wrapInHtmlTags](#QuasArgs+wrapInHtmlTags) : <code>boolean</code>
    * [.versionOutputFile](#QuasArgs+versionOutputFile) : <code>boolean</code>
    * [.debugAssetsFolder](#QuasArgs+debugAssetsFolder) : <code>boolean</code>

<a name="QuasArgs+qType"></a>

### quasArgs.qType : <code>string</code>
This is the main field of a quasar and is used in many places and used to infer build task and template files

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the quasar type  
<a name="QuasArgs+domain"></a>

### quasArgs.domain : <code>string</code>
This field could be used to designate builds between different pages, or to represent different data types. In the end, it's up to the implementation as to how this is relevant.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the namespace or global name of the quasar  
**Example**  
```js
(the name of a company) 'Toyota'
```
<a name="QuasArgs+signature"></a>

### quasArgs.signature : <code>string</code>
This field is more granular than the field before it, domain, and represents a more specific identifier for something lik a region or position in a document.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the id or build name of the quasar  
**Example**  
```js
(the name of a product) 'Tacoma'
```
<a name="QuasArgs+buildUser"></a>

### quasArgs.buildUser : <code>string</code>
This field defaults to the machine hostname

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the name of the user who initiated the build  
<a name="QuasArgs+target"></a>

### quasArgs.target : <code>string</code>
This field tells quasar to look when targeting a file for a build. If left blank, this will be inferred from the qType variable and fallback to any .html quasar can find between the templates folder and the assets folder.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the main file to target when building the quasar  
<a name="QuasArgs+status"></a>

### quasArgs.status : <code>string</code>
This field changes as the quasar moves through each phase of the build

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the status of the build of quasar  
**Default**: <code>&quot;&#x27;created&#x27;&quot;</code>  
**Example**  
```js
[ 'created', 'queued', 'completed', 'failed' ]
```
<a name="QuasArgs+jobTimestamp"></a>

### quasArgs.jobTimestamp : <code>string</code>
This field also serves as specific job identifier for the assets folder and can be used to version the output

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the timestamp of the build  
**Default**: <code>&quot;Date.now()&quot;</code>  
<a name="QuasArgs+outputFolder"></a>

### quasArgs.outputFolder : <code>string</code>
This path is where quasar outputs are saved once the build has finished.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the output folder  
**Example**  
```js
`/${publicFolder}/${domain}/${signature}`
```
<a name="QuasArgs+sourcesFolder"></a>

### quasArgs.sourcesFolder : <code>string</code>
This path is where sources are downloaded to and pulled from during build time.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the sources folder  
<a name="QuasArgs+jobsFolder"></a>

### quasArgs.jobsFolder : <code>string</code>
This path is where quasArgs are saved as the build moves through the each status of the build.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the jobs folder  
<a name="QuasArgs+debrisFolder"></a>

### quasArgs.debrisFolder : <code>string</code>
This path is where quasArgs are saved as the build moves through the each status of the build.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the debris folder  
<a name="QuasArgs+templatesFolder"></a>

### quasArgs.templatesFolder : <code>string</code>
This path is where quasar gets the template files for the build. This field looks for a folder with the name of the qType.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the sources folder  
**Default**: <code>&quot;&#x60;${args.config.templatesFolder}/${this.qType}&#x60;&quot;</code>  
<a name="QuasArgs+assetsFolder"></a>

### quasArgs.assetsFolder : <code>string</code>
This path is where quasar puts the template files for the build to stage for output. Files in this folder are modified ahead of build time and then data from both the quasArgs set by the user are piped into the template files.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: The absolute path to the assets folder  
**Default**: <code>&quot;&#x60;${args.config.assetsFolder}/${this.qType}&#x60;&quot;</code>  
<a name="QuasArgs+targetFilePath"></a>

### quasArgs.targetFilePath : <code>string</code>
This field is used at build time and cannot be set by the user.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the full filename of the target  
**Default**: <code>&quot;&#x60;${this.qType}.html&#x60;&quot;</code>  
<a name="QuasArgs+argsFile"></a>

### quasArgs.argsFile : <code>string</code>
This field is used at build time and cannot be set by the user.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the asbolute path to the jobfile which is saved into the jobs folder under the status  
**Default**: <code>&quot;&#x60;${this.jobsFolder}/${this.status}/${this.qType}_${this.jobTimestamp}.json&#x60;&quot;</code>  
<a name="QuasArgs+targetEnvironments"></a>

### quasArgs.targetEnvironments : <code>array</code>
This field is used to designate a quasar's intended output to differentiate it between a build of the same type used between different use cases only by the environment it is in.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the acronyms of each environment where this quasar will live  
<a name="QuasArgs+cliArgs"></a>

### quasArgs.cliArgs : <code>map</code>
**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the arguments that the quasar has been run with from the CLI  
<a name="QuasArgs+runArgs"></a>

### quasArgs.runArgs : <code>map</code>
**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the arguments that the quasar has been run with from the CLI with a jobFile  
<a name="QuasArgs+sourceFileRegexMaps"></a>

### quasArgs.sourceFileRegexMaps : <code>map</code>
**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the regex maps to required args for inferring sourceFile assets  
<a name="QuasArgs+debris"></a>

### quasArgs.debris : <code>array</code>
This field is a list of js or css files to inject into the output. The contents of the files are piped into script or style tags depending on the file type. Debris are piped into the file only once.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the list of debris to require with this quasar build.  
<a name="QuasArgs+requiredArgs"></a>

### quasArgs.requiredArgs : <code>array</code>
This field is used with the inquirerjs node package and follows the structure of 'questions'.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the args that the user can set from a UI.  
**See**: https://github.com/SBoudrias/Inquirer.js/  
**Example**  
```js
const questions = [{
				type: 'input',
				name: 'domain',
				shortMessage: 'Domain',
				message: 'Enter the name of the domain to be used in building assets:',
				required: true,
			}];
```
<a name="QuasArgs+dbFolder"></a>

### quasArgs.dbFolder : <code>string</code>
**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the name of the folder to upload to when uploading files to Dropbox.  
<a name="QuasArgs+bucket"></a>

### quasArgs.bucket : <code>string</code>
**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the name of the bucket to upload to when uploading files to Amazon AWS S3.  
<a name="QuasArgs+logFile"></a>

### quasArgs.logFile : <code>string</code>
If this field is populated then critical level logs will also be saved to the file specified

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the file to log outputs to  
**Default**: <code>&quot;&#x27;.log&#x27;&quot;</code>  
<a name="QuasArgs+sourceExt"></a>

### quasArgs.sourceExt : <code>string</code>
This field is appended to the source name when seeking to unpack or copy source files to the assets folder

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the extension of the source file  
**Default**: <code>&quot;&#x27;.zip&#x27;&quot;</code>  
<a name="QuasArgs+outputExt"></a>

### quasArgs.outputExt : <code>string</code>
This field is appended to the outputFile name when building the output.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the extension of the outputFile  
**Default**: <code>&quot;&#x27;.html&#x27;&quot;</code>  
<a name="QuasArgs+cdnUrlStart"></a>

### quasArgs.cdnUrlStart : <code>string</code>
This

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the  
**Default**: <code>&quot;&#x27;https&#x3D;//cdn.com/&#x27;&quot;</code>  
<a name="QuasArgs+cssInjectTargets"></a>

### quasArgs.cssInjectTargets : <code>Array.&lt;string&gt;</code>
These tags are used to search the outputFile and insert default css files found in the template

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: a list of the targets for pre and post injection of style tags  
<a name="QuasArgs+jsInjectTargets"></a>

### quasArgs.jsInjectTargets : <code>Array.&lt;string&gt;</code>
These tags are used to search the outputFile and insert default js files found in the template

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: a list of the targets for pre and post injection of script tags  
<a name="QuasArgs+outputVersion"></a>

### quasArgs.outputVersion : <code>int</code>
This field is not used unless there is another file found with the same id, in which case `_${++outputVersion}` is appended to the outputFile name.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: the version number to append to the end of a file  
<a name="QuasArgs+uploadOutputFileAsTxtFile"></a>

### quasArgs.uploadOutputFileAsTxtFile : <code>boolean</code>
This will use the Dropbox credentials found in a .config file.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: upload the outputFile to Dropbpx as a .txt file  
**Default**: <code>false</code>  
<a name="QuasArgs+uploadToS3"></a>

### quasArgs.uploadToS3 : <code>boolean</code>
This will use the Amazon AWS IAM credentials found in a .config file.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: upload files to S3 using the domain and signature fields into the destination set in the bucket field.  
**Default**: <code>false</code>  
<a name="QuasArgs+unpackSourceFiles"></a>

### quasArgs.unpackSourceFiles : <code>boolean</code>
This field is mostly used for testing purposes.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: this will flag whether or not to unpack (unzip) the source file  
**Default**: <code>true</code>  
<a name="QuasArgs+minifyScripts"></a>

### quasArgs.minifyScripts : <code>boolean</code>
This field is used at build time to flag whether or not to run minification strategies on injected script files.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: run minification on script files injected  
**Default**: <code>false</code>  
<a name="QuasArgs+minifyStyles"></a>

### quasArgs.minifyStyles : <code>boolean</code>
This field is used at build time to flag whether or not to run minification strategies on injected style files.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: run minification on style files injected  
**Default**: <code>false</code>  
<a name="QuasArgs+minifyHtml"></a>

### quasArgs.minifyHtml : <code>boolean</code>
This field is used at build time to flag whether or not to run minification strategies on the outputFile.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: run minification on html output  
**Default**: <code>false</code>  
<a name="QuasArgs+overwriteUnpackDestination"></a>

### quasArgs.overwriteUnpackDestination : <code>boolean</code>
This field determines whether or not to preserve or destroy an existing outputFile when copying files to the assets folder during the unpacking of source files.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: overwrite existing assets folder contents on unpack  
**Default**: <code>false</code>  
<a name="QuasArgs+overwriteTargetFileFromTemplate"></a>

### quasArgs.overwriteTargetFileFromTemplate : <code>boolean</code>
This field determines whether or no to override an existing file at the targetFilePath with the file `${qType}.html` from the templates folder.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: overwrite the targetFile using the template file  
**Default**: <code>true</code>  
<a name="QuasArgs+cleanUpTargetFileTemplate"></a>

### quasArgs.cleanUpTargetFileTemplate : <code>boolean</code>
This is a debug field which, if set, will have quasar delete the targetFile after it has been used in the build.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: delete the targetFile  
**Default**: <code>false</code>  
<a name="QuasArgs+useJobTimestampForBuild"></a>

### quasArgs.useJobTimestampForBuild : <code>boolean</code>
This field, if set, will append the jobTimestamp to assets to ensure uniqueness of the build.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: append the jobTimestamp to the assetsFolder and asset files  
**Default**: <code>true</code>  
<a name="QuasArgs+buildCompletedSuccessfully"></a>

### quasArgs.buildCompletedSuccessfully : <code>boolean</code>
This field is used by the runtime and set upon successful build before outputting the args to file.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: denotes whether or not these quasArgs have been put through a build and have succeeded  
**Default**: <code>false</code>  
<a name="QuasArgs+excludeOutputFileFromUpload"></a>

### quasArgs.excludeOutputFileFromUpload : <code>boolean</code>
This is mostly a debug field which allows quasar to not upload the outputFile.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: exclude the outputFile from uploading to Amazon AWS S3  
**Default**: <code>false</code>  
<a name="QuasArgs+wrapInHtmlTags"></a>

### quasArgs.wrapInHtmlTags : <code>boolean</code>
This field denotes whether or not the output should be wrapped in html tags.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: wrap the outputFile in html tags  
**Default**: <code>true</code>  
<a name="QuasArgs+versionOutputFile"></a>

### quasArgs.versionOutputFile : <code>boolean</code>
This field tells quasar to append the version number to the outputFile if a file exists already with that name in the outputFolder.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: append the version to the outputFile, if one already exists with that name  
**Default**: <code>true</code>  
<a name="QuasArgs+debugAssetsFolder"></a>

### quasArgs.debugAssetsFolder : <code>boolean</code>
This is a debug field that allows a dev to analyze what state the assets files were in before injection and build.

**Kind**: instance property of [<code>QuasArgs</code>](#QuasArgs)  
**Summary**: debug flag for the files used as templates for the build  
**Default**: <code>false</code>  
<a name="QuasarRuntime"></a>

## QuasarRuntime
The quasar Runtime [use the quasar API, not this class directly].

**Kind**: global class  
**Requires**: <code>module:gulp</code>, <code>module:gulp-template</code>, <code>module:gulp-rename</code>, <code>module:gulp-inject-string</code>, <code>module:gulp-insert</code>, <code>module:gulp-concat</code>, <code>module:gulp-flatmap</code>, <code>module:gulp-mustache</code>, <code>module:gulp-clean-css</code>, <code>module:gulp-include</code>, <code>module:gulp-html-beautify</code>, <code>module:gulp-browserify</code>, <code>module:gulp-babel</code>, <code>module:gulp-s3-upload</code>, <code>module:gulp-dropbox</code>, <code>module:gulp-download-files</code>  
**Export**:   

* [QuasarRuntime](#QuasarRuntime)
    * [new QuasarRuntime()](#new_QuasarRuntime_new)
    * [.config](#QuasarRuntime+config) : [<code>QuasarConfig</code>](#QuasarConfig)
    * [.cleanDevFolders(quasArgs)](#QuasarRuntime+cleanDevFolders) ⇒ <code>promise</code>
    * [.cleanOutputFolders(quasArgs, [allFolders])](#QuasarRuntime+cleanOutputFolders) ⇒ <code>promise</code>
    * [.cleanAssetsFolder(quasArgs, subdirectory)](#QuasarRuntime+cleanAssetsFolder) ⇒ <code>promise</code>
    * [.compileScriptsToAssetsFolder(quasArgs, files, outputFilename)](#QuasarRuntime+compileScriptsToAssetsFolder) ⇒ <code>promise</code>
    * [.compileStylesToAssetsFolder(quasArgs, files, outputFilename)](#QuasarRuntime+compileStylesToAssetsFolder) ⇒ <code>promise</code>
    * [.compileTargetFileToAssetsFolder(quasArgs)](#QuasarRuntime+compileTargetFileToAssetsFolder) ⇒ <code>promise</code>
    * [.copyFilesFromAssetsFolderToOutput(quasArgs, files, excludeFiles)](#QuasarRuntime+copyFilesFromAssetsFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesFromSourcesFolderToOutput(quasArgs, [files], [excludeFiles])](#QuasarRuntime+copyFilesFromSourcesFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesFromTemplatesFolderToAssetsFolder(quasArgs, files, [excludeFiles])](#QuasarRuntime+copyFilesFromTemplatesFolderToAssetsFolder) ⇒ <code>promise</code>
    * [.copyFilesFromTemplatesFolderToOutput(quasArgs, files, [excludeFiles])](#QuasarRuntime+copyFilesFromTemplatesFolderToOutput) ⇒ <code>promise</code>
    * [.copyFilesToOutputFolder(quasArgs, fromDirectory, files, [excludeFiles])](#QuasarRuntime+copyFilesToOutputFolder) ⇒ <code>promise</code>
    * [.copyTemplateFilesToAssetsPath(quasArgs)](#QuasarRuntime+copyTemplateFilesToAssetsPath) ⇒ <code>promise</code>
    * [.debug(message, obj, condition)](#QuasarRuntime+debug)
    * [.downloadFileFromUrlToSourcesFolder(quasArgs, url)](#QuasarRuntime+downloadFileFromUrlToSourcesFolder) ⇒ <code>promise</code>
    * [.downloadSourceFilesToSourcesFolder(quasArgs)](#QuasarRuntime+downloadSourceFilesToSourcesFolder) ⇒ <code>promise</code>
    * [.findTargetFile(quasArgs, nextPath, originalPath, exhausted)](#QuasarRuntime+findTargetFile) ⇒ <code>string</code>
    * [.getAvailableSourceFilenames(quasArgs)](#QuasarRuntime+getAvailableSourceFilenames) ⇒ <code>array</code>
    * [.getAvailableDebrisFilenames(quasArgs)](#QuasarRuntime+getAvailableDebrisFilenames) ⇒ <code>array</code>
    * [.getAvailableTaskNames()](#QuasarRuntime+getAvailableTaskNames) ⇒ <code>array</code>
    * [.getQuasarOutputPath([quasArgs])](#QuasarRuntime+getQuasarOutputPath) ⇒ <code>string</code>
    * [.getTaskNames([dir])](#QuasarRuntime+getTaskNames) ⇒ <code>array</code>
    * [.getTasksAssociatedByOutputType(taskNames, [orderByQuasar])](#QuasarRuntime+getTasksAssociatedByOutputType) ⇒ <code>object</code>
    * [.injectCode(quasArgs)](#QuasarRuntime+injectCode) ⇒ <code>object</code>
    * [.injectDebrisFilesIntoStream(quasArgs, contents, [minify])](#QuasarRuntime+injectDebrisFilesIntoStream) ⇒ <code>stream</code>
    * [.injectRequiredFilesIntoStream(quasArgs, contents)](#QuasarRuntime+injectRequiredFilesIntoStream) ⇒ <code>stream</code>
    * [.loadTasks(taskPaths, [loadDefaults], [clobber])](#QuasarRuntime+loadTasks) ⇒ <code>array</code>
    * [.logArgsToFile(quasArgs, [toStatus], [overwite])](#QuasarRuntime+logArgsToFile) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.logBuildQueued(quasArgs)](#QuasarRuntime+logBuildQueued) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.logCritical(message, obj, color)](#QuasarRuntime+logCritical)
    * [.logData(message, obj, color)](#QuasarRuntime+logData)
    * [.logEnd(message, obj, color)](#QuasarRuntime+logEnd)
    * [.logError(message, obj, color)](#QuasarRuntime+logError)
    * [.logInfo(message, obj, color)](#QuasarRuntime+logInfo)
    * [.logSuccess(message, obj, color)](#QuasarRuntime+logSuccess)
    * [.makePromptRequired()](#QuasarRuntime+makePromptRequired) ⇒ <code>function</code>
    * [.makePromptRequiredAndSanitary()](#QuasarRuntime+makePromptRequiredAndSanitary) ⇒ <code>function</code>
    * [.moveTargetFilesToRootOfAssetsPath(quasArgs)](#QuasarRuntime+moveTargetFilesToRootOfAssetsPath) ⇒ <code>promise</code>
    * [.outputToHtmlFile(quasArgs)](#QuasarRuntime+outputToHtmlFile) ⇒ <code>object</code>
    * [.outputToJsonFile(quasArgs)](#QuasarRuntime+outputToJsonFile) ⇒ <code>object</code>
    * [.outputToTextFile(quasArgs)](#QuasarRuntime+outputToTextFile) ⇒ <code>object</code>
    * [.promptConsole(questions, getResults, [showOptional], [optionalOnly])](#QuasarRuntime+promptConsole) ⇒ <code>promise</code>
    * [.runFromArgsFile(qType, argsFile)](#QuasarRuntime+runFromArgsFile)
    * [.runLastSuccessfulBuild([quasArgs])](#QuasarRuntime+runLastSuccessfulBuild) ⇒ <code>promise</code>
    * [.runQuasar(quasar, [quasArgs], registerTask, end)](#QuasarRuntime+runQuasar) ⇒ <code>promise</code>
    * [.unpackSourceFiles(quasArgs, subDirectory)](#QuasarRuntime+unpackSourceFiles) ⇒ <code>promise</code>
    * [.uploadOutputFiles(quasArgs, [excludeFiles])](#QuasarRuntime+uploadOutputFiles) ⇒ <code>promise</code>
    * [.uploadOutputFileAsTxt(quasArgs)](#QuasarRuntime+uploadOutputFileAsTxt) ⇒ <code>promise</code>
    * [.uploadOutputFileWithMetadata(quasArgs)](#QuasarRuntime+uploadOutputFileWithMetadata) ⇒ <code>promise</code>

<a name="new_QuasarRuntime_new"></a>

### new QuasarRuntime()
the build pipeline of the quasar framework

<a name="QuasarRuntime+config"></a>

### quasarRuntime.config : [<code>QuasarConfig</code>](#QuasarConfig)
**Kind**: instance property of [<code>QuasarRuntime</code>](#QuasarRuntime)  
<a name="QuasarRuntime+cleanDevFolders"></a>

### quasarRuntime.cleanDevFolders(quasArgs) ⇒ <code>promise</code>
cleans local files in the application root for development testing

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+cleanOutputFolders"></a>

### quasarRuntime.cleanOutputFolders(quasArgs, [allFolders]) ⇒ <code>promise</code>
deletes the contents of the output root folder and all subdirectories

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [allFolders] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+cleanAssetsFolder"></a>

### quasarRuntime.cleanAssetsFolder(quasArgs, subdirectory) ⇒ <code>promise</code>
deletes the contents of the assets folder for this quasar

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| subdirectory | <code>string</code> | 

<a name="QuasarRuntime+compileScriptsToAssetsFolder"></a>

### quasarRuntime.compileScriptsToAssetsFolder(quasArgs, files, outputFilename) ⇒ <code>promise</code>
Compiles jsx templates in the templates folder and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| files | <code>array</code> \| <code>string</code> | gulp src input |
| outputFilename | <code>string</code> |  |

<a name="QuasarRuntime+compileStylesToAssetsFolder"></a>

### quasarRuntime.compileStylesToAssetsFolder(quasArgs, files, outputFilename) ⇒ <code>promise</code>
Compiles sass templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| files | <code>array</code> \| <code>string</code> | gulp src input |
| outputFilename | <code>string</code> |  |

<a name="QuasarRuntime+compileTargetFileToAssetsFolder"></a>

### quasarRuntime.compileTargetFileToAssetsFolder(quasArgs) ⇒ <code>promise</code>
compiles mustache templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>promise</code> - gulp chain  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+copyFilesFromAssetsFolderToOutput"></a>

### quasarRuntime.copyFilesFromAssetsFolderToOutput(quasArgs, files, excludeFiles) ⇒ <code>promise</code>
copies files from the assets folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| files | <code>\*</code> | 
| excludeFiles | <code>\*</code> | 

<a name="QuasarRuntime+copyFilesFromSourcesFolderToOutput"></a>

### quasarRuntime.copyFilesFromSourcesFolderToOutput(quasArgs, [files], [excludeFiles]) ⇒ <code>promise</code>
copies files the sources folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [files] | <code>\*</code> | <code></code> | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesFromTemplatesFolderToAssetsFolder"></a>

### quasarRuntime.copyFilesFromTemplatesFolderToAssetsFolder(quasArgs, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from the templates folder to the assets folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesFromTemplatesFolderToOutput"></a>

### quasarRuntime.copyFilesFromTemplatesFolderToOutput(quasArgs, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from the templates folder to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyFilesToOutputFolder"></a>

### quasarRuntime.copyFilesToOutputFolder(quasArgs, fromDirectory, files, [excludeFiles]) ⇒ <code>promise</code>
copies files from a directory to the output folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| fromDirectory | <code>\*</code> |  | 
| files | <code>\*</code> |  | 
| [excludeFiles] | <code>\*</code> | <code>[]</code> | 

<a name="QuasarRuntime+copyTemplateFilesToAssetsPath"></a>

### quasarRuntime.copyTemplateFilesToAssetsPath(quasArgs) ⇒ <code>promise</code>
copies files from the templates folder to the assets folder given the quasArgs folder information

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+debug"></a>

### quasarRuntime.debug(message, obj, condition)
makes a call to log and is used as a canary for testing

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| condition | <code>string</code> | 

<a name="QuasarRuntime+downloadFileFromUrlToSourcesFolder"></a>

### quasarRuntime.downloadFileFromUrlToSourcesFolder(quasArgs, url) ⇒ <code>promise</code>
downloads source files from a url into the sources folder to be used at build time

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| url | <code>string</code> | 

<a name="QuasarRuntime+downloadSourceFilesToSourcesFolder"></a>

### quasarRuntime.downloadSourceFilesToSourcesFolder(quasArgs) ⇒ <code>promise</code>
downloads source files from a url into the sources folder to be used at build time

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+findTargetFile"></a>

### quasarRuntime.findTargetFile(quasArgs, nextPath, originalPath, exhausted) ⇒ <code>string</code>
searches for a target file in the various available folders by name, qType, oType, and extension until it finds one

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| nextPath | <code>string</code> | 
| originalPath | <code>string</code> | 
| exhausted | <code>string</code> | 

<a name="QuasarRuntime+getAvailableSourceFilenames"></a>

### quasarRuntime.getAvailableSourceFilenames(quasArgs) ⇒ <code>array</code>
gets the filenames of the source extension type from the sources folder

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>array</code> - list of filenames from sources folder  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+getAvailableDebrisFilenames"></a>

### quasarRuntime.getAvailableDebrisFilenames(quasArgs) ⇒ <code>array</code>
gets the debris filenames from the debris folder

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>array</code> - list of filenames from debris folder  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+getAvailableTaskNames"></a>

### quasarRuntime.getAvailableTaskNames() ⇒ <code>array</code>
gets an array of the loaded task names

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
<a name="QuasarRuntime+getQuasarOutputPath"></a>

### quasarRuntime.getQuasarOutputPath([quasArgs]) ⇒ <code>string</code>
gets the outputPath for quasars

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarRuntime+getTaskNames"></a>

### quasarRuntime.getTaskNames([dir]) ⇒ <code>array</code>
gets the task names from the tasks folder

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| [dir] | <code>string</code> | <code>null</code> | 

<a name="QuasarRuntime+getTasksAssociatedByOutputType"></a>

### quasarRuntime.getTasksAssociatedByOutputType(taskNames, [orderByQuasar]) ⇒ <code>object</code>
gets task names associated with the oType field

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| taskNames | <code>array</code> |  | 
| [orderByQuasar] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+injectCode"></a>

### quasarRuntime.injectCode(quasArgs) ⇒ <code>object</code>
Injects asset file references into the output file in the assets folder.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>object</code> - the quasargs used  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+injectDebrisFilesIntoStream"></a>

### quasarRuntime.injectDebrisFilesIntoStream(quasArgs, contents, [minify]) ⇒ <code>stream</code>
Injects require statements for debris.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>stream</code> - the stream written to  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| contents | <code>stream</code> |  | 
| [minify] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+injectRequiredFilesIntoStream"></a>

### quasarRuntime.injectRequiredFilesIntoStream(quasArgs, contents) ⇒ <code>stream</code>
Injects require statements for the default asset files (css and js).

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>stream</code> - the stream written to  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 
| contents | <code>stream</code> | 

<a name="QuasarRuntime+loadTasks"></a>

### quasarRuntime.loadTasks(taskPaths, [loadDefaults], [clobber]) ⇒ <code>array</code>
loads the quasar tasks into the gulp taskList

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>array</code> - the tasks loaded  

| Param | Type | Default |
| --- | --- | --- |
| taskPaths | <code>array</code> |  | 
| [loadDefaults] | <code>boolean</code> | <code>false</code> | 
| [clobber] | <code>boolean</code> | <code>true</code> | 

<a name="QuasarRuntime+logArgsToFile"></a>

### quasarRuntime.logArgsToFile(quasArgs, [toStatus], [overwite]) ⇒ [<code>QuasArgs</code>](#QuasArgs)
writes the args to file with the status passed in

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [toStatus] | <code>string</code> | <code>null</code> | 
| [overwite] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarRuntime+logBuildQueued"></a>

### quasarRuntime.logBuildQueued(quasArgs) ⇒ [<code>QuasArgs</code>](#QuasArgs)
logs quasArgs to the jobFile

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: [<code>QuasArgs</code>](#QuasArgs) - the quasargs logged with updated argsFile entry  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+logCritical"></a>

### quasarRuntime.logCritical(message, obj, color)
ogs a critical message

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logData"></a>

### quasarRuntime.logData(message, obj, color)
Logs a data message

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logEnd"></a>

### quasarRuntime.logEnd(message, obj, color)
Logs an end message

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logError"></a>

### quasarRuntime.logError(message, obj, color)
Logs an error message

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logInfo"></a>

### quasarRuntime.logInfo(message, obj, color)
Logs an info message (default)

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+logSuccess"></a>

### quasarRuntime.logSuccess(message, obj, color)
Logs a success message

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| obj | <code>object</code> | 
| color | <code>color</code> | 

<a name="QuasarRuntime+makePromptRequired"></a>

### quasarRuntime.makePromptRequired() ⇒ <code>function</code>
used with inquirer questions to ensure that values entered have a length

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
<a name="QuasarRuntime+makePromptRequiredAndSanitary"></a>

### quasarRuntime.makePromptRequiredAndSanitary() ⇒ <code>function</code>
used with inquirer questions to ensure that values entered from the CLI follow the required ruleset

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
<a name="QuasarRuntime+moveTargetFilesToRootOfAssetsPath"></a>

### quasarRuntime.moveTargetFilesToRootOfAssetsPath(quasArgs) ⇒ <code>promise</code>
moves the target html, js, and css files to the assetsFolder

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToHtmlFile"></a>

### quasarRuntime.outputToHtmlFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as HTML.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToJsonFile"></a>

### quasarRuntime.outputToJsonFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as JSON.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+outputToTextFile"></a>

### quasarRuntime.outputToTextFile(quasArgs) ⇒ <code>object</code>
Compiles the quasar into the outputFile alongside the assets into the outputFolder as TXT.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>object</code> - quasArgs including errors if they exist  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+promptConsole"></a>

### quasarRuntime.promptConsole(questions, getResults, [showOptional], [optionalOnly]) ⇒ <code>promise</code>
prompts the terminal with questions

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>promise</code> - the promise of a prompt of the user to the command line interface  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| questions | <code>array</code> |  | the questions to ask the user |
| getResults | <code>function</code> |  | callback after prompt has completed |
| [showOptional] | <code>boolean</code> | <code>false</code> |  |
| [optionalOnly] | <code>boolean</code> | <code></code> |  |

<a name="QuasarRuntime+runFromArgsFile"></a>

### quasarRuntime.runFromArgsFile(qType, argsFile)
spawns a task to run a quasar from quasArgs saved in a json file.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| qType | <code>\*</code> | 
| argsFile | <code>\*</code> | 

<a name="QuasarRuntime+runLastSuccessfulBuild"></a>

### quasarRuntime.runLastSuccessfulBuild([quasArgs]) ⇒ <code>promise</code>
runs the last successfully recorded argsFile

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  
**Returns**: <code>promise</code> - resolves to the QuasArgs used  

| Param | Type | Default |
| --- | --- | --- |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code></code> | 

<a name="QuasarRuntime+runQuasar"></a>

### quasarRuntime.runQuasar(quasar, [quasArgs], registerTask, end) ⇒ <code>promise</code>
Runs a quasar build task

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| quasar | <code>string</code> |  | name of the quasar to run |
| [quasArgs] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> |  |
| registerTask | <code>bool</code> |  | whether or not to register the quasar with gulp |
| end | <code>function</code> |  | the callback for when the task has completed |

<a name="QuasarRuntime+unpackSourceFiles"></a>

### quasarRuntime.unpackSourceFiles(quasArgs, subDirectory) ⇒ <code>promise</code>
unzips or moves source files to the assets folder

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Description |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  |
| subDirectory | <code>string</code> | the subdirectory of the assets folder to place the source files |

<a name="QuasarRuntime+uploadOutputFiles"></a>

### quasarRuntime.uploadOutputFiles(quasArgs, [excludeFiles]) ⇒ <code>promise</code>
Uploads output files to Amazon S3.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type | Default |
| --- | --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) |  | 
| [excludeFiles] | <code>array</code> | <code>[]</code> | 

<a name="QuasarRuntime+uploadOutputFileAsTxt"></a>

### quasarRuntime.uploadOutputFileAsTxt(quasArgs) ⇒ <code>promise</code>
Uploads the outputFile to Amazon S3.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarRuntime+uploadOutputFileWithMetadata"></a>

### quasarRuntime.uploadOutputFileWithMetadata(quasArgs) ⇒ <code>promise</code>
Uploads the outputFile to Amazon S3.

**Kind**: instance method of [<code>QuasarRuntime</code>](#QuasarRuntime)  

| Param | Type |
| --- | --- |
| quasArgs | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarTask"></a>

## QuasarTask
A task that can be run by the quasar runtime API.

**Kind**: global class  
**Summary**: This class can be extended to create custom quasars as shown in the example.  
**Export**:   

* [QuasarTask](#QuasarTask)
    * _instance_
        * [.build()](#QuasarTask+build) ⇒ <code>promise</code>
        * [.cleanUp()](#QuasarTask+cleanUp)
        * [.getDefaultQuasarQuestions()](#QuasarTask+getDefaultQuasarQuestions) ⇒ <code>array</code>
        * [.getQuasarPrompts()](#QuasarTask+getQuasarPrompts) ⇒ <code>array</code>
        * [.promptUser()](#QuasarTask+promptUser) ⇒ <code>promise</code>
        * [.registerRequiredQuasArgs([requiredArgs], [optionalRequiredArgs], [clobber])](#QuasarTask+registerRequiredQuasArgs)
        * [.registerTasks()](#QuasarTask+registerTasks)
        * [.resolveQuasArgs([args])](#QuasarTask+resolveQuasArgs)
        * [.run([args])](#QuasarTask+run) ⇒ <code>promise</code>
        * [.setConfig(_config, [applicationRoot], [force])](#QuasarTask+setConfig)
        * [.setDefaultQuasArgs(qType, [additionalArgs])](#QuasarTask+setDefaultQuasArgs) ⇒ [<code>QuasArgs</code>](#QuasArgs)
        * [.setSourceAndOutputPlusArgs([args])](#QuasarTask+setSourceAndOutputPlusArgs)
        * [.setSourceQuaArgsFromSourceFiles(map, defaultKey)](#QuasarTask+setSourceQuaArgsFromSourceFiles)
        * [.validateRequiredArgs([args])](#QuasarTask+validateRequiredArgs) ⇒ <code>promise</code>
    * _static_
        * [.DTQuasarTask#validateRequiredArgs([args])](#QuasarTask.DTQuasarTask+validateRequiredArgs) ⇒ <code>promise</code>

<a name="QuasarTask+build"></a>

### quasarTask.build() ⇒ <code>promise</code>
Builds the quasar into a single outputFile.

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>promise</code> - the build promise chane  
<a name="QuasarTask+cleanUp"></a>

### quasarTask.cleanUp()
deletes the assets folder and any other temporary build files

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
<a name="QuasarTask+getDefaultQuasarQuestions"></a>

### quasarTask.getDefaultQuasarQuestions() ⇒ <code>array</code>
returns a list of default prompts for a quasar.

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>array</code> - list of default prompts  
<a name="QuasarTask+getQuasarPrompts"></a>

### quasarTask.getQuasarPrompts() ⇒ <code>array</code>
retrieves the list of inquirer questions to ask the user

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>array</code> - array of questions  
**See**: https://www.npmjs.com/package/inquirer#questions  
<a name="QuasarTask+promptUser"></a>

### quasarTask.promptUser() ⇒ <code>promise</code>
prompts the user from the CLI to get the QuasArgs

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>promise</code> - prompt promise  
<a name="QuasarTask+registerRequiredQuasArgs"></a>

### quasarTask.registerRequiredQuasArgs([requiredArgs], [optionalRequiredArgs], [clobber])
adds required and optional defined arguments, and the defaults, within the quasArgs

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Summary**: This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter  
**See**: https://www.npmjs.com/package/inquirer#questions  

| Param | Type | Default |
| --- | --- | --- |
| [requiredArgs] | <code>array</code> | <code>[]</code> | 
| [optionalRequiredArgs] | <code>array</code> | <code>[]</code> | 
| [clobber] | <code>boolean</code> | <code>true</code> | 

<a name="QuasarTask+registerTasks"></a>

### quasarTask.registerTasks()
register the build tasks for this quasar

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
<a name="QuasarTask+resolveQuasArgs"></a>

### quasarTask.resolveQuasArgs([args])
method for extended classes to do extra work for quasArgs after validation

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+run"></a>

### quasarTask.run([args]) ⇒ <code>promise</code>
Runs the quasar through validation, build, then cleanup.

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+setConfig"></a>

### quasarTask.setConfig(_config, [applicationRoot], [force])
sets the configuration values from the quasar runtime

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| _config | [<code>QuasarConfig</code>](#QuasarConfig) |  | 
| [applicationRoot] | <code>String</code> | <code>process.cwd()</code> | 
| [force] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarTask+setDefaultQuasArgs"></a>

### quasarTask.setDefaultQuasArgs(qType, [additionalArgs]) ⇒ [<code>QuasArgs</code>](#QuasArgs)
sets the default quasArgs including command line arguments in order of priority from: QuasArgs class, additionalArgs param, cliArgs, loaded from file

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| qType | <code>string</code> |  | 
| [additionalArgs] | <code>object</code> | <code>{}</code> | 

<a name="QuasarTask+setSourceAndOutputPlusArgs"></a>

### quasarTask.setSourceAndOutputPlusArgs([args])
sets the default values of the source and output arguments from user input

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask+setSourceQuaArgsFromSourceFiles"></a>

### quasarTask.setSourceQuaArgsFromSourceFiles(map, defaultKey)
unpacks source files and sets quasArg values using the regex map passed in

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  

| Param | Type |
| --- | --- |
| map | <code>object</code> | 
| defaultKey | <code>string</code> | 

<a name="QuasarTask+validateRequiredArgs"></a>

### quasarTask.validateRequiredArgs([args]) ⇒ <code>promise</code>
sets args from quasar form data and runs validation on the final fields

**Kind**: instance method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>promise</code> - resolves to true if validation is successful  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarTask.DTQuasarTask+validateRequiredArgs"></a>

### QuasarTask.DTQuasarTask#validateRequiredArgs([args]) ⇒ <code>promise</code>
downloads source files, sets defaults from form args, and copies files to the assets folder

**Kind**: static method of [<code>QuasarTask</code>](#QuasarTask)  
**Returns**: <code>promise</code> - resolves to true if validation is successful  

| Param | Type | Default |
| --- | --- | --- |
| [args] | [<code>QuasArgs</code>](#QuasArgs) | <code>{}</code> | 

<a name="QuasarWebApp"></a>

## QuasarWebApp
The web application for running the quasar API and webform.

**Kind**: global class  
**Export**:   

* [QuasarWebApp](#QuasarWebApp)
    * [.port](#QuasarWebApp+port) : <code>string</code>
    * [._app](#QuasarWebApp+_app) : <code>express</code>
    * [.availableTasks](#QuasarWebApp+availableTasks) : <code>array</code>
    * [.app](#QuasarWebApp+app) ⇒ <code>express</code>
    * [.autoReloadingPageWithMessage([message])](#QuasarWebApp+autoReloadingPageWithMessage) ⇒ <code>string</code>
    * [.createJobFile(args)](#QuasarWebApp+createJobFile) ⇒ <code>promise</code>
    * [.getJob(req, res)](#QuasarWebApp+getJob)
    * [.getJobStatus(jobId)](#QuasarWebApp+getJobStatus) ⇒ <code>string</code>
    * [.getPublicBuild(req, res)](#QuasarWebApp+getPublicBuild)
    * [.onTaskDataReceived(req, res)](#QuasarWebApp+onTaskDataReceived) ⇒ <code>promise</code>
    * [.run([app], [port], [start])](#QuasarWebApp+run)
    * [.saveSourceFiles(args)](#QuasarWebApp+saveSourceFiles) ⇒ [<code>QuasArgs</code>](#QuasArgs)
    * [.sendJobFileCompleted(job, jobFile)](#QuasarWebApp+sendJobFileCompleted) ⇒ <code>promise</code>
    * [.sendJobFileQueued(job, jobFile)](#QuasarWebApp+sendJobFileQueued) ⇒ <code>promise</code>

<a name="QuasarWebApp+port"></a>

### quasarWebApp.port : <code>string</code>
**Kind**: instance property of [<code>QuasarWebApp</code>](#QuasarWebApp)  
<a name="QuasarWebApp+_app"></a>

### quasarWebApp._app : <code>express</code>
**Kind**: instance property of [<code>QuasarWebApp</code>](#QuasarWebApp)  
<a name="QuasarWebApp+availableTasks"></a>

### quasarWebApp.availableTasks : <code>array</code>
**Kind**: instance property of [<code>QuasarWebApp</code>](#QuasarWebApp)  
<a name="QuasarWebApp+app"></a>

### quasarWebApp.app ⇒ <code>express</code>
retrieves the express instance for the web app

**Kind**: instance property of [<code>QuasarWebApp</code>](#QuasarWebApp)  
**Read only**: true  
<a name="QuasarWebApp+autoReloadingPageWithMessage"></a>

### quasarWebApp.autoReloadingPageWithMessage([message]) ⇒ <code>string</code>
the content for a loading page with a message

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type | Default |
| --- | --- | --- |
| [message] | <code>string</code> | <code>&quot;&#x60;Loading ...&#x60;&quot;</code> | 

<a name="QuasarWebApp+createJobFile"></a>

### quasarWebApp.createJobFile(args) ⇒ <code>promise</code>
Writes a jobFile to the jobs folder

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  
**Returns**: <code>promise</code> - resolves with the created job information  

| Param | Type | Description |
| --- | --- | --- |
| args | [<code>QuasArgs</code>](#QuasArgs) | the args to create the job with |

<a name="QuasarWebApp+getJob"></a>

### quasarWebApp.getJob(req, res)
sends the outputFile of a job or the json data about the job if it has not completed

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type |
| --- | --- |
| req | <code>\*</code> | 
| res | <code>\*</code> | 

<a name="QuasarWebApp+getJobStatus"></a>

### quasarWebApp.getJobStatus(jobId) ⇒ <code>string</code>
returns the status of a job based on the filename and which job folder it is in

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type |
| --- | --- |
| jobId | <code>\*</code> | 

<a name="QuasarWebApp+getPublicBuild"></a>

### quasarWebApp.getPublicBuild(req, res)
returns the directory view of a domain/signature for a given date range

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type |
| --- | --- |
| req | <code>\*</code> | 
| res | <code>\*</code> | 

<a name="QuasarWebApp+onTaskDataReceived"></a>

### quasarWebApp.onTaskDataReceived(req, res) ⇒ <code>promise</code>
creates a jobfile and returns the preliminary data to the response

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  
**Returns**: <code>promise</code> - the json response to the request  

| Param | Type |
| --- | --- |
| req | <code>\*</code> | 
| res | <code>\*</code> | 

<a name="QuasarWebApp+run"></a>

### quasarWebApp.run([app], [port], [start])
runs the express application with webpage and API

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type | Default |
| --- | --- | --- |
| [app] | <code>express</code> | <code></code> | 
| [port] | <code>number</code> | <code></code> | 
| [start] | <code>boolean</code> | <code>false</code> | 

<a name="QuasarWebApp+saveSourceFiles"></a>

### quasarWebApp.saveSourceFiles(args) ⇒ [<code>QuasArgs</code>](#QuasArgs)
saves an uploaded source file to the sources folder

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  
**Returns**: [<code>QuasArgs</code>](#QuasArgs) - the saved QuasArgs  

| Param | Type |
| --- | --- |
| args | [<code>QuasArgs</code>](#QuasArgs) | 

<a name="QuasarWebApp+sendJobFileCompleted"></a>

### quasarWebApp.sendJobFileCompleted(job, jobFile) ⇒ <code>promise</code>
sends a response to a client when a job has been completed

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  

| Param | Type |
| --- | --- |
| job | <code>\*</code> | 
| jobFile | <code>\*</code> | 

<a name="QuasarWebApp+sendJobFileQueued"></a>

### quasarWebApp.sendJobFileQueued(job, jobFile) ⇒ <code>promise</code>
sends a response to a client when a job has been queued

**Kind**: instance method of [<code>QuasarWebApp</code>](#QuasarWebApp)  
**Returns**: <code>promise</code> - resolves to the job queued information  

| Param | Type |
| --- | --- |
| job | <code>string</code> | 
| jobFile | <code>string</code> | 

