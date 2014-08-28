/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * jaydata entity sets used in default extensions
 */

var $data = require('jaydata');

//template

$data.Entity.extend('$entity.Template', {
    '_id': { 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' },
    'name': { 'type': 'Edm.String' },
    'modificationDate': { 'type': 'Edm.DateTime' },
    'engine': { 'type': 'Edm.String' },
    'recipe': { 'type': 'Edm.String' },
    'content': { 'type': 'Edm.String' },
    'shortid': { 'type': 'Edm.String' },
    'helpers': { 'type': 'Edm.String' }
});

//image
$data.Class.define("$entity.ImageRef", $data.Entity, null, {
    "name": { 'type': 'Edm.String' },
    "shortid": { 'type': 'Edm.String' },
    "imageId": { 'type': 'Edm.String' }
}, null);

$entity.Template.addMember("images", { type: "Array", elementType: "$entity.ImageRef" });

$data.Class.define("$entity.Image", $data.Entity, null, {
    '_id': { 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' },
    "shortid": { 'type': 'Edm.String' },
    "name": { 'type': 'Edm.String' },
    "creationDate": { type: "date" },
    "modificationDate": { type: "date" }
}, null);

//data item
$data.Class.define("$entity.DataItem", $data.Entity, null, {
    'shortid': { 'type': 'Edm.String' },
    'name': { 'type': 'Edm.String' },
    "creationDate": { type: "date" },
    "modificationDate": { type: "date" },
    'dataJson': { 'type': 'Edm.String' }
}, null);

$entity.Template.addMember("dataItemId", { 'type': "Edm.String" });
$entity.DataItem.addMember('_id', { 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' });

//reports
$entity.Template.addMember("reports", { type: Array, elementType: "$entity.Report", inverseProperty: "template" });

$data.Entity.extend('$entity.Report', {
    '_id': { 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' },
    'creationDate': { 'type': 'Edm.DateTime' },
    'name': { 'type': 'Edm.String' },
    'fileExtension': { 'type': 'Edm.String' },
    'contentType': { 'type': 'Edm.String' },
    'templateShortid': { 'type': 'Edm.String' }
});

//scripts
$data.Class.define("$entity.Script", $data.Entity, null, {
    '_id':{ 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' },
    'content': { 'type': 'Edm.String' },
    'name': { 'type': 'Edm.String' },
    'shortid': { 'type': 'Edm.String' },
    "creationDate": { type: "date" },
    "modificationDate": { type: "date" },
    "scriptId": { type: "Edm.String"}

}, null);

$entity.Template.addMember("scriptId", { 'type': "Edm.String" });

//statistics
$data.Entity.extend('$entity.Statistic', {
    '_id': { 'key': true, 'nullable': false, 'computed': true, 'type': 'Edm.String' },
    'fiveMinuteDate': { 'type': 'Edm.DateTime' },
    'amount': { 'type': 'Edm.Int32' },
    'success': { 'type': 'Edm.Int32' }
});

module.exports = {
    templates: { type: $data.EntitySet, elementType: $entity.Template },
    images: { type: $data.EntitySet, elementType: $entity.Image },
    data: { type: $data.EntitySet, elementType: $entity.DataItem },
    reports: { type: $data.EntitySet, elementType: $entity.Report },
    scripts: { type: $data.EntitySet, elementType: $entity.Script },
    statistics: { type: $data.EntitySet, elementType: $entity.Statistic }
};

