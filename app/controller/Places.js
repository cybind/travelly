Ext.define('Travelly.controller.Places', {
    extend: 'Ext.app.Controller',
    
    config: {
        refs: {
            mapPlaces: '#mapPlaces'
        },
        control: {
            mapPlaces: {
                maprender: 'mapPlacesMapRenderer'
            }
        }
    },

    mapPlacesMapRenderer: function(comp, map) {

        var pictures = this.getPictures();
        var map = this.getMapPlaces().getMap();

        for (var i = 0; i < pictures.length; i++) {
            this.addMarker(pictures[i], map);
        }

    },

    getPictures: function() {
        var pictureStore = Ext.getStore('Pictures');
        var data = pictureStore.getData();
        return data ? data.all : null;
    },

    addMarker: function(picture, map) {

        var self = this;

        var marker = new google.maps.Marker({
            map       : map,
            position  : new google.maps.LatLng(picture.get('lat'), picture.get('lon')),
            title     : picture.get('title'),
            icon      : 'resources/images/camera.png',
            picture   : picture
        });

        google.maps.event.addListener(marker, 'click', function() {

            var marker = this;

            var popup = Ext.create('Travelly.view.Picture');
            Ext.Viewport.add(popup);
            popup.show();

            popup.on('hide', function() {
                popup.destroy();
            });

            Ext.getCmp('photoPreview').setSrc(marker.picture.get('url'));
            Ext.getCmp('photoTitle').setTitle(marker.picture.get('title'));

            Ext.getCmp('deletePhotoBtn').on('tap', function() {
                Ext.Msg.confirm("Confirmation", "Are you sure you want to delete this picture?", function(buttonId, value, opt) {
                    if (buttonId == 'yes') {
                        self.deletePicture(marker);
                        popup.hide();
                    }
                });
            });

            Ext.getCmp('closePhotoBtn').on('tap', function() {
                popup.hide();
            });

        });

    },

    deletePicture: function(marker) {

        // delete from file system
        var fileURI = marker.picture.get('url');
        fileURI = '/Travelly/' + fileURI.substring(fileURI.lastIndexOf('/')+1);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
            fileSys.root.getFile(fileURI, {create: false, exclusive: false}, function(fileEntry) {
                fileEntry.remove(onSuccess, onError);
            }, onError);        
        },
        onError);

        var onSuccess = function(entry) {
            console.log("Removal succeeded");
        }

        var onError = function(error) {
            console.log("Error removing file: " + error.code);
        }

        // delete from database
        var pictureStore = Ext.getStore('Pictures');
        pictureStore.remove(marker.picture);

        // delete marker
        marker.setMap(null);
    }

});
