const inquirer = require('inquirer');
const path = require('path');
const config = require(path.join(__dirname, '..', 'core', 'config.js'));
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'force', alias: 'f', type: Boolean }
];
const options = commandLineArgs(optionDefinitions);
const install = async() => {
    try {
        console.log('           _         _\n          (_)       (_)\n  _______  _  __ _   _ ___\n |_  / _ \\| |/ _` | | / __|\n  / / (_) | | (_| |_| \\__ \\\n /___\\___/|_|\\__,_(_) |___/\n                   _/ /\n                  |__/\n');
        console.log('Current configuration (config.js) will be used.\n');
        console.log('Hostname: ' + config.ip + '\nPort: ' + config.port + '\nMongo URL: ' + config.mongo.url + '\n');
        if (!options.force) {
            let res = await inquirer.prompt([{
                type: 'list',
                name: 'continue',
                message: 'Please make a choice:\n',
                choices: [
                    'Install with the parameters shown above',
                    'Cancel installation'
                ]
            }]);
            if (res.continue == 'Cancel installation') {
                process.exit(0);
            }
        }
        console.log('\n- Connecting to the Mongo DB...');
        const database = new(require(path.join(__dirname, '..', 'core', 'database.js')))(false, config.mongo, false);
        await database.connect();
        const db = database.get();
        console.log('- Connected\n- Installing modules:\n');
        let data = {
            config: config,
            db: db
        }
        let modules = fs.readdirSync(path.join(__dirname, '..', 'modules'));
        for (let m in modules) {
            process.stdout.write(' [+] ' + modules[m] + '... ');
            const install = require(path.join(__dirname, '..', 'modules', modules[m], 'install'))(data);
            if (install) {
                process.stdout.write('\n');
                await install();
            } else {
                process.stdout.write('OK\n');
            }
        }
        console.log('\nUse http://' + config.ip + ':' + config.port + '/admin (admin/admin) to access your Admin panel.');
        console.log('Installation finished. Have a nice day!');
        db.close();
    } catch (e) {
        console.log('\nInstallation failed: ' + e);
        process.exit(1);
    }
};
install();