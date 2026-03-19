<div align="center">

# 🔗 Nexo

**Aplicación móvil de mensajería y conexión social**

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=for-the-badge)](https://github.com/seba-evng/Nexo)
[![Versión](https://img.shields.io/badge/versión-1.0.0-blue?style=for-the-badge)](https://github.com/seba-evng/Nexo/releases)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> ⚠️ **Proyecto en desarrollo activo** — Última actualización: 19 de marzo de 2026

</div>

---

## 📖 Descripción

**Nexo** es una aplicación móvil multiplataforma (iOS y Android) construida con React Native y Expo. Su objetivo es conectar personas a través de mensajería en tiempo real, ofreciendo una experiencia fluida, moderna y segura. El proyecto integra autenticación robusta mediante Supabase y una interfaz de usuario cuidada con animaciones y diseño adaptativo.

---

## ✨ Características

| Funcionalidad | Estado |
|---|---|
| 🔐 Registro e inicio de sesión | ✅ Implementado |
| 📧 Verificación de correo electrónico | ✅ Implementado |
| 🎉 Pantalla de onboarding | ✅ Implementado |
| 💬 Chat en tiempo real | 🚧 En desarrollo |
| 🧭 Navegación por pestañas | ✅ Implementado |
| 🌗 Tema claro / oscuro | ✅ Implementado |
| 📱 Soporte para iOS, Android y Web | ✅ Implementado |

---

## 🛠️ Tecnologías

<div align="center">

| Categoría | Tecnología |
|---|---|
| Framework | [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Navegación | [Expo Router](https://expo.github.io/router/) (file-based routing) |
| Backend / Auth | [Supabase](https://supabase.com/) |
| Estado global | [Zustand](https://zustand-demo.pmnd.rs/) |
| Validación | [Zod](https://zod.dev/) |
| Animaciones | [Lottie](https://airbnb.io/lottie/) + [Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Iconos | [Lucide React Native](https://lucide.dev/) + [@expo/vector-icons](https://docs.expo.dev/guides/icons/) |
| Gestos | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |

</div>

---

## 🚀 Cómo empezar

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- [Expo Go](https://expo.dev/go) en tu dispositivo móvil *(opcional, para pruebas rápidas)*

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/seba-evng/Nexo.git
cd Nexo

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npx expo start
```

Desde la terminal podrás abrir la app en:

- 📱 **Expo Go** — escanea el QR con tu dispositivo
- 🤖 **Android Emulator** — presiona `a`
- 🍎 **iOS Simulator** — presiona `i`
- 🌐 **Navegador Web** — presiona `w`

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📁 Estructura del proyecto

```
Nexo/
├── app/                    # Rutas de la aplicación (Expo Router)
│   ├── (tabs)/             # Pantallas con navegación por pestañas
│   ├── chat/               # Pantallas de chat
│   ├── login.tsx           # Pantalla de inicio de sesión
│   ├── register.tsx        # Pantalla de registro
│   ├── verify-email.tsx    # Verificación de correo
│   └── onboarding.tsx      # Pantalla de onboarding
├── src/
│   ├── modules/
│   │   ├── auth/           # Lógica, pantallas y servicios de autenticación
│   │   └── chat/           # Lógica, componentes y servicios de chat
│   ├── lib/                # Utilidades y configuración (Supabase, etc.)
│   ├── store/              # Estado global (Zustand)
│   └── types/              # Definiciones de tipos TypeScript
├── assets/                 # Imágenes, fuentes e iconos
├── app.json                # Configuración de Expo
└── package.json
```

---

## 🔧 Scripts disponibles

```bash
npm start              # Inicia el servidor de desarrollo Expo
npm run android        # Abre en Android Emulator
npm run ios            # Abre en iOS Simulator
npm run web            # Abre en el navegador
npm run lint           # Ejecuta ESLint
npm run reset-project  # Reinicia el proyecto a su estado inicial
```

---

## 🗺️ Roadmap

- [x] Autenticación (registro, login, verificación de email)
- [x] Onboarding
- [x] Navegación base con pestañas
- [ ] Chat en tiempo real con WebSockets (Supabase Realtime)
- [ ] Perfiles de usuario
- [ ] Notificaciones push
- [ ] Búsqueda de usuarios
- [ ] Grupos y canales

---

## 🚧 Estado del proyecto

> **Este proyecto se encuentra actualmente en desarrollo activo.**
>
> Se están implementando nuevas funcionalidades de forma continua. Algunos módulos pueden estar incompletos o sujetos a cambios importantes.
>
> 📅 Fecha de referencia: **19 de marzo de 2026**

---

## 📄 Licencia

Este proyecto es publico. Todos los derechos reservados © 2026 [seba-evng](https://github.com/seba-evng).

---

<div align="center">
  Hecho con ❤️ usando <a href="https://expo.dev/">Expo</a> y <a href="https://supabase.com/">Supabase</a>
</div>
