export const RegisterInjection = (platform=false,expo=false,deviceToken=false,model=false,brand=false,os=false,manufacturer=false) => `
    (function() {
        const form = document.getElementById('register-form');
        if (form) {
            if ('${platform}') {
                const platformField = document.createElement('input');
                platformField.type = 'hidden';
                platformField.name = 'Platform';
                platformField.value = '${platform}';
                form.appendChild(platformField);
            }

            if ('${expo}') {
                const expoField = document.createElement('input');
                expoField.type = 'hidden';
                expoField.name = 'Expo';
                expoField.value = '${expo}';
                form.appendChild(expoField);
            }

            if ('${platform}' === 'android' && '${deviceToken}') {
                const fcmField = document.createElement('input');
                fcmField.type = 'hidden';
                fcmField.name = 'Fcm';
                fcmField.value = '${deviceToken}';
                form.appendChild(fcmField);
            } 
            
            else if ('${platform}' === 'ios' && '${deviceToken}') {
                const apnField = document.createElement('input');
                apnField.type = 'hidden';
                apnField.name = 'Apn';
                apnField.value = '${deviceToken}';
                form.appendChild(apnField);
            }

            if ('${model}') {
                const deviceModelField = document.createElement('input');
                deviceModelField.type = 'hidden';
                deviceModelField.name = 'DeviceModel';
                deviceModelField.value = '${model}';
                form.appendChild(deviceModelField);
            }

            if ('${brand}') {
                const deviceBrandField = document.createElement('input');
                deviceBrandField.type = 'hidden';
                deviceBrandField.name = 'DeviceBrand';
                deviceBrandField.value = '${brand}';
                form.appendChild(deviceBrandField);
            }

            if ('${os}') {
                const deviceOs = document.createElement('input');
                deviceOs.type = 'hidden';
                deviceOs.name = 'DeviceOs';
                deviceOs.value = '${os}';
                form.appendChild(deviceOs);
            }

            if ('${manufacturer}') {
                const deviceManufacturer = document.createElement('input');
                deviceManufacturer.type = 'hidden';
                deviceManufacturer.name = 'DeviceManufacturer';
                deviceManufacturer.value = '${manufacturer}';
                form.appendChild(deviceManufacturer);
            }
        }
        return true;
    })();
`;

export const LoginInjection = (platform=false,expo=false,deviceToken=false,model=false,brand=false,os=false,manufacturer=false) => `
    (function() {
        const form = document.getElementById('login-form');
        if (form) {
            if ('${platform}') {
                const platformField = document.createElement('input');
                platformField.type = 'hidden';
                platformField.name = 'Platform';
                platformField.value = '${platform}';
                form.appendChild(platformField);
            }

            if ('${expo}') {
                const expoField = document.createElement('input');
                expoField.type = 'hidden';
                expoField.name = 'Expo';
                expoField.value = '${expo}';
                form.appendChild(expoField);
            }

            if ('${platform}' === 'android' && '${deviceToken}') {
                const fcmField = document.createElement('input');
                fcmField.type = 'hidden';
                fcmField.name = 'Fcm';
                fcmField.value = '${deviceToken}';
                form.appendChild(fcmField);
            } 
            
            else if ('${platform}' === 'ios' && '${deviceToken}') {
                const apnField = document.createElement('input');
                apnField.type = 'hidden';
                apnField.name = 'Apn';
                apnField.value = '${deviceToken}';
                form.appendChild(apnField);
            }

            if ('${model}') {
                const deviceModelField = document.createElement('input');
                deviceModelField.type = 'hidden';
                deviceModelField.name = 'DeviceModel';
                deviceModelField.value = '${model}';
                form.appendChild(deviceModelField);
            }

            if ('${brand}') {
                const deviceBrandField = document.createElement('input');
                deviceBrandField.type = 'hidden';
                deviceBrandField.name = 'DeviceBrand';
                deviceBrandField.value = '${brand}';
                form.appendChild(deviceBrandField);
            }

            if ('${os}') {
                const deviceOs = document.createElement('input');
                deviceOs.type = 'hidden';
                deviceOs.name = 'DeviceOs';
                deviceOs.value = '${os}';
                form.appendChild(deviceOs);
            }

            if ('${manufacturer}') {
                const deviceManufacturer = document.createElement('input');
                deviceManufacturer.type = 'hidden';
                deviceManufacturer.name = 'DeviceManufacturer';
                deviceManufacturer.value = '${manufacturer}';
                form.appendChild(deviceManufacturer);
            }
        }
        return true;
    })();
`;

export const LogoutInjection = (platform=false,expoToken=false,deviceToken=false) => `
    (function() {
        let url = '/logout';

        if ('${platform}' === 'android' && '${deviceToken}') {
            url += '?fcm=${deviceToken}';
        } 
        
        else if ('${platform}' === 'ios' && '${deviceToken}') {
            url += '?apn=${deviceToken}';
        }

        if ('${expoToken}') {
            url += (url.includes('?') ? '&' : '?') + 'et=${expoToken}';
        }

        document.getElementById('logout-link').addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = url;
        });

        return true;
    })();
`;

export const ImageFileInjection = () => `
    document.querySelector('input[type=file]').addEventListener('change', function() { 
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'file' })); 
    }); true;
`;

export const ConsoleLogInjection = () => `
    (function() {
        const originalConsoleLog = console.log;
        console.log = function(...args) {
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', args }));
        } catch (e) {
            // Handle any errors that occur during postMessage
            originalConsoleLog('Error posting message to React Native WebView:', e);
        }
        originalConsoleLog(...args);
        };
  })();
`;