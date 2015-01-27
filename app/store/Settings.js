Ext.define('Travelly.store.Settings', {
    extend: 'Ext.data.Store',
    requires: ['Travelly.model.Settings'],
    config: {
        storeId: 'Settings',
        model: 'Travelly.model.Settings',
        autoLoad: true,
		autoSync: true
    },

    get: function(name)
    {
        var settingsStore = this,
            setting = settingsStore.findRecord('name', name),
            value = null;

        if (setting) {
            value = setting.get('value');
        }

        return value;
    },

    set: function(name, value)
    {
        var store = this,
            record = store.findRecord('name', name);

        if (! record) {
            record = Ext.create('Travelly.model.Settings');
            record.set('name', name);
            record.set('value', value);

            store.add(record);
        } else {
            record.set('value', value);
            record.save();
        }
    }
});