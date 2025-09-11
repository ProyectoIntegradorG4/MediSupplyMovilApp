
## Creación del proyecto

El proyecto se creó con el siguiente comando:

```sh
yarn create expo-app <nombre de la app>
```

## 🔹 Comandos principales con Yarn

En proyectos **React Native con Expo**, cuando usas **Yarn** tienes varios comandos disponibles en tu `package.json`.

### 1. **Desarrollo (modo live reload):**

```bash
yarn start
```

👉 Esto abre el servidor de desarrollo de Expo con recompilación automática en cada cambio. Puedes escanear el QR desde Expo Go en tu dispositivo móvil.

### 2. **Limpiar cache y reiniciar:**

```bash
yarn start --clear
```

👉 Útil cuando tienes errores de cache o cambios que no se reflejan correctamente.

### 3. **Compilar para diferentes plataformas:**

```bash
# Para Android (APK de desarrollo)
yarn android

# Para iOS (requiere macOS y Xcode)
yarn ios

# Para web
yarn web
```

### 4. **Build para producción:**

```bash
# Build optimizado
npx expo build

# O con EAS Build (recomendado)
npx eas build
```

👉 Estos comandos generan aplicaciones optimizadas y listas para distribución en las tiendas de aplicaciones.

### 5. **Previsualizar en web:**

```bash
yarn web
```

👉 Ejecuta tu app React Native en el navegador para pruebas rápidas de UI.

---

## Expo SDK 53 requiere React Native 0.79.x — normalmente 0.79.0 o 0.79.5.

Si tu proyecto está en 0.79.6, por lo que hay un desajuste.

Corrígelo con:
```bash
npx expo install react-native
```

Así seguro que estarás alineado y evitas problemas.

## Correccion de FIX por versiones 

en ocaciones estamos trabaajndo e instalamos algunas versiones o paquetes que no son compatibles y este par de instrucciones ajustan eso 

```bash
npx expo install --fix
```

```bash
npx expo start --clear
```

---

## 🔹 Diferencias importantes

* `yarn start` → desarrollo, recompila en caliente al guardar
* `yarn start --clear` → limpia cache y reinicia el servidor  
* `yarn android/ios` → compila y ejecuta en emuladores/dispositivos
* `npx expo build` → compila para producción (tiendas de apps)
* `yarn web` → ejecuta la versión web de tu app

---

⚡ **En resumen:**
👉 Para desarrollo diario usa: `yarn start`
👉 Para limpiar problemas: `yarn start --clear`
👉 Para producción: `npx eas build`

## Documentación

Estamos siguiendo la documentación oficial de Expo:

- [Expo Documentation](https://docs.expo.dev/versions/latest/)

---



# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
