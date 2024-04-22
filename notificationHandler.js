// notificationHandler.js

// const OneSignal = require('@onesignal/node-onesignal');
import * as OneSignal from '@onesignal/node-onesignal';

async function sendNotification(message, externalUserIds) {
  console.log("hitting notification Router");
  console.log(message);

  const ONESIGNAL_APP_ID = '63fac062-7831-4ccd-b35a-37ed0eaab9bd';
  console.log(ONESIGNAL_APP_ID);
  const REST_API_KEY = 'Zjc4OGVmYWYtMjA2My00NDJlLTg1YTUtZjUxZDBiYWE0Njc3';

  const app_key_provider = {
    getToken() {
      return REST_API_KEY;
    },
  };

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: app_key_provider,
      },
    },
  });

  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = ONESIGNAL_APP_ID;
  // notification.include_player_ids = [mobileNo]; // Use the mobile number as the player ID
//notification.include_external_user_ids = ['+916301295910']; // replace with actual player IDs
  notification.include_external_user_ids = externalUserIds; // replace with actual player IDs

  notification.headings = { en: 'Strange In' };
  // notification.included_segments = ['Subscribed Users'];
  notification.contents = {
    en: message,
  };
  console.log('in chat api iam working');
  console.log(message);

  // try {
  //   const response = await client.createNotification(notification);
  //   console.log(notification);
  //   console.log('Notification created:', response);
  //   return response;
  // //  catch (error) {
  // //   console.error('Error sending notification:', error);

  // //   if (error.body && error.body.errors && error.body.errors.length > 0) {
  // //     console.error('OneSignal Error:', error.body.errors[0].message);
  // //   }

  // //   throw new Error('Internal Server Error');
  // // }
  // } catch (error) {
  //   console.error('Error sending notification:', error);
  
  //   if (error.body && error.body.errors) {
  //     console.error('OneSignal Error:', error.body.errors);
  //   } else {
  //     console.error('Error details:', error);
  //   }
  
  //   throw new Error('Internal Server Error');
  // }
  
  try {
    const response = await client.createNotification(notification);
    console.log('Full API Response:', response);
    console.log('Notification created:', response.body);
    return response.body;
  } catch (error) {
    console.error('Error sending notification:', error);
    if (error.response) {
      console.error('API Response:', error.response);
    }
    throw new Error('Internal Server Error');
  }
}

// module.exports = {
//   sendNotification,
// };
export { sendNotification };
