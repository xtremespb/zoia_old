Zoia uses [Nunjucks](https://mozilla.github.io/nunjucks/) to render templates. 

You can read more on template syntax by clicking the link above.

The following variables are used by Zoia:

* **pageTitle**: current page title
* **extraCSS**: array of CSS path values to include
* **extraJS**: array of JS files to include
* **auth**: current auth object (or `null` if user is not authorized)
* **content**: content to display

Templates must be located inside of `./views` folder. Each module may also contain it's own `views` folder to render a part of site's template or even a whole HTML when needed.

Zoia is using [Uikit](https://getuikit.com/) version 3 (beta) as CSS framework. It's pre-compiled and uses the following prefixes:

* **za-** for CSS
* **$zUI** for JavaScript