// // notificationsService.ts
// import * as Notifications from "expo-notifications";
// import { Platform } from "react-native";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export async function registerForPushNotificationsAsync() {
//   let token;

//   if (Device.isDevice) {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       alert("Permissão de notificação negada!");
//       return;
//     }

//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log("Expo Push Token:", token);
//   } else {
//     alert("Notificações só funcionam em dispositivos físicos!");
//   }

//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }

//   return token;
// }
