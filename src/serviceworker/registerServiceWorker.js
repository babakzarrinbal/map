/* eslint-disable no-console */

import { register } from "register-service-worker";

const applicationServerPublicKey =
  "BJIGTwPsHQ_J1Yg_9xbUDLnrz_jTq8-nDxuU3_nXPF7-DNU645CLMBsrm73g6HefM74RSTjtLr2upgWKQ30SFLk";
var swRegistration = null;
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function storeSubscriptionInfo(subscription) {
  window.localStorage.setItem("pushcre", JSON.stringify(subscription));
  // window.localStorage.setItem("pushcresaved", null);
  window.location.reload(true);
}

window.subscribeUser = function subscribeUser() {
  return new Promise(function(resolve) {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      .then(function(subscription) {
        storeSubscriptionInfo(subscription);
        resolve(subscription);
      })
      .catch(function(err) {
        console.log("Failed to subscribe the user: ", err);
        window.toastr.error(
          "you should allow permission for push notification",
          "Permission required!!!",
          {
            closeButton: true,
            positionClass: "toast-top-full-width",
            timeOut: 0,
            extendedTimeOut: 0,
          }
        );
        return resolve(null);
      });
  });
};

let deferredPrompt;
window.propforinstall = null;
if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    registered(swreg) {
      swRegistration = swreg;
    },
  });
  if((window.navigator ||{}).serviceWorker){
    window.navigator.serviceWorker.ready.then(function() {
      window.addEventListener("beforeinstallprompt", e => {
        // console.log(e);
        e.preventDefault();
        deferredPrompt = e;
        window.propforinstall = () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === "accepted") {
              window.subscribeUser();
            }
            deferredPrompt = null;
          });
        };
      });
    });

  }
}
