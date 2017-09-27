Zoia provides several core modules which could help you in your development.
Those modules are actively used in modules provided by default and could be also used by developers for third-party modules.

* captcha.js - used to generate the captcha images using Jimp module. This is used by Captcha module to display captcha for authorization etc.
* [database.js](/xtremespb/zoia/wiki/Core-API:-Database) - used for database connection and queries
* i18n.js - used as internationalization module (i18n-2) proxy
* mailer.js - used as Nodemailer proxy which is allowing you to send mails
* module.js - provides several helper methods for modules
* [panel.js](/xtremespb/zoia/wiki/Core-API:-Panel) - used to generate the Administration panel template code
* [render.js](/xtremespb/zoia/wiki/Core-API:-Render) - used to render the HTML template for modules
* validation.js - contains several form and variable validation tasks

All other core modules (errors.js, preroutes.js etc.) are used internally and should not be touched.