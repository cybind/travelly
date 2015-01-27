Ext.define('Travelly.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.Button',
        'Ext.Img',
        'Ext.Map'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: 'New Photo',
                iconCls: 'lens',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'New Photo'
                    },
                    {
                        xtype: 'container',
                        width: '100%',
                        height: '100%',
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                id: 'takePhotoBtn',
                                text: 'Take Photo',
                                iconCls: 'photo',
                                iconAlign: 'top',
                                height: 65,
                                width: 120,
                                padding: 10,
                                margin: 5
                            }
                        ]
                    }

                ]
            },
            {
                title: 'My Places',
                iconCls: 'globe',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Places I visited'
                    },
                    {
                        xtype: 'map',
                        id: 'mapPlaces',
                        useCurrentLocation: true,
                        width: '100%',
                        height: '100%'
                    }                    
                ]
            },
            {
                title: 'Settings',
                iconCls: 'settings',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Settings'
                    },
                    {
                        xtype: 'button',
                        id: 'loginBtn',
                        text: 'Login',
                        iconCls: 'user',
                        margin: 5
                    },
                    {
                        xtype: 'button',
                        id: 'logoutBtn',
                        text: 'Logout',
                        iconCls: 'user',
                        margin: 5,
                        hidden: true
                    }

                ]
            }

        ]
    }
});
