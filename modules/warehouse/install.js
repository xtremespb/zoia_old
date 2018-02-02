/* eslint max-len: 0 */
const fs = require('fs-extra');
const path = require('path');
// const ObjectId = require('mongodb').ObjectID;
module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        console.log('  └── Creating collection: warehouse...');
        try {
            await db.createCollection('warehouse');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_collections...');
        try {
            await db.createCollection('warehouse_collections');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_delivery...');
        try {
            await db.createCollection('warehouse_delivery');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_orders...');
        try {
            await db.createCollection('warehouse_orders');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_properties...');
        try {
            await db.createCollection('warehouse_properties');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_tasks...');
        try {
            await db.createCollection('warehouse_tasks');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_variants...');
        try {
            await db.createCollection('warehouse_variants');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('  └── Creating collection: warehouse_variants_collections...');
        try {
            await db.createCollection('warehouse_variants_collections');
        } catch (e) {
            console.log('      [ ] Collection is not created');
        }
        console.log('      Dropping indexes...');
        try {
            await db.collection('warehouse').dropIndexes();
        } catch (e) {
            console.log('      [ ] Indexes are not dropped');
        }
        console.log('      Creating indexes...');
        await db.collection('warehouse').createIndex({ folder: 1, sku: 1, price: 1, status: 1, properties: 1 });
        await db.collection('warehouse').createIndex({ folder: -1, sku: -1, price: -1, status: -1, properties: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx[lng + '.title'] = 1;
            await db.collection('warehouse').createIndex(idx);
            idx[lng + '.title'] = -1;
            await db.collection('warehouse').createIndex(idx);
        }
        await db.collection('warehouse_properties').createIndex({ pid: 1 });
        await db.collection('warehouse_properties').createIndex({ pid: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx['title.' + lng] = 1;
            await db.collection('warehouse_properties').createIndex(idx);
            idx['title.' + lng] = -1;
            await db.collection('warehouse_properties').createIndex(idx);
        }
        await db.collection('warehouse_collections').createIndex({ pid: 1 });
        await db.collection('warehouse_collections').createIndex({ pid: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx['title.' + lng] = 1;
            await db.collection('warehouse_collections').createIndex(idx);
            idx['title.' + lng] = -1;
            await db.collection('warehouse_collections').createIndex(idx);
        }
        await db.collection('warehouse_delivery').createIndex({ pid: 1, status: 1 });
        await db.collection('warehouse_delivery').createIndex({ pid: -1, status: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx['title.' + lng] = 1;
            await db.collection('warehouse_delivery').createIndex(idx);
            idx['title.' + lng] = -1;
            await db.collection('warehouse_delivery').createIndex(idx);
        }
        await db.collection('warehouse_variants').createIndex({ pid: 1 });
        await db.collection('warehouse_variants').createIndex({ pid: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx['title.' + lng] = 1;
            await db.collection('warehouse_variants').createIndex(idx);
            idx['title.' + lng] = -1;
            await db.collection('warehouse_variants').createIndex(idx);
        }
        await db.collection('warehouse_variants_collections').createIndex({ pid: 1 });
        await db.collection('warehouse_variants_collections').createIndex({ pid: -1 });
        for (let lng in config.i18n.localeNames) {
            let idx = {};
            idx['title.' + lng] = 1;
            await db.collection('warehouse_variants_collections').createIndex(idx);
            idx['title.' + lng] = -1;
            await db.collection('warehouse_variants_collections').createIndex(idx);
        }
        console.log('      Creating storage directory...');
        try {
            await fs.mkdir(path.join(__dirname, 'static', 'storage'));
        } catch (e) {
            console.log('      [!] Not created. Already exists?');
        }
        console.log('      Creating images directory...');
        try {
            await fs.mkdir(path.join(__dirname, 'static', 'images'));
        } catch (e) {
            console.log('      [!] Not created. Already exists?');
        }
        console.log('      Module is installed!');
    };
};