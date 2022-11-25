import {Permissions, check, checkMultiple, request} from '@nativescript-community/perms';
import { AndroidActivityResultEventData, AndroidApplication, Application, Device, Utils } from '@nativescript/core';
const sdkVersion = parseInt(Device.sdkVersion, 10);
export default {
    name: 'Home',
    template: `
    <Page>
      <ActionBar title="Extendedinfo Demo">
      </ActionBar>
      <ListView ref="listView"
          for="perm in permissions"
          rowHeight="70"
          @itemTap="goToExample">
        <v-template>
          <GridLayout  columns="*,auto,auto" padding="10" class="item" orientation="horizontal">
            <Label :text="perm" fontSize="17" verticalAlignment="center"></Label>
            <Button col="1" text="check" fontSize="17" verticalAlignment="center" @tap="checkPermission(perm)"/>
            <Button col="2" text="request" fontSize="17" verticalAlignment="center" @tap="requestPermission(perm)"/>
          </GridLayout>
        </v-template>
      </ListView>
    </Page>
    `,
    data() {
        return {
            permissions: [,'location'
                , 'camera'
                , 'microphone'
                , 'photo'
                , 'contacts'
                , 'event'
                , 'reminder'
                , 'bluetooth'
                , 'bluetoothScan'
                , 'notification'
                , 'backgroundRefresh'
                , 'speechRecognition'
                , 'mediaLibrary'
                , 'motion'
                , 'location'
                , 'callPhone'
                , 'readSms'
                , 'receiveSms'].concat(__ANDROID__?['manageStorage']:[])
        };
    },
    mounted() {
        // worker.onmessage = msg => {
        //     const dict = valueFromPointerNumber(NSDictionary, msg.data.value.dictionaryPtr) as NSDictionary<string, any>;
        //     const type = dict.objectForKey('type') as string;
        //     console.log('postMessageToWorker', type);
        //     switch (type) {
        //         case 'image':
        //             this.showImage(dict.objectForKey('data'));
        //             break;
        //         default:
        //             break;
        //     }
        //     (dict as any).release();
        // };
    },
    methods: {
        async checkPermission(perm: Permissions | 'multiple') {

            try {
                if (perm === 'multiple') {
                    const result = await checkMultiple({'location':{coarse:false, type:'always'},storage:{manage:true}});
                    alert(JSON.stringify(result));

                } else {

                    const result = await check(perm, {type:'none'});
                    alert(JSON.stringify(result));
                }
            } catch(err) {
                console.error(err);
                alert(err);
            }

        },
        async requestPermission(perm: Permissions | 'multiple' | 'manage') {
            try {
                if(perm === 'manage') {
                    this.askForManagePermission();
                }
                else if (perm === 'multiple') {
                    const result = await request({location:{coarse:false},storage:{manage:true}});
                    alert(JSON.stringify(result));
                } else {
                    if (__ANDROID__ && perm === 'notification' ) {
                    // create notification channel
                        if (sdkVersion >= 26) {
                            const context = Utils.ad.getApplicationContext();
                            // API level 26 ("Android O") supports notification channels.
                            const service = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE) as android.app.NotificationManager;

                            // create channel
                            const channel = new android.app.NotificationChannel('test_channel', 'test_channel', android.app.NotificationManager.IMPORTANCE_MIN);
                            channel.setDescription('test');
                            service.createNotificationChannel(channel);
                        }
                    }
                    const result = await request(perm, {type:'always'});
                    alert(JSON.stringify(result));
                }
            } catch(err) {
                console.error(err);
                alert(err);
            }
        },
        async checkManagePermission() {
            if (__ANDROID__) {
                return android.os.Build.VERSION.SDK_INT < 30 || android.os.Environment.isExternalStorageManager();
            }
            return true;
        },
        async askForManagePermission() {
            if (__ANDROID__) {
                const activity = Application.android.startActivity as androidx.appcompat.app.AppCompatActivity;
                if (this.checkManagePermission()) {
                    return true;
                }
                //If the draw over permission is not available open the settings screen
                //to grant the permission.
                return new Promise<boolean>((resolve, reject) => {
                    const REQUEST_CODE = 6646;
                    const onActivityResultHandler = (data: AndroidActivityResultEventData) => {
                        if (data.requestCode === REQUEST_CODE) {
                            Application.android.off(AndroidApplication.activityResultEvent, onActivityResultHandler);
                            resolve(android.provider.Settings.canDrawOverlays(activity));
                        }
                    };
                    Application.android .on(AndroidApplication.activityResultEvent, onActivityResultHandler);
                    const intent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, android.net.Uri.parse('package:' + activity.getPackageName()));
                    activity.startActivityForResult(intent, REQUEST_CODE);
                });
            }
            return true;
        }
    }
};
