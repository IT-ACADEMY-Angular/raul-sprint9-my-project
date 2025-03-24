# Sprint 9 IT Academy | Angular

## 📄 Descripción

Práctica donde el objetivo principal era hacer una App (Back + Front) con un tema de libre elección: 

- Había que cumplir una pautas que pactaba el ejercicio

## 📋 Requisitos

- Npm instalado en tu sistema.
- Node instalado en tu sistema.
- ANGULAR CLI instalado en tu sistema.
- Visual Studio Code (Recomendado).
- MySQL Workbench (Recomendado).
- NESTjs instalado en tu sistema.

## 🛠️ Instalación

1️⃣ Clona este repositorio
```bash
$ git clone https://github.com/IT-ACADEMY-Angular/raul-sprint9-my-project.git
```

2️⃣ Unlink el repositorio para no modificar mi trabajo.

```bash
$ git remote rm origin
```

3️⃣ Abrimos MySQL Workbench, importante crear una base de datos vacía que se llame "zytapp", el backend se encargará de ir creando las tablas cuando sea necesario.

4️⃣ Instala las dependencias con npm (tanto el front como el back). Primero instalamos y iniciamos el Backend:

🟢 Con el proyecto clonado en Visual, entramos en una terminal, entramos en la carpeta de -> backend <- (IMPORTANTE!! La instalacion de dependencias de back y front, tiene que ser en sus respectivas carpetas!) y hacemos el comando:

```bash
$ npm install
```

🟢 Una vez instaladas, en la misma terminal, iniciamos el servidor backend utilizando el comando:

```bash
$ npm run start:dev
```

5️⃣ Ahora vamos a instalar y iniciar el FrontEnd . En otra terminal, entramos en la carpeta de -> frontend <- y hacemos el comando:

```bash
$ npm install
```

🟢 Inicializar el servidor FrontEnd para ver la web, desde terminal en la carpeta frontend

```bash
$ ng serve -o
```

🟢 Ya lo tienes todo LISTO! Disfruta de mi proyecto final: ZYTAPP !!

## 💻 Tecnologías y Recursos Utilizados

- ANGULAR
- TYPESCRIPT
- HTML
- CSS
- BOOTSTRAP
- RXJS
- ROUTES
- NESTJS
- MYSQL
- MATERIAL DESIGN
- GUARDS
- FONTAWESOME
- FORMS
- TYPEORM

## ✨ Características

- ZYTAPP es una APP que simula una "Agenda Virtual".
- Un usuario debe registrarse para poder pedir citas.
- Un usuario podrá crear una empresa en ZYTAPP para que el resto de usuarios puedan pedir "cita" en ésta empresa.
- El dueño de una empresa podrá manipular y observar las citas que tiene en ésta misma.