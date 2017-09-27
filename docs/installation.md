To install Zoia on your server or desktop, you will need the following prerequisites:

* Node.js version 7 and later
* MongoDB 3 and later

Get your copy of Zoia from Github repository:

```bash
git clone https://github.com/xtremespb/zoia.git
```

Modify the configuration files (config.js and website.js) to match your server settings. Don't forget to modify MongoDB settings and to set the salt. Then install the missing NPM modules and run the installer:

```bash
npm install && cd ./bin && node install
```

Run the Zoia web server:

```bash
node webserver
```

Default address for Zoia webserver is http://127.0.0.1:3000/. You may also login to Administrator panel by opening the URL: http://127.0.0.1:3000/admin/ (default username and password is admin/admin).