const inquirer = require('inquirer');
const path = require('path');
const config = require(path.join(__dirname, '..', 'etc', 'config.js'));
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
        let zConfig = String(await fs.readFile(path.join(__dirname, 'templates', 'config.template')));
        let zoiaHost = await inquirer.prompt([{
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
        let zoiaProtocol = await inquirer.prompt([{
            type: 'list',
            name: 'val',
            message: 'Protocol to use:',
            choices: [
                'http',
                'https'
            ]
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
                'true',
                'false'
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
        console.log('  Generating random salt...');
        const salt = crypto.randomBytes(20).toString('hex');
        console.log('  Generating random session secret...');
        const sessionSecret = crypto.randomBytes(20).toString('hex');
        // Generate configs
        const name = serverName.val.replace(/[\.\-]/gm, '_');
        let nginx = tpl(tplNginx, {
            ip: nginxIP.val,
            port: nginxPort.val,
            serverName: serverName.val,
            dir: path.join(__dirname, '..').replace(/\\/gm, '/'),
            zoiaHostname: config.hostname,
            zoiaPort: config.port
        });
        let monit = tpl(tplMonit, {
            port: config.port,
            serverName: serverName.val,
            name: name,
            root: path.join(__dirname, '..').replace(/\\/gm, '/')
        });
        let zoia = tpl(tplZoia, {
            serverName: serverName.val,
            name: name,
            root: path.join(__dirname, '..').replace(/\\/gm, '/')
        });
        let zconfig = tpl(zConfig, {
            host: zoiaHost.val,
            port: zoiaPort.val,
            protocol: zoiaProtocol.val,
            production: zoiaProduction.val,
            salt: salt,
            trustProxy: zoiaTrustProxy.val,
            stackTrace: zoiaStackTrace.val,
            logLevel: zoiaLogLevel.val,
            mongoURL: zoiaMongoURL.val,
            sessionSecret: sessionSecret
        });
        await fs.ensureDir(path.join(__dirname, 'config'));
        await fs.writeFile(path.join(__dirname, 'config', name + '_nginx.conf'), nginx);
        await fs.writeFile(path.join(__dirname, 'config', name + '_monit.conf'), monit);
        await fs.writeFile(path.join(__dirname, 'zoia.sh'), zoia);
        await fs.writeFile(path.join(__dirname, 'config', 'config.js'), zconfig);
        console.log('\nServer configuration files are written to the "config" directory.');
        console.log('Startup file written to the current directory.');
        console.log('Please check your ./config/config.js file and move it to the ../etc directory when done.');
        console.log('Please edit ../etc/website.js manually.');
        console.log('Important: don\'t forget to "chmod +x zoia.sh" startup script.');
    } catch (e) {
        console.log('\nError: ' + e);
    }
};

configs();