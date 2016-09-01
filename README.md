# vscode-require-check

Extension for vs-code that adds capibilities around require in javascript files

## development

* run `npm install && npm compile` in both client/server

* start `Launch Extension` launch option in the client

* start `Attach` launch option in the server

this should start an extension host window pointing at `server/test/fixtures/folder-root`

this should show a few modules with invalid requires

you can run the `install` code action on the `invalid` module.  (this, surprisingly enough, is a valid npm module)

you can ctrl-click the valid module and go to it.

## tests

there are some rudimentary tests in ./server that are kind of fragile

they reference the same `folder-root` and will only function properly if `some-module` is the only module in the node_modules folder

## publishing

for some reason the `installServerIntoExtension` will copy over cmd files as well. prior to publishing, delete that crop.  `./client/out/server` should list only the following:
 - package.json
 - node_modules
 - server
 - type

## contributing

uhh, sure man.  have at 'er



