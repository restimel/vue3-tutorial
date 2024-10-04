# Upgrade changes

Here you will find all important changes to upgrade to a newer version without
breaking your application.

## 1

### 1.1

* Deprecation of `Options.debug`, uses [`Options.logs.logLevel` or `Options.logs.allowCodes`](./configuration.md#Logs).<br>_`debug` can still be used in this version_
* Deprecation of `Options.messageLog`, uses [`Options.logs.messageLog`](./configuration.md#Logs).<br>_`messageLog` can still be used in this version_
