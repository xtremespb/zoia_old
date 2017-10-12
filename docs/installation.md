You can use the Docker image to run Zoia:

```
docker pull mongo:latest
docker pull xtremespb/zoia:latest
docker run -d --name mongo mongo
docker run -p 3000:3000 -d --name zoia --link=mongo:mongo xtremespb/zoia
docker exec -it zoia node /usr/local/zoia/bin/install.js
```

On a Debian machines, you may wish to run the following command for the automated installs:

```
wget -q https://xtremespb.github.io/zoia/zoia_install && bash zoia_install
```

It will install sources, run apt-get for `nodejs` and `mongodb`, install `forever`, download the latest Zoia release file, extract it and run modules installer script when needed.

To manually install Zoia on your server or desktop, you will need the following prerequisites:

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