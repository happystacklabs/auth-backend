<img src=".github/happystack.png" alt="Happystack" width="150" height="150" />

# Happystack Backend Boilerplate
![Version](https://img.shields.io/badge/Version-0.3.0-green.svg?style=flat)
![license](https://img.shields.io/github/license/mashape/apistatus.svg)


#### Express backend that goes along Happystack Frontend Boilerplate.


## 🔧 Installation
### Step 1
Clone the [repository](https://github.com/happystacklabs/backend-boilerplate) on your computer
```
git clone git@github.com:happystacklabs/backend-boilerplate.git
```

## Step 2
Create the `.env` file in the project root by renaming `.env-example` and updating
the file with your own values.

### Step 3
Install the dependencies by running `npm install`

### Step 4
Create your new repository for the project on [Github](https://github.com/).

Git init at the root of your project folder that you cloned `git init`.

Add changes `git add .`

Do your first commit `git commit -m "first commit"`

Add the remote `git remote add origin REPO-URL`

And push `git push -u origin master`

### Step 5
Create the app on [Heroku](https://dashboard.heroku.com/new-app).

Then add Heroku to remote `heroku git:remote -a APP-NAME`.

And push to Heroku `git push heroku master`.

### Step 6
Set the environment variable on the Heroku app with the production values found
in the `.env` file.

Also add the MongoDB Lab plugin for setting up the production
database.

You might also setup your custom domain in the dashboard that will be
used by the frontend application EX: api.example.com.


## 🕹 Usage
Start the [MongoDB](https://www.mongodb.com/) database before launching the backend:
```
mongod
```

Start in another Terminal tab the local server:
```
npm run dev
```

### API
#### Users
**Create new user**
```
/**
 * POST: /api/users
 */
```

**Login**
```
/**
 * POST: /api/users/login
 */
```

**Get current user**
```
/**
 * GET: /api/user
 * Authentification required
 */
 ```

 **Update user**
 ```
 /**
  * PUT: /api/user
  * Authentification required
  */
```

**Forgot password**
```
/**
 * POST: /api/users/forgot
 */
```

**Reset password**
```
/**
 * POST: /api/users/reset
 */
```

## 🚀 Deployment


## 📄 Licenses
* Source code is licensed under [MIT](https://opensource.org/licenses/MIT)


## 💡 Feedback
[Create an issue or feature request](https://github.com/happystacklabs/backend-boilerplate/issues/new).
