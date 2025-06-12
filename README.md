# Appointment Portal
 `Descrption and Functions of Application`
 - Three Type of user: user(consumer), provider(producing services) and admin.
 - Users can do login and register base on different role except admin role.
 - user can book, Cancel and track there appointments.
 - Provider can confirm, decline appointments and track the appointments.
 - Provider add avaliable timing and services.
 - Admin can Track all services , give user provider role permission etc.
 
# Tools Used :
    1. UI - Vite, React JS, Router, MUI, Context and Axios.
    2. Backend - Node JS, Express JS, CORS, bcryptjs, mongoose, express-rate-limit.

#  Prerequisites
- Node JS (18 or higher)
- MongoDB (local instance or cloud connection)
- Git

# Project Structure 
- APPOINTMENT-BOOKING
    -   client
            -appointment-portal-client
                - rest ui folders and files

    - server
        - createAdmin.js
        - rest backend folders and files
    
    - README.MD

# Setup Instructions
#### 1. Clone this repository
    - git clone https://github.com/aniketsinha30/appointment-portal.git
#### 2. Backend Setup
    - cd server 
    - npm install
    - create "doctor_appointment" database in mongoDB 
    - create .env file 
        - In env file add these 
            - MONGO_URI= 'mongo-connecting-string'/doctor_appointment 
            - PORT=8000
            - JWT_SECRET=supersecurejwtsecret
            - JWT_EXPIRE=7d
    - Now run the "createAdmin.js" script , To create admin user in database.
        - cd server
        - node createAdmin.js
    - To run backend server
        - npm run start or npm run dev (using nodemon)
    -  `Now server is live on port 8000`

#### 3. UI Setup
    - cd .\client\appointment-portal-client\
    - npm install 
    - npm run dev 
    - 'Now UI is live on port 5173 or default port'
