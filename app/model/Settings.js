Ext.define('Travelly.model.Settings', {
    extend: 'Ext.data.Model',
	requires: ['Ext.data.identifier.Uuid'],
    config: {
		idProperty: "storeId",
		identifier: {
            type: 'uuid'
        },
        fields: [
            { name: 'storeId', type: 'int' },
            { name: 'id', type: 'int' },
            { name: 'name', type: 'string' },
            { name: 'value', type: 'string' }
        ],
        proxy: {
            type: 'localstorage',
            id: 'Settings'
        }
    }
});
