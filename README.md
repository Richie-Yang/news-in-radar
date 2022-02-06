# news-in-radar
News-in-radar, the web service which provides latest news for visitors.


## Motivation
I did spend from several months to almost years seting up IT environment at my home, and one thing which always was bugging my mind is the lack of customimzed portal for WiFi entry point. However, if I just simply built plain HTML page, it's going to be boring. So after I got the web-dev skill, the first priority thing for me is to build a WiFi portal which is more than just that. The whole project is to display news contents, and all of them are done automatically. 


## Features
1. Web server automatically retrieve news data from the Internet.
2. All news data are classified into individual category.
3. All news data can be searched through keyword and other options.
4. User can register an account and login to comment/like news.
5. Web server recommends news from similiar news providers.


## Prerequisites
1. Node.js (v14.16.0 is recommended)
2. GitBash or CMder (for Windows) / terminal (for MacOS)


## Installation
1. Open your terminal, then clone the repo to your local.
```
git clone https://github.com/Richie-Yang/news-in-radar.git
```
2. Move to repo directory.
```
cd news-in-radar
```
3. Run the command below to start installing dependencies.
```
npm install
```
4. Create .env file at project root directory
```
touch .env
```
or
```
cp .env.example .env
```
5. Fill out valid string referring to .env.example


## Execution
1. Run below script to add seed data. 

(Every time you run it, the previous seed data will be overwritten)
```
npm run seed
```
2. Start Express server in Node.js env.
```
npm run start
```
or

3. Start Express server in dev mode, which uses nodemon to start server.
```
npm run dev
```
PS: If you don't have nodemon installed, please check [Nodemon](https://www.npmjs.com/package/nodemon) first.


## Usage
1. Open your browser and go to http://127.0.0.1:3000.
2. Click register button to create new account.
3. If you did run 'npm run seed' previously, seed user credentials below are available for use:

First seed user
```
email: user1@example.com
password: 123
```

Second seed user
```
email: user2@example.com
password: 123
```


## All Branches
* 2022/2/6 core-dev


## Contributor
[Richie](https://github.com/Richie-Yang) :wink:
