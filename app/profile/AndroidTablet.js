Ext.define('Travelly.profile.AndroidTablet', {
    extend: 'Ext.app.Profile',
    config: {
        views: [],
        models: [],
        stores: [],
        controllers: [ 'Main' ]
    },
    isActive: function(app) {
        return Ext.os.deviceType == 'Tablet' && Ext.os.is.Android;
    }
});