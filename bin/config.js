const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const crypto = require('crypto');

const tpl = (s, d) => {
    for (let p in d) {
        s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    }
    return s;
};

const detectIP = () => {
    const ifaces = os.networkInterfaces();
    let ip = null;
    Object.keys(ifaces).forEach(function(ifname) {
        ifaces[ifname].forEach(function(iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            ip = iface.address;
        });
    });
    return ip;
};

const configs = async() => {
    console.log('\nThis script will prepare configuration files for you.\n');
    try {
        let tplNginx = String(await fs.readFile(path.join(__dirname, 'templates', 'nginx.template')));
        let tplMonit = String(await fs.readFile(path.join(__dirname, 'templates', 'monit.template')));
        let tplZoia = String(await fs.readFile(path.join(__dirname, 'templates', 'zoia.template')));
        let zConfig = await fs.readJSON(path.join(__dirname, 'templates', 'config.template'));
        let zConfigWebsite = await fs.readJSON(path.join(__dirname, 'templates', 'website.template'));
        let zoiaIP = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: '127.0.0.1',
            message: 'Local host for Zoia:'
        }]);
        let zoiaPort = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: 3000,
            message: 'Local port for Zoia:'
        }]);
        let zoiaProduction = await inquirer.prompt([{
            type: 'list',
            name: 'val',
            message: 'Production mode?',
            choices: [
                'true',
                'false'
            ]
        }]);
        let nginxIP = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: detectIP(),
            message: 'Server IP address NGINX listens to:',
            validate: function(val) {
                if (!val || typeof val !== 'string' || !val.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)) {
                    return 'Invalid IP address';
                }
                return true;
            }
        }]);
        let zoiaTrustProxy = await inquirer.prompt([{
            type: 'list',
            name: 'val',
            message: 'Should Zoia be in trust proxy mode?',
            choices: [
                'true',
                'false'
            ]
        }]);
        let zoiaStackTrace = await inquirer.prompt([{
            type: 'list',
            name: 'val',
            message: 'Enable stack trace output?',
            choices: [
                'false',
                'true'
            ]
        }]);
        let zoiaLogLevel = await inquirer.prompt([{
            type: 'list',
            name: 'val',
            message: 'Log level to use:',
            choices: [
                'error',
                'warn',
                'info',
                'debug'
            ]
        }]);
        let zoiaMongoURL = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: 'mongodb://localhost:27017/zoia',
            message: 'MongoDB URL:'
        }]);
        let nginxPort = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: 80,
            message: 'Server port NGINX listens to:'
        }]);
        let serverName = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: 'domain.com',
            message: 'Server name:'
        }]);
        console.log('\n* Generating random salt...');
        const salt = crypto.randomBytes(20).toString('hex');
        console.log('* Generating random session secret...');
        const sessionSecret = crypto.randomBytes(20).toString('hex');
        // Generate configs
        const name = serverName.val.replace(/[\.\-]/gm, '_');
        let nginx = tpl(tplNginx, {
            ip: nginxIP.val,
            port: nginxPort.val,
            serverName: serverName.val,
            dir: path.join(__dirname, '..').replace(/\\/gm, '/'),
            zoiaIPname: zoiaIP.val,
            zoiaPort: zoiaPort.val
        });
        let monit = tpl(tplMonit, {
            port: zoiaPort.val,
            serverName: zoiaIP.val,
            name: name,
            root: path.join(__dirname, '..').replace(/\\/gm, '/')
        });
        let zoia = tpl(tplZoia, {
            serverName: serverName.val,
            name: name,
            root: path.join(__dirname, '..').replace(/\\/gm, '/')
        });
        zConfig.ip = zoiaIP.val;
        zConfig.port = zoiaPort.val;
        zConfig.production = zoiaProduction.val;
        zConfig.salt = salt;
        zConfig.trustProxy = zoiaTrustProxy.val;
        zConfig.stackTrace = zoiaStackTrace.val;
        zConfig.logLevel = zoiaLogLevel.val;
        zConfig.mongo.url = zoiaMongoURL.val;
        zConfig.session.secret = sessionSecret;
        await fs.ensureDir(path.join(__dirname, 'config'));
        await fs.writeFile(path.join(__dirname, 'config', name + '_nginx.conf'), nginx);
        await fs.writeFile(path.join(__dirname, 'config', name + '_monit.conf'), monit);
        await fs.writeFile(path.join(__dirname, 'zoia.sh'), zoia);
        await fs.writeFile(path.join(__dirname, '..', 'etc', 'config.json'), JSON.stringify(zConfig, null, "\t"));
        await fs.writeFile(path.join(__dirname, '..', 'etc', 'website.json'), JSON.stringify(zConfigWebsite, null, "\t"));
        console.log('\nNGINX and Monit configuration files are written to the "./bin/config" directory.');
        console.log('Startup file ("zoia.sh") written to the "./bin" directory.');
        console.log('Configuration files ("config.json" and "website.json") are written to "./etc" directory.');
        console.log('Please check configuration files in "./etc" manually and run "npm run install" before you start Zoia.');
    } catch (e) {
        console.log('\nError: ' + e);
    }
};

configs();