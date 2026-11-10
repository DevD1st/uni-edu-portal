export const themeStorageKey = "uemp:theme:v1";

export const themeInitScript =
  'try{var t=localStorage.getItem("uemp:theme:v1");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}';
