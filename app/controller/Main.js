Ext.define('Travelly.controller.Main', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            takePhotoBtn: '#takePhotoBtn',
            mapPlaces: '#mapPlaces',
            loginBtn: '#loginBtn',
            logoutBtn: '#logoutBtn',
            progressLabel: '#progressLabel'
        },
        control: {
            takePhotoBtn: {
                tap: 'getPhoto'
            },
            loginBtn: {
                tap: 'doLogin'
            },
            logoutBtn: {
                tap: 'doLogout'
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
            self.savePhoto(imageURI, title, popup);
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

    savePhoto: function(imageURI, title, popup) {
        
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

                if (Travelly.app.getSetting('token')) {
                    self.savePhotoToService(picture, function(isSuccess, errorMessage) {
                        console.log('Saved online!');
                        var progressLabel = self.getProgressLabel();
                        progressLabel.setHtml('Saved online!');
                        setTimeout(function(){
                            popup.hide();    
                        },3000)
                    });
                } else {
                    alert('Please login if you want to save picture online.');
                    setTimeout(function(){
                        popup.hide();    
                    },3000)
                }

            });

        })

    },

    savePhotoToService: function(picture, callback) {

        var self = this,
            svcUrl = Travelly.app.getGlobal('svcUrl'),
            publishUrl = svcUrl + '/pictures?access_token=' + Travelly.app.getSetting('token'),
            fileTransfer = new FileTransfer(),
            fileOptions = new FileUploadOptions(),
            uploadParams;

        uploadParams = {
            title: picture.get('title'),
            lat: picture.get('lat'),
            lon: picture.get('lon')
        };

        var imageUrl = picture.get('url');
        fileOptions.fileKey = 'picture';
        fileOptions.fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        fileOptions.mimeType = 'image/jpeg';
        fileOptions.params = uploadParams;

        var progressLabel = self.getProgressLabel();

        fileTransfer.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                progressLabel.setHtml(perc + "% uploaded...");
                console.log(perc + "% uploaded...");
            }
        };

        fileTransfer.upload(imageUrl, publishUrl, function(response) {

                if (response.responseCode === 200 || response.code === 1) {
                    var resp = {};
                    try {
                        resp = JSON.parse(response.response);
                        console.log('file upload response:');
                        console.log(resp);

                    } catch (e) {}

                    if (callback) callback(true);

                } else {

                    if (callback) callback(false, 'Wrong status');

                }

            },
            function(error) {
                alert('Some error ocurred (' + error.body + '). Please try again later.');
                console.log('==== FILE TRANSFER ERROR 1 : ');
                console.log(error);
            },
            fileOptions
        );
    },

    doLogin: function() {
        
        var self = this;

        var svcUrl = Travelly.app.getGlobal('svcUrl');
        var authWindow = window.open(svcUrl + '/login', '_blank', 'location=yes');

        authWindow.addEventListener('loadstart', function(e) {

            var url = e.url;
            var token = self.getParam(url, 'token');

            if (token) {
                Travelly.app.setSetting('token', token);
                authWindow.close();
                var loginBtn = self.getLoginBtn();
                var logoutBtn = self.getLogoutBtn();
                loginBtn.setHidden(true);
                logoutBtn.setHidden(false);
            }
        });

    },

    doLogout: function() {
        var self = this;
        Travelly.app.setSetting('token', '');
        var loginBtn = self.getLoginBtn();
        var logoutBtn = self.getLogoutBtn();
        loginBtn.setHidden(false);
        logoutBtn.setHidden(true);
    },

    getParam: function(url, sname) {
        var params = url.substr(url.indexOf("?") + 1);
        var sval = "";
        params = params.split("&");
        // split param and value into individual pieces
        for (var i = 0; i < params.length; i++) {
            temp = params[i].split("=");
            if ([temp[0]] == sname) {
                sval = temp[1];
            }
        }
        return sval;
    }

});