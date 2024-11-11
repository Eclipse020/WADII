# frontend

## Project setup
```
Ensure you have the latest Node.js and npm versions

npm install vue-router@4
npm install firebase
npm install -g firebase-tools
npm install @google/generative-ai
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Firebase Authentication
If running on localhost, Firebase Authentication OAuth works as it is already registered. If deploying again to Vercel, will need to register domain name into Firebase Authentication.

### Testing User Credentials
Email & Password (this is a new, unregistered account that you may use to test the registration & login):
Email: testinguser123@gmail.com
Password: testinguser123
OR
Google OAuth:
Email: wadgrp5@gmail.com
Password: WadGrp5T2!

### Deployment Steps
1. Register account on Vercel and follow Vercel's instructions to link repository and deploy production channel using main branch
2. Add domain to Firebase Authentication to allow Google OAuth
3. Edamam API Key should last until Week 18 but if there are any issues, do let G1_T5_HealthyChef know.
