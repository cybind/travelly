Ext.define('Travelly.model.Picture', {
    extend: 'Ext.data.Model',
    
    config: {
        fields: [
            { name: 'id', type: 'int' },
            { name: 'url', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'lon', type: 'string' },
            { name: 'lat', type: 'string' }
        ]
    }
});
