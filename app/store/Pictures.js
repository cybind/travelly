Ext.define('Travelly.store.Pictures',{
    extend:'Ext.data.Store',
    requires: ['Ext.data.proxy.LocalStorage', 'Travelly.model.Picture'],
    config:{
        model:'Travelly.model.Picture', 
        storeId: 'Pictures',
        autoLoad: true,
        autoSync: true,
        proxy:{
            type:'localstorage'
        }
    }
});