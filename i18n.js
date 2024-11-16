import { I18n } from "i18n-js";
import translations from "./translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const i18n = new I18n(translations);

i18n.defaultLocale = "English";
i18n.fallbacks = true;

export const setLocale = async (locale) => {
  i18n.locale = locale;
  await AsyncStorage.setItem("userLocale", locale);
};

export const loadLocale = async () => {
  const savedLocale = await AsyncStorage.getItem("userLocale");
  i18n.locale = savedLocale || i18n.defaultLocale;
};

export const t = (key) => i18n.t(key);

export default i18n;