Ext.define('Travelly.controller.Main', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            takePhotoBtn: '#takePhotoBtn',
            mapPlaces: '#mapPlaces'
        },
        control: {
            takePhotoBtn: {
                tap: 'getPhoto'
            }
        }
    },

    getPhoto: function() {
        var self = this;

        self.getCameraPicture(function(imageURI) {
            self.showPhotoPopup(imageURI);
        });

    },

    getCameraPicture: function(callback) {

        if (Ext.browser.is.PhoneGap) {

            var onSuccess = function(imageURI) {
                if (callback) callback(imageURI);
            }

            var onFail = function(message) {
                alert('Failed because: ' + message);
                if (callback) callback();
            }

            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                mediaType: navigator.camera.MediaType.PICTURE,
                sourceType: navigator.camera.PictureSourceType.CAMERA,
                encodingType: navigator.camera.EncodingType.JPEG,
                correctOrientation: true
            });

        } else {
            // Emulate captured image
        }

    },

    showPhotoPopup: function(imageURI) {
        
        var self = this;

        var popup = Ext.create('Travelly.view.NewPicture');
        Ext.Viewport.add(popup);
        popup.show();

        popup.on('hide', function() {
            popup.destroy();
        });

        self.setPreviewImage(imageURI);

        Ext.getCmp('retakePhotoBtn').on('tap', function() {
            self.getCameraPicture(self.setPreviewImage);
        });

        Ext.getCmp('savePhotoBtn').on('tap', function() {
            var title = Ext.getCmp('photoTitle').getValue();
            self.savePhoto(imageURI, title);
            popup.hide();
        });

        Ext.getCmp('cancelPhotoBtn').on('tap', function() {
            popup.hide();
        });

    },

    setPreviewImage: function(imageURI) {
        Ext.getCmp('photoPreview').setSrc(imageURI);
    },

    getCurrentPosition: function(callback) {

        // onSuccess Callback
        // This method accepts a Position object, which contains the
        // current GPS coordinates
        var onSuccess = function(position) {
            callback(position.coords.latitude, position.coords.longitude);
        };

        // onError Callback receives a PositionError object
        var onError = function(error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);        

    },

    copyPhotoToPersistentStore: function(fileURI, callback) {

        //Callback function when the file system uri has been resolved
        var onSuccess = function(entry) {
            var d = new Date();
            var n = d.getTime();
            
            //new file name
            var newFileName = n + ".jpg";
            var myFolderApp = "Travelly";

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                //The folder is created if doesn't exist
                fileSys.root.getDirectory(myFolderApp, {
                        create: true,
                        exclusive: false
                    },
                    function(directory) {
                        entry.copyTo(directory, newFileName, successCopy, onError);
                    },
                    onError);
            },
            onError);
        }

        //Callback function when the file has been moved successfully - inserting the complete path
        var successCopy = function(entry) {
            if (callback) callback(entry.nativeURL);
        }

        var onError = function(error) {
            alert(error.code);
            if (callback) callback();
        }

        window.resolveLocalFileSystemURL(fileURI, onSuccess, onError); 
    },

    savePhoto: function(imageURI, title) {
        
        var self = this;
        console.log(imageURI);
        self.copyPhotoToPersistentStore(imageURI, function(persistentImageURI) {
            console.log(persistentImageURI);
            self.getCurrentPosition(function(latitude, longitude) {
        
                var picture = Ext.create('Travelly.model.Picture', {
                    url: persistentImageURI,
                    title: title,
                    lat: latitude,
                    lon: longitude
                });
                var pictureStore = Ext.getStore('Pictures');
                pictureStore.add(picture);
                pictureStore.sync();

                var map = self.getMapPlaces().getMap();
                Travelly.app.getController('Places').addMarker(picture, map)

            });

        })

    }

});