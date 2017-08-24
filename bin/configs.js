const inquirer = require('inquirer');
const path = require('path');
const config = require(path.join(__dirname, '..', 'etc', 'config.js'));
const fs = require('fs-extra');

const tpl = (s, d) => {
    for (let p in d) {
        s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    }
    return s;
};

const configs = async() => {
    console.log('This script will prepare server configuration files for you.\n');
    try {
        let tplNginx = await fs.readFile(path.join(__dirname, 'nginx.template'));
        tplNginx = String(tplNginx);
        let input1 = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            message: 'Server IP address:',
            validate: function(val) {
                if (!val || typeof val !== 'string' || !val.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)) {
                    return 'Invalid IP address';
                }
                return true;
            }
        }]);
        let input2 = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            default: 80,
            message: 'Server port:',
            validate: function(val) {
                if (!val || typeof val !== 'string' || !val.match(/^[0-9]+$/)) {
                    return 'Invalid port';
                }
                return true;
            }
        }]);
        let input3 = await inquirer.prompt([{
            type: 'input',
            name: 'val',
            message: 'Server name:'
        }]);
        let nginx = tpl(tplNginx, {
        	ip: input1.val,
        	port: input2.val,
        	serverName: input3.val,
        	dir: path.join(__dirname, '..').replace(/\\/gm, '/'),
        	zoiaHostname: config.hostname,
        	zoiaPort: config.port
        });
        await fs.ensureDir(path.join(__dirname, 'server'));
        await fs.writeFile(path.join(__dirname, 'server', input3.val + '.conf'), nginx);
        console.log('\nConfiguration files are written to the "server" folder.')
    } catch (e) {
        console.log('\nError: ' + e);
    }
};

configs();