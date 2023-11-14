# VacationMailBot 

## Steps to run:
1. Open postman or insomnia
2. copy the project url provided above and use it as base url to run all the routes 

## Steps to install:

1. Clone the repo using  ```git clone https://github.com/Iammukundbajpai/VacationMailBot```
2. Open the project in VS Code and install all the dependencies using ```npm install```
3. Create a .env file and save PORT variable and Connect with Gmail API and get The Credentials.
4. Once the dependencies are installed start the server using  ```npm start```

Libraries and Technologies Used

# Express.js  
- Framework for handling web server functionalities and routing.
Usage: Creating endpoints for API interactions.

# @google-cloud/local-auth 
- Authentication module for obtaining access to Google APIs.
Usage: user authentication and obtaining necessary permissions to access the Gmail API.

# googleapis
- Provides an interface to work with various Google APIs.
Usage: Specifically used to interact with the Gmail API for tasks such as retrieving messages, modifying labels, and sending auto-replies.

# path
- Module for handling file paths in Node.js.
Usage: Constructing file paths, such as locating the credentials file required for authentication.
